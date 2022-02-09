import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("prices", (table) => {
    table.string("exchange", 40).notNullable()
    table.string("symbol", 10).notNullable()
    table.timestamp("timestamp").notNullable()
    table.double("price").notNullable()
    table.primary(["exchange", "symbol", "timestamp"])
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("prices")
}
