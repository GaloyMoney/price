import { Mutex } from "async-mutex"

import {
  InvalidTickerError,
  ExchangeServiceError,
  UnknownExchangeServiceError,
  InvalidExchangeConfigError,
} from "@domain/exchanges"
import { toPrice, toSeconds, toTimestamp } from "@domain/primitives"
import { LocalCacheService } from "@services/cache"
import { CacheKeys } from "@domain/cache"
import { baseLogger } from "@services/logger"
import IbexClient from "ibex-client"
import { ApiError, AuthenticationError } from "ibex-client/dist/errors"
import { IBEX } from "@config"

const mutex = new Mutex()
export const IbexExchangeService = async ({
  base,
  quote,
  config,
}: IbexExchangeServiceArgs) : Promise<
  IExchangeService | ExchangeServiceError
> => {
  const cacheSeconds = config?.cacheSeconds || 180 

  const Ibex = new IbexClient(
    IBEX.url, 
    {
      email: IBEX.email,
      password: IBEX.password,
    }
  );

  const cacheKey = `${CacheKeys.CurrentTicker}:Ibex:${base}:${quote}`
  const cacheTtlSecs = Number(cacheSeconds)
  const cacheKeyStatus = `${cacheKey}:status`

  const getCachedRates = async (): Promise<IbexRates | undefined> => {
    const cachedTickers = await LocalCacheService().get<IbexRates>(cacheKey)
    if (cachedTickers instanceof Error) return undefined
    return cachedTickers
  }

  const getLastRequestStatus = async (): Promise<number> => {
    const status = await LocalCacheService().get<number>(cacheKeyStatus)
    if (status instanceof Error) return 0
    return status
  }

  const fetchTicker = async (): Promise<Ticker | ServiceError> => {
    // We cant use response.data.response.date because
    // CurrencyBeacon does not behave like a bitcoin exchange
    const timestamp = new Date().getTime()

    try {
      const cachedRates = await getCachedRates()
      if (cachedRates) return tickerFromRaw({ rate: cachedRates[quote], timestamp })

      // avoid cloudflare ban if apiKey is no longer valid
      const lastCachedStatus = await getLastRequestStatus()
      if (lastCachedStatus >= 400)
        return new UnknownExchangeServiceError(
          `Previous request failed. Error ${lastCachedStatus}`,
        )

      const primary_currency_id = getIbexId(base);
      const secondary_currency_id = getIbexId(quote);
      if (primary_currency_id === undefined) return new ExchangeServiceError(`Ibex Id not found for currency ${base}`)
      if (secondary_currency_id === undefined) return new ExchangeServiceError(`Ibex Id not found for currency ${quote}`)
      const ibexResp = await Ibex.getRate({ 
        primary_currency_id: primary_currency_id,
        secondary_currency_id: secondary_currency_id,
      })
      console.log(`ibexResp = ${JSON.stringify(ibexResp)}`)

      if (ibexResp instanceof ApiError) {
        await LocalCacheService().set<number>({
          key: cacheKeyStatus,
          value: ibexResp.code,
          ttlSecs: toSeconds(cacheTtlSecs > 0 ? cacheTtlSecs : 300),
        })
        return new UnknownExchangeServiceError(ibexResp.message)
      }
      if (ibexResp instanceof AuthenticationError) return new ExchangeServiceError(ibexResp.message)

      if (!ibexResp.rate) return new UnknownExchangeServiceError("Invalid Response. No rate found.")
      await LocalCacheService().set<IbexRates>({
        key: cacheKey,
        value: { [quote]: ibexResp.rate },
        ttlSecs: toSeconds(cacheTtlSecs > 0 ? cacheTtlSecs : 300),
      })

      // return tickerFromRaw({ rate: rates[quote], timestamp })
      return tickerFromRaw({ rate: ibexResp.rate, timestamp: ibexResp.updatedAtUnix || new Date().getTime() })
    } catch (error) {
      baseLogger.error({ error }, "Ibex unknown error")
      return new UnknownExchangeServiceError(error.message || error)
    }
  }
  
  return {
    fetchTicker: () => mutex.runExclusive(fetchTicker),
  }
}

const isRatesObjectValid = (rates: unknown): rates is IbexRates => {
  if (!rates || typeof rates !== "object") return false

  let keyCount = 0
  for (const key in rates) {
    if (typeof key !== "string" || typeof rates[key] !== "number") {
      return false
    }
    keyCount++
  }

  return !!keyCount
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


const getIbexId = (name: string) => ibexCurrencies.find(el => el.name === name)?.id
const ibexCurrencies = [
      {
          "id": 0,
          "name": "MSAT",
          "isFiat": false,
          "symbol": "MSAT",
          "accountEnabled": true
      },
      {
          "id": 1,
          "name": "SATS",
          "isFiat": false,
          "symbol": "SATs",
          "accountEnabled": false
      },
      {
          "id": 2,
          "name": "BTC",
          "isFiat": false,
          "symbol": "₿",
          "accountEnabled": false
      },
      {
          "id": 3,
          "name": "USD",
          "isFiat": true,
          "symbol": "$",
          "accountEnabled": true
      },
      {
          "id": 4,
          "name": "GTQ",
          "isFiat": true,
          "symbol": "Q",
          "accountEnabled": true
      },
      {
          "id": 5,
          "name": "MXN",
          "isFiat": true,
          "symbol": "MX$",
          "accountEnabled": true
      },
      {
          "id": 6,
          "name": "PLN",
          "isFiat": true,
          "symbol": "zł",
          "accountEnabled": false
      },
      {
          "id": 7,
          "name": "HNL",
          "isFiat": true,
          "symbol": "L",
          "accountEnabled": false
      },
      {
          "id": 9,
          "name": "ARS",
          "isFiat": true,
          "symbol": "ARS$",
          "accountEnabled": false
      },
      {
          "id": 10,
          "name": "ARS_PA",
          "isFiat": true,
          "symbol": "ARS$",
          "accountEnabled": false
      },
      {
          "id": 11,
          "name": "BRL",
          "isFiat": true,
          "symbol": "R$",
          "accountEnabled": false
      },
      {
          "id": 12,
          "name": "KES",
          "isFiat": true,
          "symbol": "KSh",
          "accountEnabled": false
      },
      {
          "id": 13,
          "name": "CHF",
          "isFiat": true,
          "symbol": "CHf",
          "accountEnabled": false
      },
      {
          "id": 14,
          "name": "COP",
          "isFiat": true,
          "symbol": "COL$",
          "accountEnabled": false
      },
      {
          "id": 15,
          "name": "NGN",
          "isFiat": true,
          "symbol": "₦",
          "accountEnabled": false
      },
      {
          "id": 16,
          "name": "SEK",
          "isFiat": true,
          "symbol": "kr",
          "accountEnabled": false
      },
      {
          "id": 17,
          "name": "AUD",
          "isFiat": true,
          "symbol": "AU $",
          "accountEnabled": false
      },
      {
          "id": 18,
          "name": "CAD",
          "isFiat": true,
          "symbol": "CA $",
          "accountEnabled": false
      },
      {
          "id": 19,
          "name": "DKK",
          "isFiat": true,
          "symbol": "Kr.",
          "accountEnabled": false
      },
      {
          "id": 20,
          "name": "HTG",
          "isFiat": true,
          "symbol": "G",
          "accountEnabled": true
      },
      {
          "id": 24,
          "name": "ZAR",
          "isFiat": true,
          "symbol": "R",
          "accountEnabled": false
      },
      {
          "id": 25,
          "name": "PHP",
          "isFiat": true,
          "symbol": "₱",
          "accountEnabled": false
      },
      {
          "id": 22,
          "name": "PEN",
          "isFiat": true,
          "symbol": "S/",
          "accountEnabled": false
      },
      {
          "id": 23,
          "name": "MKD",
          "isFiat": true,
          "symbol": "ден",
          "accountEnabled": false
      },
      {
          "id": 26,
          "name": "SRD",
          "isFiat": true,
          "symbol": "Sur$",
          "accountEnabled": false
      },
      {
          "id": 27,
          "name": "NOK",
          "isFiat": true,
          "symbol": "NKr",
          "accountEnabled": false
      },
      {
          "id": 28,
          "name": "JMD",
          "isFiat": true,
          "symbol": "J$",
          "accountEnabled": false
      },
      {
          "id": 21,
          "name": "GBP",
          "isFiat": true,
          "symbol": "£",
          "accountEnabled": true
      },
      {
          "id": 8,
          "name": "EUR",
          "isFiat": true,
          "symbol": "€",
          "accountEnabled": true
      },
      {
          "id": 29,
          "name": "USDT",
          "isFiat": false,
          "symbol": "USD₮",
          "accountEnabled": true
      }
]

