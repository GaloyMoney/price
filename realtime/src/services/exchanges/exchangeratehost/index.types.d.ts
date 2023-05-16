type ExchangeRateHostConfig = { [key: string]: string | number | boolean }
type ExchangeRateHostRates = { [key: string]: number }

type GetExchangeRateHostRatesResponse = {
  success: boolean
  base: string
  date: string
  rates: unknown
}

type ExchangeRateHostServiceArgs = {
  base: string
  quote: string
  config?: ExchangeRateHostConfig
}
