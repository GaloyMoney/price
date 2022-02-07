import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("prices", (table) => {
    table.string("exchange", 40)
    table.string("symbol", 10)
    table.timestamp("timestamp")
    table.double("price")
    table.primary(["exchange", "symbol", "timestamp"])
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("prices")
}
