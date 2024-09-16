FROM node:20-alpine AS build_image

RUN apk update && apk add python3 make g++

WORKDIR /app
COPY ./*.json ./yarn.lock ./
COPY ./realtime ./realtime/
## COPY ./ibex-client-1.0.1.tgz ./realtime

RUN cd ./realtime && yarn add ./ibex-client-1.0.1.tgz
RUN yarn install 
RUN yarn workspace realtime build

RUN rm -rf /app/node_modules
RUN rm -rf /app/realtime/node_modules
RUN yarn install --production

FROM node:20-alpine
COPY --from=build_image /app/realtime/dist /app
COPY --from=build_image /app/node_modules /app/node_modules
COPY --from=build_image /app/realtime/node_modules /app/node_modules

WORKDIR /app
COPY ./realtime/package.json ./realtime/*.yaml ./

RUN GRPC_HEALTH_PROBE_VERSION=v0.4.7 && \
    wget -qO/bin/grpc_health_probe https://github.com/grpc-ecosystem/grpc-health-probe/releases/download/${GRPC_HEALTH_PROBE_VERSION}/grpc_health_probe-linux-amd64 && \
    chmod +x /bin/grpc_health_probe

USER 1000

ARG BUILDTIME
ARG COMMITHASH
ENV BUILDTIME=${BUILDTIME}
ENV COMMITHASH=${COMMITHASH}

EXPOSE 9464
EXPOSE 50051

CMD ["servers/realtime/run-monitoring.js"]
