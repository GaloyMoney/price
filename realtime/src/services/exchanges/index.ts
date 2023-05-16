import { InvalidExchangeProviderError } from "@domain/exchanges"

import { CcxtExchangeService } from "./ccxt"
import { YadioExchangeService } from "./yadio"
import { ExchangeRateHostService } from "./exchangeratehost"
import { CurrencyBeaconExchangeService } from "./currencybeacon"
import { ExchangeRatesAPIExchangeService } from "./exchange-rates-api"
import { FreeCurrencyRatesExchangeService } from "./free-currency-rates"

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
      case "free-currency-rates":
        service = await createFreeCurrencyRates(config)
        break
      case "currencybeacon":
        service = await createCurrencyBeacon(config)
        break
      case "exchangeratesapi":
        service = await createExchangeRatesAPI(config)
        break
      case "exchangeratehost":
        service = await createExchangeRateHost(config)
        break
      case "yadio":
        service = await createYadio(config)
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

const createFreeCurrencyRates = async (config: ExchangeConfig) => {
  const { base, quote } = config
  const defaultConfig = { timeout: 5000 }
  return FreeCurrencyRatesExchangeService({
    base: base,
    quote: quote,
    config: { ...defaultConfig, ...config.config },
  })
}

const createCurrencyBeacon = async (config: ExchangeConfig) => {
  const { base, quote } = config
  const defaultConfig = { timeout: 5000 }
  return CurrencyBeaconExchangeService({
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

const createExchangeRateHost = async (config: ExchangeConfig) => {
  const { base, quote } = config
  const defaultConfig = { timeout: 5000 }
  return ExchangeRateHostService({
    base: base,
    quote: quote,
    config: { ...defaultConfig, ...config.config },
  })
}

const createYadio = async (config: ExchangeConfig) => {
  const { base, quote } = config
  const defaultConfig = { timeout: 5000 }
  return YadioExchangeService({
    base: base,
    quote: quote,
    config: { ...defaultConfig, ...config.config },
  })
}
