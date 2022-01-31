import pino from "pino"
import * as grpc from "@grpc/grpc-js"

import { protoDescriptor, protoDescriptorHealth } from "@src/grpc"

const logger = pino({
  level: process.env.LOGLEVEL || "info",
})

const client = new protoDescriptor.PriceFeed(
  "localhost:50051",
  grpc.credentials.createInsecure(),
)

const client2 = new protoDescriptorHealth.grpc.health.v1.Health(
  "localhost:50051",
  grpc.credentials.createInsecure(),
)

client.getPrice({}, callback)

function callback(err, { price }) {
  if (err) {
    logger.error({ err })
    return
  }
  logger.info({ price })
}

client2.check({}, healthCallback)

function healthCallback(err, { status }) {
  if (err) {
    logger.error({ err })
    return
  }
  logger.info({ status })
}
