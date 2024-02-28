import dotenv from "dotenv"

import { History } from "@app"

import { closeDbConnections } from "@services/database"

dotenv.config()

const startServer = async () => {
  await History.updatePriceHistory()
  await History.notifyPriceChange({})
  await closeDbConnections()
}

if (require.main === module) {
  startServer()
}
