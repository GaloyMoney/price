type Price = number & { readonly brand: unique symbol }

type ExchangeConfig = {
  name: string
  base: string
  quote: string
  config: { [key: string]: string | number | boolean }
}

type Ticker = {
  bid: Price
  ask: Price
  timestamp: Timestamp
}

interface IExchangeService {
  getConfig(): ExchangeConfig
  fetchTicker(): Promise<Ticker | ServiceError>
}
