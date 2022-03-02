import { PriceRange } from "@domain/price"
import { assertUnreachable } from "@utils"

export * from "./errors"

export const ExchangeTimeframe = {
  OneHour: "1h",
  FourHours: "4h",
  OneDay: "1d",
  OneWeek: "1w",
  OneMonth: "1M",
} as const

export const getTimeframeByRange = (range: PriceRange): ExchangeTimeframe => {
  switch (range) {
    case PriceRange.OneDay:
      return ExchangeTimeframe.OneHour
    case PriceRange.OneWeek:
      return ExchangeTimeframe.FourHours
    case PriceRange.OneMonth:
      return ExchangeTimeframe.OneDay
    case PriceRange.OneYear:
      return ExchangeTimeframe.OneWeek
    case PriceRange.FiveYears:
      return ExchangeTimeframe.OneMonth
    default:
      return assertUnreachable(range)
  }
}

export const getLimitByRange = (range: PriceRange): number => {
  switch (range) {
    case PriceRange.OneDay:
      return 24
    case PriceRange.OneWeek:
      return 6 * 7
    case PriceRange.OneMonth:
      return 30
    case PriceRange.OneYear:
      return 53
    case PriceRange.FiveYears:
      return 60
    default:
      return assertUnreachable(range)
  }
}
