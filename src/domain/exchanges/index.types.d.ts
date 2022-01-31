type Price = number & { readonly brand: unique symbol }

type Ticker = {
  bid: Price
  ask: Price
  timestamp: Timestamp
}

interface IExchangeService {
  fetchTicker(): Promise<Ticker | ServiceError>
}
