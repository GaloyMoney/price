import { DomainError } from "@domain/errors"

class PrimitivesError extends DomainError {}

export class InvalidCurrencyError extends PrimitivesError {}
