type ExchangeConfig = {
  name: string
  base: string
  quote: string
  quoteAlias: string
  provider: string
  cron: string
  config: { [key: string]: string | number | boolean }
}
