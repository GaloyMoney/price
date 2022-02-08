type PriceRepositoryError = import("./errors").PriceRepositoryError
type RealtimePriceRepositoryError = import("./errors").RealtimePriceRepositoryError

type PriceRange =
  typeof import("./index").PriceRange[keyof typeof import("./index").PriceRange]

type Tick = {
  readonly timestamp: number
  readonly price: Price
}

type ListPricesArgs = {
  base: string
  quote: string
  range: PriceRange
}

type UpdateRealtimePriceArgs = {
  exchangeName: string
  currency: Currency
  timestamp: number
  bid: number
  ask: number
}

interface IRealtimePriceRepository {
  getPrice(currency: Currency): Promise<Price | RealtimePriceRepositoryError>
  getExchangePrices(
    currency: Currency,
  ): Promise<ExchangePrice[] | RealtimePriceRepositoryError>
  hasActiveExchanges(currency: Currency): Promise<boolean | RealtimePriceRepositoryError>
  update(args: UpdateRealtimePriceArgs): Promise<true | RealtimePriceRepositoryError>
}

interface IPriceRepository {
  listPrices(args: ListPricesArgs): Promise<Tick[] | PriceRepositoryError>
}
