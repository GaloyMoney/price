type ExchangeServiceError = import("./errors").ExchangeServiceError

type ExchangeTimeframe =
  typeof import("./index").ExchangeTimeframe[keyof typeof import("./index").ExchangeTimeframe]

type ExchangePrice = {
  timestamp: Timestamp
  price: Price
}

type ExchangeListPricesArgs = {
  timeframe: ExchangeTimeframe
  since: Timestamp
  limit?: number
}

interface IExchangeService {
  listPrices(args: ExchangeListPricesArgs): Promise<ExchangePrice[] | ServiceError>
}

type ExchangeFactory = {
  create(config: ExchangeConfig): Promise<IExchangeService | ExchangeServiceError>
}
