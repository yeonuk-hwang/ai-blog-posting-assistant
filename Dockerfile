FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run --filter server build
RUN pnpm deploy --filter=server --prod /prod/server

FROM base AS server
RUN apk add --no-cache curl
COPY --from=build /prod/server /prod/server
WORKDIR /prod/server
CMD [ "pnpm", "start:prod" ]
