import healthCheck from "grpc-health-check"

import { realTimeData, startWatchers } from "@app"
import { defaultCurrency, supportedCurrencies } from "@config"
import * as grpc from "@grpc/grpc-js"
import { baseLogger } from "@services/logger"

import { protoDescriptor } from "./grpc"

// Define service status map. Key is the service name, value is the corresponding status.
// By convention, the empty string "" key represents that status of the entire server.
const statusMap = {
  "": 2,
  // 1 is serving
  // 2 is not serving
}

// Construct the health service implementation
const healthImpl = new healthCheck.Implementation(statusMap)

function getPrice({ request }, callback) {
  const currency = request.currency || defaultCurrency
  const supportedCurrency = supportedCurrencies.find((c) => c === currency.toUpperCase())
  if (supportedCurrency) {
    const price = realTimeData.mid(currency.toUpperCase())
    return callback(null, { price })
  }
  return callback({
    code: grpc.status.UNIMPLEMENTED,
    details: `${currency.toUpperCase()} is not supported`,
  })
}

export const startServer = () => {
  const port = process.env.PORT || 50051
  const server = new grpc.Server()

  server.addService(protoDescriptor.PriceFeed.service, { getPrice })
  server.addService(healthCheck.service, healthImpl)

  server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), () => {
    baseLogger.info(`Price server running on port ${port}`)
    startWatchers(() => {
      const isActive = supportedCurrencies
        .map((c) => (realTimeData.totalActive(c as Currency) > 0 ? 1 : 2))
        .every((i) => i === 1)
      healthImpl.setStatus("", isActive ? 1 : 2)
    })
    server.start()
  })

  return server
}

if (require.main === module) {
  startServer()
}
