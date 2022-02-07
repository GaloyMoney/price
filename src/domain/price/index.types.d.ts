type PriceRepositoryError = import("./errors").PriceRepositoryError

type PriceRange =
  typeof import("./index").PriceRange[keyof typeof import("./index").PriceRange]

type Tick = {
  readonly date: Date
  readonly price: Price
}

type ListPricesArgs = {
  base: string
  quote: string
  range: PriceRange
}

interface IPriceRepository {
  listPrices(args: ListPricesArgs): Promise<Tick[] | PriceRepositoryError>
}
