import knex from "knex"

import { databaseClientConfig } from "@config"

export const queryBuilder = knex(databaseClientConfig)
