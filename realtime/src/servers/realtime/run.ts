import * as grpc from "@grpc/grpc-js"
import { HealthImplementation, ServingStatusMap } from "grpc-health-check"

import { Realtime } from "@app"
import { getStatus, startWatchers } from "@app/realtime"

import { ServiceStatus } from "@domain/index"

import { baseLogger } from "@services/logger"
import { wrapAsyncToRunInSpan } from "@services/tracing"

import { protoDescriptorPrice } from "../grpc"

// Define service status map. Key is the service name, value is the corresponding status.
// By convention, the empty string "" key represents that status of the entire server.
const statusMap: ServingStatusMap = {
  "": "NOT_SERVING",
  // 1 is serving
  // 2 is not serving
}

// Construct the health service implementation
const healthImpl = new HealthImplementation(statusMap)

const getPrice = wrapAsyncToRunInSpan({
  root: true,
  namespace: "servers.run",
  fnName: "getPrice",
  fn: async (
    { request }: grpc.ServerUnaryCall<{ currency: string }, unknown>,
    callback: grpc.sendUnaryData<{ price: Price }>,
  ) => {
    const currency = request.currency
    const price = await Realtime.getPrice(currency)
    if (price instanceof Error) {
      baseLogger.error({ error: price, currency }, "Error getting price")
      return callback({
        code: grpc.status.UNIMPLEMENTED,
        details: `${currency} is not supported`,
      })
    }

    return callback(null, { price })
  },
})

const listCurrencies = wrapAsyncToRunInSpan({
  root: true,
  namespace: "servers.run",
  fnName: "listCurrencies",
  fn: async (_, callback: grpc.sendUnaryData<{ currencies: FiatCurrency[] }>) => {
    const currencies = await Realtime.listCurrencies()
    if (currencies instanceof Error) {
      baseLogger.error({ error: currencies }, "Error getting currencies")
      return callback({
        code: grpc.status.UNKNOWN,
        details: `Unexpected error listing currencies`,
      })
    }

    return callback(null, { currencies })
  },
})

const port = process.env.PORT || 50051
const server = new grpc.Server()

export const startServer = () => {
  server.addService(protoDescriptorPrice.PriceFeed.service, { getPrice, listCurrencies })
  healthImpl.addToServer(server)

  server.bindAsync(
    `0.0.0.0:${port}`,
    grpc.ServerCredentials.createInsecure(),
    async () => {
      baseLogger.info(`Price server running on port ${port}`)
      startWatchers(async () => {
        const status = await getStatus()
        if (status instanceof Error) {
          baseLogger.error({ error: status }, "Error getting status")
          healthImpl.setStatus("", ServiceStatus.NOT_SERVING)
          return
        }
        healthImpl.setStatus("", status)
      })
      server.start()
    },
  )
}

const shutdown = () => {
  server.tryShutdown((error) => {
    if (error) {
      baseLogger.error({ error }, "Error shutting down server")
    }
    process.exit(error ? 1 : 0)
  })
}

if (require.main === module) {
  startServer()
}

process.on("SIGINT", shutdown)
process.on("SIGTERM", shutdown)
