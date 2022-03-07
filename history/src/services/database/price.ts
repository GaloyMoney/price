import {
  getStartDateByRange,
  LastPriceEmptyRepositoryError,
  PriceRange,
  UnknownPriceRepositoryError,
} from "@domain/price"
import { toPrice, toTimestamp } from "@domain/primitives"
import { assertUnreachable, notEmpty, unixTimestamp } from "@utils"

import { queryBuilder } from "./query-builder"

export const PriceRepository = (): IPriceRepository => {
  const getLastPrice = async ({
    exchange,
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
        .where("exchange", resolveExchangeName(exchange))
        .andWhere("symbol", symbol)
        .andWhere("timestamp", ">=", startDate)
        .orderBy("timestamp", "desc")
        .first()

      if (!lastPrice || !lastPrice.price) return new LastPriceEmptyRepositoryError()

      return dbRecordToTick(lastPrice)
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
        .select("timestamp")
        .avg({ price: "price" })
        .where("symbol", symbol)
        .andWhere("timestamp", ">=", startDate)
        .groupBy("timestamp")

      if (!prices || !prices.length) return []

      return prices.map(resultToTick).filter(notEmpty)
    } catch (err) {
      return new UnknownPriceRepositoryError(err.message)
    }
  }

  const updatePrices = async ({
    exchange,
    base,
    quote,
    prices,
  }: UpdatePricesArgs): Promise<number | PriceRepositoryError> => {
    const symbol = `${base.toUpperCase()}-${quote.toUpperCase()}`
    try {
      const data = prices.map(({ timestamp, price }) => ({
        exchange: resolveExchangeName(exchange),
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

const resolveExchangeName = (exchange: string) => {
  return exchange === "bitfinex2" ? "bitfinex" : exchange
}

const resultToTick = ({
  timestamp,
  price,
}: {
  timestamp: Date
  price?: number
}): Tick | null => {
  if (!price) return null
  return dbRecordToTick({ timestamp, price })
}

const dbRecordToTick = (result: Pick<DbPriceRecord, "timestamp" | "price">): Tick => ({
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
