import fs from "fs"

import yaml from "js-yaml"
import mergeWith from "lodash.mergewith"
import * as cron from "node-cron"
import Ajv from "ajv"

import { baseLogger } from "@services/logger"

import { ConfigError } from "./error"
import { ConfigSchema, configSchema } from "./schema"

const defaultContent = fs.readFileSync("./default.yaml", "utf8")
export const defaultConfig = yaml.load(defaultContent)

const merge = (defaultConfig: unknown, customConfig: unknown) =>
  mergeWith(defaultConfig, customConfig, (a, b) => (Array.isArray(b) ? b : undefined))

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

export const getFractionDigits = ({
  currency,
  fractionDigits,
}: {
  currency: CurrencyCode
  fractionDigits?: number
}): number => {
  if (fractionDigits !== undefined && fractionDigits >= 0) {
    return fractionDigits
  }
  try {
    const formatter = new Intl.NumberFormat("en-US", { style: "currency", currency })
    const { minimumFractionDigits } = formatter.resolvedOptions()
    return minimumFractionDigits
  } catch {
    throw new ConfigError(
      `Invalid currency. If ${currency} is a custom currency please add fractionDigits`,
    )
  }
}

export const supportedCurrencies: FiatCurrency[] = yamlConfig.quotes.map((q) => {
  const code = q.code.toUpperCase()
  return {
    code,
    symbol: q.symbol,
    name: q.name,
    flag: q.flag,
    fractionDigits: getFractionDigits({
      currency: code,
      fractionDigits: q.fractionDigits,
    }),
  }
})
export const defaultBaseCurrency: CurrencyCode = yamlConfig.base
export const defaultQuoteCurrency: FiatCurrency = supportedCurrencies[0]

export const getExchangesConfig = (): ExchangeConfig[] => {
  // Set dev mode if dev config is present
  if (yamlConfig.exchanges.find((e) => e.provider === "dev-mock")) {
    yamlConfig.exchanges = yamlConfig.exchanges.filter((e) => e.provider === "dev-mock")
  }

  const enabledRawExchangesConfig: RawExchangeConfig[] = yamlConfig.exchanges
    .filter((e) => !!e.enabled)
    .map((e) => {
      if (!cron.validate(e.cron))
        throw new ConfigError(`Invalid ${e.name} cron expression`, e)

      const quote = coerceToStringArray(e.quote)
      const quoteAlias = coerceToStringArray(e.quoteAlias || e.quote)
      if (quoteAlias && quoteAlias.length > 0 && quote.length !== quoteAlias.length)
        throw new ConfigError(`Invalid ${e.name} quote and quoteAlias values`, e)

      return {
        name: e.name,
        base: (e.base || defaultBaseCurrency).toUpperCase(),
        quote,
        quoteAlias,
        excludedQuotes: coerceToStringArray(e.excludedQuotes),
        provider: e.provider,
        cron: e.cron,
        config: e.config,
      }
    })

  const rawExchangesConfig: ExchangeConfig[] = []
  for (const config of enabledRawExchangesConfig) {
    const newConfig = config.quote
      .map<ExchangeConfig>((q, i) => ({
        ...config,
        quote: q,
        quoteAlias: config.quoteAlias[i],
      }))
      .filter((c) => c.base !== c.quote)
    rawExchangesConfig.push(...newConfig)
  }

  const exchangesConfig: ExchangeConfig[] = []
  for (const config of rawExchangesConfig) {
    let newConfigs = [config]
    if (config.quote === "*" || config.quoteAlias === "*") {
      newConfigs = supportedCurrencies
        .filter((e) => e.code !== config.base && !config.excludedQuotes.includes(e.code))
        .map((c) => ({ ...config, quoteAlias: c.code, quote: c.code }))
    }
    exchangesConfig.push(...newConfigs)
  }

  return exchangesConfig
}

export const coerceToStringArray = (value: unknown): string[] => {
  if (!value) {
    return []
  }

  if (typeof value === "string") {
    return [value.toUpperCase()]
  }

  if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
    return value.map((v) => v.toUpperCase())
  }

  throw new ConfigError(
    `Invalid value. Should be a string or array of strings. Value: ${JSON.stringify(
      value,
    )}`,
  )
}
