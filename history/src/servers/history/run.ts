import dotenv from "dotenv"
import * as grpc from "@grpc/grpc-js"
import healthCheck from "grpc-health-check"

import { History } from "@app"

import { ServiceStatus } from "@domain/index"

import { baseLogger } from "@services/logger"
import { wrapAsyncToRunInSpan } from "@services/tracing"

import { protoDescriptorPrice } from "../grpc"

dotenv.config()
const statusMap = {
  "": 2,
  // 1 is serving
  // 2 is not serving
}
const healthImpl = new healthCheck.Implementation(statusMap)

const listPrices = wrapAsyncToRunInSpan({
  root: true,
  namespace: "servers.run",
  fnName: "listPrices",
  fn: async (
    { request }: grpc.ServerUnaryCall<GetPriceHistoryArgs, unknown>,
    callback: grpc.sendUnaryData<{ priceHistory: Tick[] }>,
  ) => {
    const { currency, range } = request
    const priceHistory = await History.getPriceHistory({ currency, range })
    if (priceHistory instanceof Error) {
      baseLogger.error(
        { error: priceHistory, currency, range },
        "Error getting price history",
      )
      return callback({
        code: grpc.status.INTERNAL,
        details: `${currency} is not supported`,
      })
    }

    return callback(null, { priceHistory })
  },
})

export const startServer = async () => {
  const port = process.env.PORT || 50052
  const server = new grpc.Server()

  server.addService(protoDescriptorPrice.PriceHistory.service, { listPrices })
  server.addService(healthCheck.service, healthImpl)

  server.bindAsync(
    `0.0.0.0:${port}`,
    grpc.ServerCredentials.createInsecure(),
    async () => {
      baseLogger.info(`Price server running on port ${port}`)
      healthImpl.setStatus("", ServiceStatus.SERVING)
      server.start()
    },
  )

  return server
}

if (require.main === module) {
  startServer()
}
