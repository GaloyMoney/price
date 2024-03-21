import { DomainError, ErrorLevel } from "@domain/errors"

class PrimitivesError extends DomainError {}

export class InvalidCurrencyError extends PrimitivesError {
  level = ErrorLevel.Warn
}
