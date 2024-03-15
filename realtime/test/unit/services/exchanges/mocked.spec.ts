import { toPrice, toTimestamp } from "@domain/primitives"
import { InvalidExchangeConfigError } from "@domain/exchanges"

import { MockedExchangeService } from "@services/exchanges/mocked"

describe("MockedExchangeService", () => {
  it("should return InvalidExchangeConfigError if config is not provided", async () => {
    const service = await MockedExchangeService({
      base: "BTC",
      quote: "USD",
      config: undefined,
    })
    expect(service).toBeInstanceOf(InvalidExchangeConfigError)
  })

  it("should return expected tickers from config", async () => {
    const usdService = await MockedExchangeService({
      base: "BTC",
      quote: "USD",
      config: {
        devMockPrice: {
          BTC: { EUR: 25910, USD: 28275.07 },
        },
      },
    })
    if (usdService instanceof Error) throw usdService

    const usdResult = await usdService.fetchTicker()
    expect(usdResult).toEqual({
      bid: toPrice(28275.07),
      ask: toPrice(28275.07),
      timestamp: toTimestamp(expect.any(Number)),
    })

    const eurService = await MockedExchangeService({
      base: "BTC",
      quote: "EUR",
      config: {
        devMockPrice: {
          BTC: { EUR: 25910, USD: 28275.07 },
        },
      },
    })
    if (eurService instanceof Error) throw eurService

    const eurResult = await eurService.fetchTicker()
    expect(eurResult).toEqual({
      bid: toPrice(25910),
      ask: toPrice(25910),
      timestamp: toTimestamp(expect.any(Number)),
    })
  })
})
