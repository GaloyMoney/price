import pino from "pino"
import * as grpc from "@grpc/grpc-js"

import { protoDescriptorPrice, protoDescriptorHealth } from "@servers/grpc"

const logger = pino({
  level: process.env.LOGLEVEL || "info",
})

const client = new protoDescriptorPrice.PriceFeed(
  "localhost:50051",
  grpc.credentials.createInsecure(),
)

const client2 = new protoDescriptorHealth.grpc.health.v1.Health(
  "localhost:50051",
  grpc.credentials.createInsecure(),
)

client.listCurrencies({}, callback)
client.getPrice({}, callback)

client.getPrice({ currency: "EUR" }, callback)
client.getPrice({ currency: "USD" }, callback)

function callback(err, data) {
  if (err) {
    logger.error({ err })
    return
  }
  logger.info({ data })
}

client2.check({}, healthCallback)

function healthCallback(err, data) {
  if (err) {
    logger.error({ err })
    return
  }
  logger.info(data)
}
