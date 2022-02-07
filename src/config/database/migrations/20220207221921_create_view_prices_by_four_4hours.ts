import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  return knex.schema.raw(`
    CREATE OR REPLACE VIEW vw_prices_by_4hours
    AS
    SELECT DISTINCT exchange,
      symbol,
      date_bin(INTERVAL '4 hours', "timestamp", TIMESTAMPTZ '2009-01-01') AS "timestamp",
      last_value(price) OVER (PARTITION BY (date_bin(INTERVAL '4 hours', "timestamp", TIMESTAMPTZ '2009-01-01')) ORDER BY "timestamp" RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS price
    FROM prices
    GROUP BY exchange, symbol, (date_bin(INTERVAL '4 hours', "timestamp", TIMESTAMPTZ '2009-01-01')), "timestamp", price
    ORDER BY (date_bin(INTERVAL '4 hours', "timestamp", TIMESTAMPTZ '2009-01-01'));
  `)
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropViewIfExists("vw_prices_by_4hours")
}
