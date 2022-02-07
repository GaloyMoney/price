import { PriceRange, UnknownPriceRepositoryError } from "@domain/price"
import { toPrice } from "@domain/primitives"
import { assertUnreachable } from "@utils"

import { queryBuilder } from "./query-builder"

export const PriceRepository = (exchange: string): IPriceRepository => {
  const listPrices = async ({
    base,
    quote,
    range,
  }: ListPricesArgs): Promise<Tick[] | PriceRepositoryError> => {
    const viewName = getViewName(range)
    const startDate = new Date(getStartDate(range))
    const symbol = `${base.toUpperCase()}-${quote.toUpperCase()}`
    try {
      const prices = await queryBuilder(viewName)
        .select(["timestamp", "price"])
        .where("exchange", exchange)
        .andWhere("symbol", symbol)
        .andWhere("timestamp", ">=", startDate)

      if (!prices || !prices.length) return []

      return prices.map(resultToTick)
    } catch (err) {
      return new UnknownPriceRepositoryError(err)
    }
  }
  return { listPrices }
}

const resultToTick = (result: DbPriceRecord): Tick => ({
  date: result.timestamp,
  price: toPrice(result.price),
})

const getViewName = (range: PriceRange) => {
  switch (range) {
    case PriceRange.OneDay:
      return "vw_prices_by_hour"
    case PriceRange.OneWeek:
      return "vw_prices_by_4hours"
    case PriceRange.OneMonth:
      return "vw_prices_by_day"
    case PriceRange.OneYear:
      return "vw_prices_by_week"
    case PriceRange.FiveYears:
      return "vw_prices_by_month"
    default:
      return assertUnreachable(range)
  }
}

const getStartDate = (range: PriceRange): number => {
  const startDate = new Date(Date.now())
  const resetHours = (date: Date) => date.setHours(0, 0, 0, 0)
  switch (range) {
    case PriceRange.OneDay:
      return startDate.setHours(startDate.getHours() - 24)
    case PriceRange.OneWeek:
      startDate.setHours(startDate.getHours() - 24 * 7)
      return resetHours(startDate)
    case PriceRange.OneMonth:
      startDate.setMonth(startDate.getMonth() - 1)
      return resetHours(startDate)
    case PriceRange.OneYear:
      startDate.setMonth(startDate.getMonth() - 12)
      return resetHours(startDate)
    case PriceRange.FiveYears:
      startDate.setMonth(startDate.getMonth() - 60)
      return resetHours(startDate)
    default:
      return assertUnreachable(range)
  }
}
