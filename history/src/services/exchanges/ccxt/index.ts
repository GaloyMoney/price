import ccxt from "ccxt"

import {
  ExchangeServiceError,
  InvalidExchangeIdError,
  UnknownExchangeServiceError,
  OHLCVNotSupportedExchangeServiceError,
} from "@domain/exchanges"
import { toPrice, toTimestamp } from "@domain/primitives"

import { baseLogger } from "@services/logger"

import { CcxtExchangeServiceArgs } from "./index.types"

export const CcxtExchangeService = async ({
  exchangeId,
  base,
  quote,
  config,
}: CcxtExchangeServiceArgs): Promise<IExchangeService | ExchangeServiceError> => {
  const symbol = `${base}/${quote}`
  const id = ccxt.exchanges.find((e) => e === exchangeId)
  if (!id) return new InvalidExchangeIdError()

  const client: ccxt.Exchange = new ccxt[exchangeId](config)

  await client.loadMarkets()

  const listPrices = async ({
    timeframe,
    since,
    limit = 100,
  }: ExchangeListPricesArgs): Promise<ExchangePrice[] | ServiceError> => {
    try {
      if (!client.hasFetchOHLCV) return new OHLCVNotSupportedExchangeServiceError()

      const ohlc = await client.fetchOHLCV(symbol, timeframe, since, limit)
      if (!ohlc || !ohlc.length) return []

      return ohlc.map(exchangePriceFromRaw)
    } catch (error) {
      baseLogger.error({ error }, "Ccxt unknown error")
      return new UnknownExchangeServiceError(error)
    }
  }

  return { listPrices }
}

const exchangePriceFromRaw = ([timestamp, , , close]: ccxt.OHLCV): ExchangePrice => ({
  timestamp: toTimestamp(timestamp),
  price: toPrice(close),
})
