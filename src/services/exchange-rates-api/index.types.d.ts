type ExchangeRatesAPIConfig = { [key: string]: string | number | boolean }

type ExchangeRatesAPIExchangeServiceArgs = {
  base: string
  quote: string
  config?: ExchangeRatesAPIConfig
}
