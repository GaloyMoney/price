type RawExchangeConfig = {
  name: string
  base: string
  quote: string[]
  excludedQuotes: string[]
  quoteAlias: string[]
  provider: string
  cron: string
  config: { [key: string]: string | number | boolean }
}

type ExchangeConfig = {
  name: string
  base: string
  quote: string
  quoteAlias: string
  excludedQuotes: string[]
  provider: string
  cron: string
  config: { [key: string]: string | number | boolean }
}
