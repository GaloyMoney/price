import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  return knex.schema.raw(`
    CREATE OR REPLACE VIEW vw_prices_by_month
    AS
    SELECT DISTINCT exchange,
      symbol,
      date_trunc('month'::text, "timestamp") AS "timestamp",
      last_value(price) OVER (PARTITION BY (date_trunc('month'::text, "timestamp")) ORDER BY "timestamp" RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS price
    FROM prices
    ORDER BY (date_trunc('month'::text, "timestamp"));
  `)
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropViewIfExists("vw_prices_by_month")
}
