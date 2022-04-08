import { toTimestamp } from "@domain/primitives"
import { assertUnreachable, resetHours } from "@utils"

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

export const getStartDateByRange = (range: PriceRange): Timestamp => {
  const startDate = new Date(Date.now())
  switch (range) {
    case PriceRange.OneDay:
      return toTimestamp(startDate.setHours(startDate.getHours() - 24))
    case PriceRange.OneWeek:
      startDate.setHours(startDate.getHours() - 24 * 7)
      return toTimestamp(resetHours(startDate))
    case PriceRange.OneMonth:
      startDate.setMonth(startDate.getMonth() - 1)
      return toTimestamp(resetHours(startDate))
    case PriceRange.OneYear:
      startDate.setMonth(startDate.getMonth() - 12)
      return toTimestamp(resetHours(startDate))
    case PriceRange.FiveYears:
      startDate.setMonth(startDate.getMonth() - 60)
      return toTimestamp(resetHours(startDate))
    default:
      return assertUnreachable(range)
  }
}
