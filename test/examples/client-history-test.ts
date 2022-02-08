import pino from "pino"
import * as grpc from "@grpc/grpc-js"

import { protoDescriptorPrice, protoDescriptorHealth } from "@servers/grpc"

const logger = pino({
  level: process.env.LOGLEVEL || "info",
})

const client = new protoDescriptorPrice.PriceHistory(
  "localhost:50052",
  grpc.credentials.createInsecure(),
)

const client2 = new protoDescriptorHealth.grpc.health.v1.Health(
  "localhost:50052",
  grpc.credentials.createInsecure(),
)

client.listPrices({ range: "OneDay" }, callback("OneDay"))
client.listPrices({ range: "OneWeek" }, callback("OneWeek"))
client.listPrices({ range: "OneMonth" }, callback("OneMonth"))
client.listPrices({ range: "OneYear" }, callback("OneYear"))
client.listPrices({ range: "FiveYears" }, callback("FiveYears"))

function callback(label) {
  return (err, data) => {
    if (err) {
      logger.error({ err }, label)
      return
    }
    logger.info({ data }, label)
  }
}

client2.check({}, healthCallback)

function healthCallback(err, data) {
  if (err) {
    logger.error({ err })
    return
  }
  logger.info(data)
}
