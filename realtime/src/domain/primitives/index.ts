import { InvalidCurrencyError } from "./errors"

export * from "./errors"

export const checkedToCurrencyCode = (
  currency: string,
): CurrencyCode | InvalidCurrencyError => {
  if (currency) return toCurrency(currency)
  return new InvalidCurrencyError()
}

export const toPrice = (price: number): Price => {
  return price as Price
}

export const toTimestamp = (timestamp: number): Timestamp => {
  return timestamp as Timestamp
}

export const toCurrency = (currency: string): CurrencyCode => {
  return currency.toUpperCase() as CurrencyCode
}

export const toSeconds = (seconds: number): Seconds => {
  return seconds as Seconds
}
