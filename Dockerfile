FROM node:16-bullseye AS BUILD_IMAGE

RUN apt-get update && apt-get install -y \
  make git curl python3 jq rsync wget ca-certificates gnupg lsb-release

RUN GRPC_HEALTH_PROBE_VERSION=v0.3.6 && \
    wget -qO/bin/grpc_health_probe https://github.com/grpc-ecosystem/grpc-health-probe/releases/download/${GRPC_HEALTH_PROBE_VERSION}/grpc_health_probe-linux-amd64 && \
    chmod +x /bin/grpc_health_probe

WORKDIR /app
COPY ./*.json ./yarn.lock ./

RUN yarn install --frozen-lockfile
COPY ./src ./src
RUN yarn build

RUN yarn install --frozen-lockfile --production

FROM node:16-bullseye
COPY --from=BUILD_IMAGE /app/lib /app/lib
COPY --from=BUILD_IMAGE /app/node_modules /app/node_modules

WORKDIR /app
COPY ./*.json ./*.js ./*.yaml ./yarn.lock ./

USER 1000

ARG BUILDTIME
ARG COMMITHASH
ENV BUILDTIME ${BUILDTIME}
ENV COMMITHASH ${COMMITHASH}

EXPOSE 9464
EXPOSE 50051

CMD ["node", "lib/monitoring.js"]
