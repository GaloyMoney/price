import {
  getStartDateByRange,
  LastPriceEmptyRepositoryError,
  PriceRange,
  UnknownPriceRepositoryError,
} from "@domain/price"
import { toPrice, toTimestamp } from "@domain/primitives"
import { assertUnreachable, unixTimestamp } from "@utils"

import { queryBuilder } from "./query-builder"

export const PriceRepository = (exchange: string): IPriceRepository => {
  const exchangeAlias = exchange === "bitfinex2" ? "bitfinex" : exchange

  const getLastPrice = async ({
    base,
    quote,
    range,
  }: GetLastPriceArgs): Promise<Tick | PriceRepositoryError> => {
    const viewName = getViewName(range)
    const startDate = new Date(getStartDateByRange(range))
    const symbol = `${base.toUpperCase()}-${quote.toUpperCase()}`
    try {
      const lastPrice = await queryBuilder<DbPriceRecord>(viewName)
        .select(["timestamp", "price"])
        .where("exchange", exchangeAlias)
        .andWhere("symbol", symbol)
        .andWhere("timestamp", ">=", startDate)
        .orderBy("timestamp", "desc")
        .first()

      if (!lastPrice) return new LastPriceEmptyRepositoryError()

      return resultToTick(lastPrice)
    } catch (err) {
      return new UnknownPriceRepositoryError(err)
    }
  }

  const listPrices = async ({
    base,
    quote,
    range,
  }: ListPricesArgs): Promise<Tick[] | PriceRepositoryError> => {
    const viewName = getViewName(range)
    const startDate = new Date(getStartDateByRange(range))
    const symbol = `${base.toUpperCase()}-${quote.toUpperCase()}`
    try {
      const prices = await queryBuilder<DbPriceRecord>(viewName)
        .select(["timestamp", "price"])
        .where("exchange", exchangeAlias)
        .andWhere("symbol", symbol)
        .andWhere("timestamp", ">=", startDate)

      if (!prices || !prices.length) return []

      return prices.map(resultToTick)
    } catch (err) {
      return new UnknownPriceRepositoryError(err)
    }
  }

  const updatePrices = async ({
    base,
    quote,
    prices,
  }: UpdatePricesArgs): Promise<number | PriceRepositoryError> => {
    const symbol = `${base.toUpperCase()}-${quote.toUpperCase()}`
    try {
      const data = prices.map(({ timestamp, price }) => ({
        exchange: exchangeAlias,
        symbol,
        timestamp: new Date(timestamp),
        price,
      }))

      const result = await queryBuilder("prices")
        .insert(data)
        .onConflict(["exchange", "symbol", "timestamp"])
        .ignore()

      return result && result["rowCount"]
    } catch (err) {
      return new UnknownPriceRepositoryError(err)
    }
  }

  return { getLastPrice, listPrices, updatePrices }
}

const resultToTick = (result: Pick<DbPriceRecord, "timestamp" | "price">): Tick => ({
  timestamp: toTimestamp(unixTimestamp(result.timestamp)),
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
