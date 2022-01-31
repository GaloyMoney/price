import fs from "fs"

import yaml from "js-yaml"
import merge from "lodash.merge"
import * as cron from "node-cron"
import Ajv from "ajv"

import { baseLogger } from "@services/logger"

import { ConfigError } from "./error"
import { ConfigSchema, configSchema } from "./schema"

const defaultContent = fs.readFileSync("./default.yaml", "utf8")
export const defaultConfig = yaml.load(defaultContent)

let customConfig

try {
  const customContent = fs.readFileSync("/var/yaml/custom.yaml", "utf8")
  customConfig = yaml.load(customContent)
} catch (err) {
  baseLogger.debug({ err }, "no custom.yaml available. using default values")
}

export const yamlConfig = merge(defaultConfig, customConfig)

const ajv = new Ajv()
const validate = ajv.compile<ConfigSchema>(configSchema)
const valid = validate(yamlConfig)
if (!valid) throw new ConfigError("Invalid yaml configuration", validate.errors)

export const supportedCurrencies: Currency[] = yamlConfig.quotes.map((q) =>
  q.toUpperCase(),
)
export const defaultCurrency: Currency = supportedCurrencies[0]

export const getExchangesConfig = (): ExchangeConfig[] => {
  const base = yamlConfig.base

  return yamlConfig.exchanges
    .filter((e) => !!e.enabled)
    .map((e) => {
      if (!cron.validate(e.cron))
        throw new ConfigError(`Invalid ${e.name} cron expression`, e)
      return {
        name: e.name,
        base: (e.base || base).toUpperCase(),
        quote: e.quote.toUpperCase(),
        quoteAlias: e.quoteAlias.toUpperCase(),
        provider: e.provider,
        cron: e.cron,
        config: e.config,
      }
    })
}
