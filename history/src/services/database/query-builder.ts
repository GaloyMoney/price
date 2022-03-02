import knex from "knex"

import { databaseClientConfig } from "@config"

export const queryBuilder = knex(databaseClientConfig)

export const closeDbConnections = (): Promise<void> => queryBuilder.destroy()
