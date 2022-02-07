FROM node:16-alpine AS BUILD_IMAGE

RUN apk update && apk add python3 make g++

WORKDIR /app
COPY ./*.json ./yarn.lock ./

RUN yarn install --frozen-lockfile
COPY ./src ./src
RUN yarn build

RUN rm -rf /app/node_modules
RUN yarn install --frozen-lockfile --production

FROM gcr.io/distroless/nodejs:16
COPY --from=BUILD_IMAGE /app/lib /app/lib
COPY --from=BUILD_IMAGE /app/node_modules /app/node_modules

WORKDIR /app
COPY ./*.json ./*.js ./*.yaml ./yarn.lock ./

RUN GRPC_HEALTH_PROBE_VERSION=v0.3.6 && \
    wget -qO/bin/grpc_health_probe https://github.com/grpc-ecosystem/grpc-health-probe/releases/download/${GRPC_HEALTH_PROBE_VERSION}/grpc_health_probe-linux-amd64 && \
    chmod +x /bin/grpc_health_probe

USER 1000

ARG BUILDTIME
ARG COMMITHASH
ENV BUILDTIME ${BUILDTIME}
ENV COMMITHASH ${COMMITHASH}

EXPOSE 9464
EXPOSE 50051

CMD ["lib/servers/realtime/run-monitoring.js"]
