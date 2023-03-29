import * as configModule from "@config"
import { ConfigError, getExchangesConfig, supportedCurrencies, yamlConfig } from "@config"

const yamlConfigMock = {
  quotes: [
    { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸", fractionDigits: 2 },
    { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺", fractionDigits: 2 },
    { code: "JPY", symbol: "¥", name: "Japanese Yen", flag: "🇯🇵", fractionDigits: 0 },
    { code: "VND", symbol: "₫", name: "Vietnamese Dong", flag: "🇻🇳", fractionDigits: 0 },
  ],
  exchanges: [
    {
      name: "test-provider",
      enabled: true,
      quoteAlias: "*",
      base: "USD",
      quote: "*",
      excludedQuotes: "VND",
      provider: "free-currency-rates",
      cron: "*/5 * * * * *",
    },
  ],
}

const exchangeConfigType = {
  name: expect.any(String),
  base: expect.any(String),
  quote: expect.any(String),
  quoteAlias: expect.any(String),
  excludedQuotes: expect.any(Array),
  provider: expect.any(String),
  cron: expect.any(String),
}

Object.defineProperties(yamlConfig, {
  exchanges: {
    configurable: true,
    get() {
      return configModule.yamlConfig.exchanges
    },
  },
})

describe("getExchangesConfig", () => {
  beforeEach(() => {
    supportedCurrencies.length = 0
    supportedCurrencies.push(...(yamlConfigMock.quotes as FiatCurrency[]))
    jest.spyOn(yamlConfig, "exchanges", "get").mockReturnValue(yamlConfigMock.exchanges)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("should return ExchangeConfig array with all supported currencies when quote is *", () => {
    const result = getExchangesConfig()
    expect(Array.isArray(result)).toBeTruthy()
    expect(result.length).toBe(2) // excludes VND as default
    expect(result).toEqual(
      expect.arrayContaining([expect.objectContaining(exchangeConfigType)]),
    )
  })

  it("should throw a ConfigError for invalid cron expression", () => {
    const invalidYamlConfig = {
      ...yamlConfigMock,
      exchanges: [
        {
          ...yamlConfigMock.exchanges[0],
          cron: "invalid-cron-expression",
        },
      ],
    }
    jest
      .spyOn(yamlConfig, "exchanges", "get")
      .mockReturnValue(invalidYamlConfig.exchanges)

    expect(() => configModule.getExchangesConfig()).toThrow(
      new ConfigError("Invalid test-provider cron expression"),
    )
  })

  it("should throw a ConfigError for different quote and quoteAlias lengths", () => {
    const invalidYamlConfig = {
      ...yamlConfigMock,
      exchanges: [
        {
          ...yamlConfigMock.exchanges[0],
          quoteAlias: ["USD", "EUR"],
          quote: ["USDT"],
        },
      ],
    }
    jest
      .spyOn(yamlConfig, "exchanges", "get")
      .mockReturnValue(invalidYamlConfig.exchanges)

    expect(() => configModule.getExchangesConfig()).toThrow(
      new ConfigError("Invalid test-provider quote and quoteAlias values"),
    )
  })

  it("should return ExchangeConfig array with specified currencies when quote is an array of currencies", () => {
    const currencies = [
      { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸" },
      { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺" },
    ]
    const currenciesCodes = currencies.map((c) => c.code)
    const yamlConfigWithCurrencies = {
      ...yamlConfigMock,
      quotes: currencies,
      exchanges: [
        {
          ...yamlConfigMock.exchanges[0],
          quote: currenciesCodes,
          quoteAlias: currenciesCodes,
        },
      ],
    }
    supportedCurrencies.length = 0
    supportedCurrencies.push(...(yamlConfigMock.quotes as FiatCurrency[]))
    jest
      .spyOn(yamlConfig, "exchanges", "get")
      .mockReturnValue(yamlConfigWithCurrencies.exchanges)

    const result = getExchangesConfig()

    expect(Array.isArray(result)).toBeTruthy()
    expect(result.length).toBe(1)
    expect(result[0]).toMatchObject(exchangeConfigType)
    expect(result[0].quote).toBe("EUR")
  })
})
