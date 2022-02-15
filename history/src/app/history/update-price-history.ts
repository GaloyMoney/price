import { defaultBaseCurrency, getExchangesConfig } from "@config"
import { ExchangeTimeframe } from "@domain/exchanges"
import { getStartDateByRange, PriceRange } from "@domain/price"
import { toTimestamp } from "@domain/primitives"
import { PriceRepository } from "@services/database"
import { ExchangeFactory } from "@services/exchanges"
import { baseLogger } from "@services/logger"
import { assertUnreachable } from "@utils"

const exchangeFactory = ExchangeFactory()

export const updatePriceHistory = async (): Promise<boolean | ApplicationError> => {
  const exchanges = getExchangesConfig()
  const supportedBaseExchanges = exchanges.filter((e) => e.base === defaultBaseCurrency)

  for (const exchange of supportedBaseExchanges) {
    for (const range in PriceRange) {
      const result = await updateByRange({ range: PriceRange[range], exchange })
      if (result instanceof Error) {
        baseLogger.error(
          { error: result, range: PriceRange[range], exchange: exchange.name },
          "Could not update price history",
        )
        return result
      }
      baseLogger.info(
        { recordsUpdated: result, range: PriceRange[range], exchange: exchange.name },
        "Price history updated",
      )
    }
  }

  return true
}

const updateByRange = async ({
  range,
  exchange,
}: {
  range: PriceRange
  exchange: ExchangeConfig
}): Promise<number | ApplicationError> => {
  const { base, quote } = exchange

  const exchangeService = await exchangeFactory.create(exchange)
  if (exchangeService instanceof Error) return exchangeService

  const priceRepository = PriceRepository(exchange.name)
  const lastPrice = await priceRepository.getLastPrice({ base, quote, range })

  const timeframe = getTimeframeByRange(range)
  const since =
    lastPrice instanceof Error
      ? getStartDateByRange(range)
      : toTimestamp(lastPrice.timestamp * 1000)
  const limit = getLimitByRange(range)
  const prices = await exchangeService.listPrices({ timeframe, since, limit })
  if (prices instanceof Error) return prices
  if (!prices.length) return 0

  return priceRepository.updatePrices({ base, quote, prices })
}

const getTimeframeByRange = (range: PriceRange): ExchangeTimeframe => {
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

const getLimitByRange = (range: PriceRange): number => {
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
