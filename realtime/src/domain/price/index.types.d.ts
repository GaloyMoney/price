type PriceRepositoryError = import("./errors").PriceRepositoryError
type RealtimePriceRepositoryError = import("./errors").RealtimePriceRepositoryError

type Tick = {
  readonly timestamp: number
  readonly price: Price
}

type UpdateRealtimePriceArgs = {
  exchangeName: string
  currency: CurrencyCode
  timestamp: number
  bid: number
  ask: number
}

interface IRealtimePriceRepository {
  getPrice(currency: CurrencyCode): Promise<Price | RealtimePriceRepositoryError>
  getExchangePrices(
    currency: CurrencyCode,
  ): Promise<ExchangePrice[] | RealtimePriceRepositoryError>
  hasActiveExchanges(
    currency: CurrencyCode,
  ): Promise<boolean | RealtimePriceRepositoryError>
  update(args: UpdateRealtimePriceArgs): Promise<true | RealtimePriceRepositoryError>
}
