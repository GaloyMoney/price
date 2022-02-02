class PrimitivesError extends Error {
  name = this.constructor.name
}

export class InvalidCurrencyError extends PrimitivesError {}
