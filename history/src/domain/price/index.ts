import { InvalidPriceRangeError } from "./errors"

export * from "./errors"

export const PriceRange = {
  OneDay: "1d",
  OneWeek: "1w",
  OneMonth: "1m",
  OneYear: "1y",
  FiveYears: "5y",
} as const

export const checkedToPriceRange = (
  range: string,
): PriceRange | InvalidPriceRangeError => {
  if (PriceRange[range]) return PriceRange[range] as PriceRange
  return new InvalidPriceRangeError()
}
