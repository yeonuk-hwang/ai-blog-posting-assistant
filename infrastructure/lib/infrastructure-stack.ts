import * as cdk from "aws-cdk-lib";
import * as ecr from "aws-cdk-lib/aws-ecr";
import { Construct } from "constructs";

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

    new cdk.CfnOutput(this, "server-image-repository-uri", {
      value: serverImageRepository.repositoryUri,
    });
  }
}
