type PriceRepositoryError = import("./errors").PriceRepositoryError

type PriceRange =
  typeof import("./index").PriceRange[keyof typeof import("./index").PriceRange]

type Tick = {
  readonly timestamp: Timestamp
  readonly price: Price
}

type GetLastPriceArgs = {
  exchange: string
  base: string
  quote: string
  range: PriceRange
}

type ListPricesArgs = {
  base: string
  quote: string
  range: PriceRange
}

type UpdatePricesArgs = {
  exchange: string
  base: string
  quote: string
  prices: Tick[]
}

interface IPriceRepository {
  getLastPrice(args: GetLastPriceArgs): Promise<Tick | PriceRepositoryError>
  listPrices(args: ListPricesArgs): Promise<Tick[] | PriceRepositoryError>
  updatePrices(args: UpdatePricesArgs): Promise<number | PriceRepositoryError>
}
