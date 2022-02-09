import { Knex } from "knex"

import rows from "./bitfinex-1w-2017-2021.json"

export async function seed(knex: Knex): Promise<void> {
  const chunkSize = 50
  const data = rows.map((p) => ({ ...p, timestamp: new Date(p.timestamp) }))
  await knex.batchInsert("prices", data, chunkSize)
}
