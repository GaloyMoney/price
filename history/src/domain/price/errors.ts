import { DomainError, ErrorLevel } from "@domain/errors"

export class PriceError extends DomainError {}

export class InvalidPriceRangeError extends PriceError {}

export class PriceRepositoryError extends PriceError {}
export class LastPriceEmptyRepositoryError extends PriceError {}
export class DbConnectionError extends PriceRepositoryError {
  level = ErrorLevel.Critical
}
export class UnknownPriceRepositoryError extends PriceRepositoryError {
  level = ErrorLevel.Critical
}
