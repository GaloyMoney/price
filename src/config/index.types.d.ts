type YamlExchangeConfig = {
  name: string
  base: string
  quote: string
  quoteCurrency: string
  provider: string
  cron: string
  config: { [key: string]: string | number | boolean }
}
