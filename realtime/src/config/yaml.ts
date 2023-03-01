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

export const supportedCurrencies: FiatCurrency[] = yamlConfig.quotes.map((q) => ({
  code: q.code.toUpperCase(),
  symbol: q.symbol,
  name: q.name,
  flag: q.flag,
  fractionDigits: q.fractionDigits >= 0 ? q.fractionDigits : 2,
}))
export const defaultBaseCurrency: CurrencyCode = yamlConfig.base
export const defaultQuoteCurrency: FiatCurrency = supportedCurrencies[0]

export const getExchangesConfig = (): ExchangeConfig[] => {
  const rawExchangesConfig: ExchangeConfig[] = yamlConfig.exchanges
    .filter((e) => !!e.enabled)
    .map((e) => {
      if (!cron.validate(e.cron))
        throw new ConfigError(`Invalid ${e.name} cron expression`, e)
      return {
        name: e.name,
        base: (e.base || defaultBaseCurrency).toUpperCase(),
        quote: e.quote.toUpperCase(),
        quoteAlias: e.quoteAlias.toUpperCase(),
        provider: e.provider,
        cron: e.cron,
        config: e.config,
      }
    })

  const exchangesConfig: ExchangeConfig[] = []
  for (const config of rawExchangesConfig) {
    let newConfigs = [config]
    if (config.quote === "*" || config.quoteAlias === "*") {
      newConfigs = supportedCurrencies
        .filter((e) => e.code !== config.base)
        .map((c) => ({ ...config, quoteAlias: c.code, quote: c.code }))
    }
    exchangesConfig.push(...newConfigs)
  }

  return exchangesConfig
}
