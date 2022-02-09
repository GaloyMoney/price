import {
  CurrencyNotInitializedError,
  ExchangeNotInitializedError,
  PriceNotAvailableError,
} from "@domain/price"
import { toPrice } from "@domain/primitives"

import { realTimeData } from "./data"

export const RealtimePriceRepository = (): IRealtimePriceRepository => {
  const getPrice = async (
    currency: Currency,
  ): Promise<Price | RealtimePriceRepositoryError> => {
    const price = realTimeData.mid(currency)
    if (price > 0) return toPrice(price)
    return new PriceNotAvailableError()
  }

  const getExchangePrices = async (
    currency: Currency,
  ): Promise<ExchangePrice[] | RealtimePriceRepositoryError> => {
    if (!realTimeData.exchanges[currency]) return new CurrencyNotInitializedError()

    const exchanges = realTimeData.exchanges[currency]

    const prices: ExchangePrice[] = []
    for (const exchangeName in exchanges) {
      prices.push({
        exchangeName,
        price: toPrice(exchanges[exchangeName].mid),
      })
    }

    return prices
  }

  const hasActiveExchanges = async (
    currency: Currency,
  ): Promise<boolean | RealtimePriceRepositoryError> => {
    if (!realTimeData.exchanges[currency]) return new CurrencyNotInitializedError()
    return realTimeData.totalActive(currency) > 0
  }

  const update = async ({
    currency,
    exchangeName,
    timestamp,
    ask,
    bid,
  }: UpdateRealtimePriceArgs): Promise<true | RealtimePriceRepositoryError> => {
    if (!realTimeData.exchanges[currency]) return new CurrencyNotInitializedError()
    if (!realTimeData.exchanges[currency][exchangeName])
      return new ExchangeNotInitializedError()

    realTimeData.exchanges[currency][exchangeName].timestamp = timestamp
    realTimeData.exchanges[currency][exchangeName].bid = bid
    realTimeData.exchanges[currency][exchangeName].ask = ask

    return true
  }

  return { getPrice, getExchangePrices, hasActiveExchanges, update }
}
