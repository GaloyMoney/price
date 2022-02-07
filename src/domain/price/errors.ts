export class PriceError extends Error {
  name = this.constructor.name
}

export class PriceRepositoryError extends PriceError {}
export class PriceNotAvailableError extends PriceRepositoryError {}
export class UnknownPriceRepositoryError extends PriceRepositoryError {}
