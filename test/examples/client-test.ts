import pino from "pino"
import * as grpc from "@grpc/grpc-js"

import { protoDescriptor, protoDescriptorHealth } from "@servers/grpc"

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

client.getPrice({ currency: "CRC" }, callback)

function callback(err, data) {
  if (err) {
    logger.error({ err })
    return
  }
  logger.info({ data })
}

client2.check({}, healthCallback)

function healthCallback(err, { status }) {
  if (err) {
    logger.error({ err })
    return
  }
  logger.info({ status })
}
