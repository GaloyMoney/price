import dotenv from "dotenv"

import { History } from "@app"

dotenv.config()

const startServer = async () => {
  await History.updatePriceHistory()
}

if (require.main === module) {
  startServer()
}
