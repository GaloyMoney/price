type IbexCredentials = { email: string, password: string }

type IbexConfig = { [key: string]: string | number | boolean }
type IbexRates = { [key: string]: number }

type IbexExchangeServiceArgs = {
  base: string
  quote: string
  config?: IbexConfig
}
