export class PriceError extends Error {
  name = this.constructor.name
}

export class InvalidPriceRangeError extends PriceError {}

export class PriceRepositoryError extends PriceError {}
export class UnknownPriceRepositoryError extends PriceRepositoryError {}
