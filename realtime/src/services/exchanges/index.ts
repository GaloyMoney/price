import { InvalidExchangeProviderError } from "@domain/exchanges"

import { CcxtExchangeService } from "./ccxt"
import { CurrencyscoopExchangeService } from "./currencyscoop"
import { ExchangeRatesAPIExchangeService } from "./exchange-rates-api"

const exchanges: { [key: string]: IExchangeService } = {}

export const ExchangeFactory = (): ExchangeFactory => {
  const create = async (
    config: ExchangeConfig,
  ): Promise<IExchangeService | ExchangeServiceError> => {
    const { provider, name, base, quote } = config
    const key = `${provider}:${name}:${base}:${quote}`

    if (exchanges[key]) return exchanges[key]

    let service: IExchangeService | ExchangeServiceError =
      new InvalidExchangeProviderError()
    switch (provider) {
      case "ccxt":
        service = await createCcxt(config)
        break
      case "currencyscoop":
        service = await createCurrencyscoop(config)
        break
      case "exchangeratesapi":
        service = await createExchangeRatesAPI(config)
        break
    }

    if (service instanceof Error) return service
    exchanges[key] = service
    return exchanges[key]
  }

  return { create }
}

const createCcxt = async (config: ExchangeConfig) => {
  const { name, base, quote } = config
  const defaultConfig = { enableRateLimit: true, rateLimit: 2000, timeout: 8000 }
  return CcxtExchangeService({
    exchangeId: name,
    base: base,
    quote: quote,
    config: { ...defaultConfig, ...config.config },
  })
}

const createCurrencyscoop = async (config: ExchangeConfig) => {
  const { base, quote } = config
  const defaultConfig = { timeout: 5000 }
  return CurrencyscoopExchangeService({
    base: base,
    quote: quote,
    config: { ...defaultConfig, ...config.config },
  })
}

const createExchangeRatesAPI = async (config: ExchangeConfig) => {
  const { base, quote } = config
  const defaultConfig = { timeout: 5000 }
  return ExchangeRatesAPIExchangeService({
    base: base,
    quote: quote,
    config: { ...defaultConfig, ...config.config },
  })
}
