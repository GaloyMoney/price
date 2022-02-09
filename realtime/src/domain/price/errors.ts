export class PriceError extends Error {
  name = this.constructor.name
}

export class InvalidPriceRangeError extends PriceError {}

export class RealtimePriceRepositoryError extends PriceError {}
export class PriceNotAvailableError extends RealtimePriceRepositoryError {}
export class CurrencyNotInitializedError extends RealtimePriceRepositoryError {}
export class ExchangeNotInitializedError extends RealtimePriceRepositoryError {}

export class PriceRepositoryError extends PriceError {}
export class UnknownPriceRepositoryError extends PriceRepositoryError {}
