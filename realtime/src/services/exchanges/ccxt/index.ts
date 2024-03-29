import ccxt, { Exchange, Ticker as CcxtTicker } from "ccxt"

import {
  InvalidTickerError,
  ExchangeServiceError,
  InvalidExchangeIdError,
  UnknownExchangeServiceError,
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

  const client: Exchange = new ccxt[exchangeId](config)

  try {
    await client.loadMarkets()
  } catch (error) {
    baseLogger.error({ error }, "Ccxt unknown error")
    return new UnknownExchangeServiceError(error.message || error)
  }

  const fetchTicker = async (): Promise<Ticker | ServiceError> => {
    try {
      const ticker = await client.fetchTicker(symbol)
      return tickerFromRaw(ticker)
    } catch (error) {
      baseLogger.error({ error }, "Ccxt unknown error")
      return new UnknownExchangeServiceError(error.message || error)
    }
  }

  return { fetchTicker }
}

const tickerFromRaw = ({
  bid,
  ask,
  timestamp,
}: CcxtTicker): Ticker | InvalidTickerError => {
  if (!bid || !ask || !timestamp) return new InvalidTickerError()

  if (bid > 0 && ask > 0 && timestamp > 0) {
    return {
      bid: toPrice(bid),
      ask: toPrice(ask),
      timestamp: toTimestamp(timestamp),
    }
  }

  return new InvalidTickerError()
}
