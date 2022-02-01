type ExchangePrice = {
  exchangeName: string
  price: Price
}

type Ticker = {
  bid: Price
  ask: Price
  timestamp: Timestamp
}

interface IExchangeService {
  fetchTicker(): Promise<Ticker | ServiceError>
}
