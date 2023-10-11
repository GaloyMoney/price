type ExchangeRateHostConfig = { [key: string]: string | number | boolean }
type ExchangeRateHostRates = { [key: string]: number }

type GetExchangeRateHostRatesResponse = {
  success: boolean
  source: string
  timestamp: number
  quotes: unknown
}

type ExchangeRateHostServiceArgs = {
  base: string
  quote: string
  config?: ExchangeRateHostConfig
}
