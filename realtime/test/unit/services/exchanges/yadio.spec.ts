import axios from "axios"

import { toPrice, toTimestamp } from "@domain/primitives"
import {
  InvalidExchangeConfigError,
  InvalidExchangeResponseError,
  UnknownExchangeServiceError,
} from "@domain/exchanges"

import * as LocalCacheServiceImpl from "@services/cache"
import { YadioExchangeService } from "@services/exchanges/yadio"

// Mocked axios request data
const mockAxiosResponse = {
  data: {
    BTC: {
      COP: 127933060.81,
      EUR: 25910,
      USD: 28275.07,
    },
    base: "BTC",
    timestamp: 1680194102771,
  },
  status: 200,
}

jest.mock("axios")

describe("YadioExchangeService", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should return InvalidExchangeConfigError if config is not provided", async () => {
    const service = await YadioExchangeService({
      base: "BTC",
      quote: "USD",
      config: undefined,
    })
    expect(service).toBeInstanceOf(InvalidExchangeConfigError)
  })

  it("should return InvalidExchangeResponseError if status code is greater than or equal to 400", async () => {
    ;(axios.get as jest.Mock).mockResolvedValue({
      data: {},
      status: 400,
    })
    const service = await YadioExchangeService({
      base: "BTC",
      quote: "USD",
      config: { timeout: 5000 },
    })
    if (service instanceof Error) throw service

    const result = await service.fetchTicker()
    expect(result).toBeInstanceOf(InvalidExchangeResponseError)
  })

  it("should return UnknownExchangeServiceError if request fail", async () => {
    ;(axios.get as jest.Mock).mockRejectedValue({ response: { status: 500 } })
    const service = await YadioExchangeService({
      base: "BTC",
      quote: "USD",
      config: { timeout: 5000 },
    })
    if (service instanceof Error) throw service

    const result = await service.fetchTicker()
    expect(result).toBeInstanceOf(UnknownExchangeServiceError)
  })

  it("should return InvalidExchangeResponseError if response is not a valid rates object", async () => {
    ;(axios.get as jest.Mock).mockResolvedValue({
      data: { invalidKey: "invalidValue" },
      status: 200,
    })
    const service = await YadioExchangeService({
      base: "BTC",
      quote: "USD",
      config: { timeout: 5000 },
    })
    if (service instanceof Error) throw service

    const result = await service.fetchTicker()
    expect(result).toBeInstanceOf(InvalidExchangeResponseError)
  })

  it("should call LocalCacheService.set if cacheSeconds is greater than 0", async () => {
    ;(axios.get as jest.Mock).mockResolvedValue(mockAxiosResponse)
    const setSpy = jest.fn()
    jest.spyOn(LocalCacheServiceImpl, "LocalCacheService").mockImplementation(() => ({
      get: () => Promise.resolve(new Error()),
      getOrSet: jest.fn(),
      set: setSpy,
      clear: jest.fn(),
    }))
    const service = await YadioExchangeService({
      base: "BTC",
      quote: "USD",
      config: { cacheSeconds: 300 },
    })
    if (service instanceof Error) throw service

    await service.fetchTicker()
    expect(setSpy).toHaveBeenCalled()
  })

  it("should use local cache if cacheSeconds is greater than 0 and there is a cached ticker", async () => {
    jest.spyOn(LocalCacheServiceImpl, "LocalCacheService").mockImplementation(() => ({
      get: <T>() => Promise.resolve({ USD: 27275.07 } as T),
      getOrSet: jest.fn(),
      set: jest.fn(),
      clear: jest.fn(),
    }))
    const service = await YadioExchangeService({
      base: "BTC",
      quote: "USD",
      config: { cacheSeconds: 300 },
    })
    if (service instanceof Error) throw service

    const result = await service.fetchTicker()
    expect(result).toEqual({
      bid: toPrice(27275.07),
      ask: toPrice(27275.07),
      timestamp: toTimestamp(expect.any(Number)),
    })
  })

  it("should call yadio api if there is no cached ticker", async () => {
    ;(axios.get as jest.Mock).mockResolvedValue(mockAxiosResponse)
    const getSpy = jest.fn().mockResolvedValue(Promise.resolve(new Error()))
    jest.spyOn(LocalCacheServiceImpl, "LocalCacheService").mockImplementation(() => ({
      get: getSpy,
      getOrSet: jest.fn(),
      set: jest.fn(),
      clear: jest.fn(),
    }))

    const service = await YadioExchangeService({
      base: "BTC",
      quote: "USD",
      config: { timeout: 5000 },
    })
    if (service instanceof Error) throw service

    const result = await service.fetchTicker()
    expect(getSpy).toHaveBeenCalled()
    expect(axios.get).toHaveBeenCalledWith(
      "https://api.yadio.io/exrates/btc",
      expect.objectContaining({
        timeout: 5000,
        params: {},
      }),
    )
    expect(result).toEqual({
      bid: toPrice(28275.07),
      ask: toPrice(28275.07),
      timestamp: toTimestamp(expect.any(Number)),
    })
  })
})
