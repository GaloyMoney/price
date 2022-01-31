import fs from "fs"

import yaml from "js-yaml"
import merge from "lodash.merge"

import { baseLogger } from "@services/logger"

const defaultContent = fs.readFileSync("./default.yaml", "utf8")
export const defaultConfig = yaml.load(defaultContent)

let customConfig

try {
  const customContent = fs.readFileSync("/var/yaml/custom.yaml", "utf8")
  customConfig = yaml.load(customContent)
} catch (err) {
  baseLogger.info({ err }, "no custom.yaml available. using default values")
}

export const yamlConfig = merge(defaultConfig, customConfig)

export const supportedCurrencies: Currency[] = yamlConfig.quotes

export const getExchangesConfig = (): YamlExchangeConfig[] => {
  const base = yamlConfig.base
  return yamlConfig.exchanges
    .filter((e) => !!e.enabled)
    .map((e) => ({
      name: e.name,
      base,
      quote: e.quote,
      quoteCurrency: e.quoteCurrency,
      provider: e.provider,
      cron: e.cron,
      config: e.config,
    }))
}
