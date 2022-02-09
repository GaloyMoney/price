import { Knex } from "knex"

import { databaseConfig } from "./process"

const { host, port, user, password, database, poolMin, poolMax, debug } = databaseConfig

const config: Knex.Config = {
  client: "pg",
  debug,
  connection: {
    host,
    port,
    user,
    password,
    database,
  },
  pool: {
    min: poolMin,
    max: poolMax,
  },
  migrations: {
    tableName: "knex_migrations",
    directory: "./database/migrations",
  },
  seeds: {
    directory: "./database/seeds",
  },
}

export default config
