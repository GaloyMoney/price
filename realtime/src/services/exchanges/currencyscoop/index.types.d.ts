type CurrencyscoopConfig = { [key: string]: string | number | boolean }

type CurrencyscoopExchangeServiceArgs = {
  base: string
  quote: string
  config?: CurrencyscoopConfig
}
