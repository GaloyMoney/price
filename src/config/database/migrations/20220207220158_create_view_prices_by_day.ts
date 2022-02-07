import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  return knex.schema.raw(`
    CREATE OR REPLACE VIEW vw_prices_by_day
    AS
    SELECT DISTINCT exchange,
      symbol,
      date_trunc('day'::text, "timestamp") AS "timestamp",
      last_value(price) OVER (PARTITION BY (date_trunc('day'::text, "timestamp")) ORDER BY "timestamp" RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS price
    FROM prices
    GROUP BY exchange, symbol, (date_trunc('day'::text, "timestamp")), "timestamp", price
    ORDER BY (date_trunc('day'::text, "timestamp"));
  `)
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropViewIfExists("vw_prices_by_day")
}
