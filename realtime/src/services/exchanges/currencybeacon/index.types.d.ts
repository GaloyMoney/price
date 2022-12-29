type CurrencyBeaconConfig = { [key: string]: string | number | boolean }
type CurrencyBeaconRates = { [key: string]: number }

type CurrencyBeaconExchangeServiceArgs = {
  base: string
  quote: string
  config?: CurrencyBeaconConfig
}
