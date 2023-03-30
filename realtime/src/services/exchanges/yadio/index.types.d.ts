type YadioConfig = { [key: string]: string | number | boolean }
type YadioRates = { [key: string]: number }

type GetYadioRatesResponse<T extends string> = {
  timestamp: number
  base: string
} & {
  [K in T]: unknown
}

type YadioExchangeServiceArgs = {
  base: string
  quote: string
  config?: YadioConfig
}
