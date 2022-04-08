import { InvalidCurrencyError } from "./errors"

export * from "./errors"

export const checkedToCurrency = (currency: string): Currency | InvalidCurrencyError => {
  if (currency) return toCurrency(currency)
  return new InvalidCurrencyError()
}

export const toPrice = (price: number): Price => {
  return price as Price
}

export const toTimestamp = (timestamp: number): Timestamp => {
  return timestamp as Timestamp
}

export const toCurrency = (currency: string): Currency => {
  return currency.toUpperCase() as Currency
}

export const toSeconds = (seconds: number): Seconds => {
  return seconds as Seconds
}
