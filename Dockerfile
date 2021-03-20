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

EXPOSE 9464
EXPOSE 50051

CMD yarn ts-node src/monitoring.ts