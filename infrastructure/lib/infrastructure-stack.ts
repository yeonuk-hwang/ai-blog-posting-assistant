import * as cdk from "aws-cdk-lib";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as elb from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as asg from "aws-cdk-lib/aws-autoscaling";
import * as logs from "aws-cdk-lib/aws-logs";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cloudfrontOrigins from "aws-cdk-lib/aws-cloudfront-origins";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import { Construct } from "constructs";

enum SUBNET_GROUP {
  PUBLIC = "PUBLIC_SUBNET",
  APP = "APP_SUBNET",
  DB = "DB_SUBNET",
  SPARE = "SPARE_SUBNET",
}

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const serverImageRepository = new ecr.Repository(
      this,
      "server-repository",
      {
        repositoryName: "server",
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      },
    );

    const bucket = new s3.Bucket(this, "web", {
      bucketName: "web-ai-blog-posting",
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      publicReadAccess: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const distribution = new cloudfront.Distribution(this, "web-distribution", {
      defaultBehavior: {
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        compress: true,
        origin: new cloudfrontOrigins.S3Origin(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
      },
      defaultRootObject: "index.html",
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2019,
    });

    new cdk.CfnOutput(this, "server-image-repository-uri", {
      value: serverImageRepository.repositoryUri,
    });

    const vpc = new ec2.Vpc(this, "VPC", {
      ipAddresses: ec2.IpAddresses.cidr("10.16.0.0/16"),
      maxAzs: 3,
      subnetConfiguration: [
        {
          cidrMask: 20,
          name: SUBNET_GROUP.PUBLIC,
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 20,
          name: SUBNET_GROUP.APP,
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 20,
          name: SUBNET_GROUP.DB,
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
        {
          cidrMask: 20,
          name: SUBNET_GROUP.SPARE,
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    // ECS 클러스터 생성
    const cluster = new ecs.Cluster(this, "ecs-cluster", {
      vpc,
    });

    // Auto Scaling Group 생성
    const autoScalingGroup = new asg.AutoScalingGroup(
      this,
      "auto-scaling-group",
      {
        vpc,
        vpcSubnets: {
          subnetGroupName: SUBNET_GROUP.APP,
        },
        instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.T3,
          ec2.InstanceSize.MICRO,
        ),
        minCapacity: 1,
        maxCapacity: 2,
        machineImage: ecs.EcsOptimizedImage.amazonLinux2(), // ECS 최적화 AMI
        associatePublicIpAddress: true,
      },
    );

    const provider = new ecs.AsgCapacityProvider(
      this,
      "asg-capacity-provider",
      {
        autoScalingGroup: autoScalingGroup,
        enableManagedScaling: true,
      },
    );

    // ECS 클러스터에 EC2 인스턴스 추가
    cluster.addAsgCapacityProvider(provider);

    // ECS 태스크 정의 생성
    const taskDefinition = new ecs.Ec2TaskDefinition(
      this,
      "api-task-definition",
      {
        networkMode: ecs.NetworkMode.BRIDGE,
      },
    );

    // 로그 그룹 생성
    const logGroup = new logs.LogGroup(this, "api-task-log-group", {
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const openAIAPIKeySecret = new secretsmanager.Secret(
      this,
      "openai-api-key",
      {
        secretName: "apiKey",
      },
    );

    // ECR 이미지를 사용하는 컨테이너 추가
    const container = taskDefinition.addContainer("api-container", {
      image: ecs.ContainerImage.fromEcrRepository(
        serverImageRepository,
        "latest",
      ),
      memoryLimitMiB: 800,
      logging: ecs.LogDrivers.awsLogs({
        logGroup,
        streamPrefix: "server",
      }),
      environment: {
        PORT: "80",
        FRONT_DOMAIN: distribution.distributionDomainName,
      },
      secrets: {
        OPENAI_API_KEY: ecs.Secret.fromSecretsManager(openAIAPIKeySecret),
      },
      healthCheck: {
        command: ["CMD-SHELL", "curl -f http://localhost:80/health || exit 1"],
      },
    });

    container.addPortMappings({ containerPort: 80 });

    // 로드 밸런서 생성
    const loadBalancer = new elb.ApplicationLoadBalancer(
      this,
      "application-load-balancer",
      {
        vpc,
        internetFacing: true,
        vpcSubnets: {
          subnetGroupName: SUBNET_GROUP.PUBLIC,
        },
      },
    );

    loadBalancer.addListener("HTTP-redirect-listener", {
      port: 80,
      defaultAction: elb.ListenerAction.redirect({
        protocol: "HTTPS",
        port: "443",
        permanent: true,
      }),
    });

    const certificate = acm.Certificate.fromCertificateArn(
      this,
      "Certificate",
      "arn:aws:acm:ap-northeast-2:039612868644:certificate/64d52ab5-283d-4cb8-abf4-5b8c8bcb4cf2",
    );

    const listener = loadBalancer.addListener("HTTPS-listener", {
      port: 443,
      certificates: [certificate],
    });

    // ECS 서비스 생성
    const ecsService = new ecs.Ec2Service(this, "ecs-service", {
      cluster,
      taskDefinition,
      desiredCount: 1,
      capacityProviderStrategies: [
        { capacityProvider: provider.capacityProviderName, weight: 1 },
      ],
    });

    listener.addTargets("api-tasks", {
      port: 80,
      targets: [ecsService],
      healthCheck: {
        path: "/health",
      },
    });

    autoScalingGroup.connections.allowFrom(loadBalancer, ec2.Port.allTcp());
  }
}
