import { defaultBaseCurrency } from "@config"
import { baseLogger } from "@services/logger"
import { toCurrency } from "@domain/primitives"
import { ExchangeFactory } from "@services/exchanges"
import { RealtimePriceRepository } from "@services/realtime-price"

const exchangeFactory = ExchangeFactory()
const realtimePriceRepository = RealtimePriceRepository()

export const refreshRealtimeData = async ({
  currency,
  exchange,
}: RefreshRealtimeDataArgs): Promise<Ticker | ApplicationError> => {
  const exchangeService = await exchangeFactory.create(exchange)
  if (exchangeService instanceof Error) {
    baseLogger.warn(
      { error: exchangeService, exchange },
      "Error initializing exchange service",
    )
    return exchangeService
  }

  const ticker = await exchangeService.fetchTicker()
  if (ticker instanceof Error) {
    baseLogger.warn({ error: ticker, exchange }, "Error fetching exchange ticker")
    return ticker
  }

  let rate = 1
  if (defaultBaseCurrency !== exchange.base) {
    const price = await realtimePriceRepository.getPrice(toCurrency(exchange.base))
    rate = price instanceof Error ? NaN : price
  }

  const result = await realtimePriceRepository.update({
    currency,
    exchangeName: exchange.name,
    timestamp: ticker.timestamp,
    bid: ticker.bid * rate,
    ask: ticker.ask * rate,
  })
  if (result instanceof Error) return result

  return ticker
}
