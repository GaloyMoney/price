import healthCheck from "grpc-health-check"
import * as grpc from "@grpc/grpc-js"

import { Realtime } from "@app"
import { baseLogger } from "@services/logger"

import { ServiceStatus } from "@domain/index"

import { protoDescriptorPrice } from "../grpc"

// Define service status map. Key is the service name, value is the corresponding status.
// By convention, the empty string "" key represents that status of the entire server.
const statusMap = {
  "": 2,
  // 1 is serving
  // 2 is not serving
}

// Construct the health service implementation
const healthImpl = new healthCheck.Implementation(statusMap)

const getPrice = async ({ request }, callback) => {
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
}

export const startServer = () => {
  const port = process.env.PORT || 50051
  const server = new grpc.Server()

  server.addService(protoDescriptorPrice.PriceFeed.service, { getPrice })
  server.addService(healthCheck.service, healthImpl)

  server.bindAsync(
    `0.0.0.0:${port}`,
    grpc.ServerCredentials.createInsecure(),
    async () => {
      baseLogger.info(`Price server running on port ${port}`)
      Realtime.startWatchers(async () => {
        const status = await Realtime.getStatus()
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

  return server
}

if (require.main === module) {
  startServer()
}
