FROM node:14-alpine AS BUILD_IMAGE

WORKDIR /usr/app

RUN apk update && apk add git

COPY ./package.json ./tsconfig.json ./yarn.lock ./

RUN yarn install --frozen-lockfile

FROM node:14-alpine

RUN apk update && apk add curl

WORKDIR /usr/app

COPY --from=BUILD_IMAGE /usr/app/node_modules ./node_modules

COPY ./package.json ./tsconfig.json ./yarn.lock ./
COPY "./src/" "./src"

RUN GRPC_HEALTH_PROBE_VERSION=v0.3.6 && \
    wget -qO/bin/grpc_health_probe https://github.com/grpc-ecosystem/grpc-health-probe/releases/download/${GRPC_HEALTH_PROBE_VERSION}/grpc_health_probe-linux-amd64 && \
    chmod +x /bin/grpc_health_probe

EXPOSE 9464
EXPOSE 50051

CMD yarn ts-node src/monitoring.ts