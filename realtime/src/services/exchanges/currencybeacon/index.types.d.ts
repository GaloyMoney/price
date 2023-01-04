type CurrencyBeaconConfig = { [key: string]: string | number | boolean }
type CurrencyBeaconRates = { [key: string]: number }

type GetCurrencyBeaconRatesResponse = {
  meta: {
    code: number
    disclaimer: string
  }
  response: {
    date: string
    base: string
    rates: unknown
  }
}

type CurrencyBeaconExchangeServiceArgs = {
  base: string
  quote: string
  config?: CurrencyBeaconConfig
}
