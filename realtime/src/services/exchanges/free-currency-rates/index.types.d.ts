type FreeCurrencyRatesConfig = { [key: string]: string | number | boolean }
type FreeCurrencyRatesRates = { [key: string]: number }

type FreeCurrencyRatesExchangeServiceArgs = {
  base: string
  quote: string
  config?: FreeCurrencyRatesConfig
}
