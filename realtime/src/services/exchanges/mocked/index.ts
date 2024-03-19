import {
  InvalidTickerError,
  ExchangeServiceError,
  InvalidExchangeConfigError,
} from "@domain/exchanges"
import { toPrice, toTimestamp } from "@domain/primitives"

export const MockedExchangeService = async ({
  base,
  quote,
  config,
}: MockedExchangeServiceArgs): Promise<IExchangeService | ExchangeServiceError> => {
  const devMockPrice = config?.devMockPrice
  if (!(devMockPrice && typeof devMockPrice === "object")) {
    return new InvalidExchangeConfigError(`Bad dev config passed`)
  }

  if (!Object.keys(devMockPrice).includes(base)) {
    return new InvalidExchangeConfigError(`Config missing base '${base}'`)
  }

  if (!Object.keys(devMockPrice[base]).includes(quote)) {
    return new InvalidExchangeConfigError(
      `Config base missing quote '${quote}' for base '${base}'`,
    )
  }

  const fetchTicker = async (): Promise<Ticker | ServiceError> =>
    tickerFromRaw({
      rate: devMockPrice[base][quote],
      timestamp: new Date().getTime(),
    })

  return { fetchTicker }
}

const tickerFromRaw = ({
  rate,
  timestamp,
}: {
  rate: number
  timestamp: number
}): Ticker | InvalidTickerError => {
  if (rate > 0 && timestamp > 0) {
    return {
      bid: toPrice(rate),
      ask: toPrice(rate),
      timestamp: toTimestamp(timestamp),
    }
  }

  return new InvalidTickerError()
}
