import fs from "fs"

import yaml from "js-yaml"
import merge from "lodash.merge"
import * as cron from "node-cron"

import { baseLogger } from "@services/logger"

import { ConfigError } from "./error"

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

export const supportedCurrencies: Currency[] = yamlConfig.quotes

export const getExchangesConfig = (): YamlExchangeConfig[] => {
  const base = yamlConfig.base

  return yamlConfig.exchanges
    .filter((e) => !!e.enabled)
    .map((e) => {
      if (!cron.validate(e.cron))
        throw new ConfigError(`Invalid ${e.name} cron expression`)
      return {
        name: e.name,
        base,
        quote: e.quote,
        quoteCurrency: e.quoteCurrency,
        provider: e.provider,
        cron: e.cron,
        config: e.config,
      }
    })
}
