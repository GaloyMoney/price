import { coerceToStringArray, ConfigError, getFractionDigits } from "@config"

describe("coerceToStringArray", () => {
  it("returns an empty array if the input is falsy", () => {
    expect(coerceToStringArray(undefined)).toEqual([])
    expect(coerceToStringArray(null)).toEqual([])
    expect(coerceToStringArray(false)).toEqual([])
    expect(coerceToStringArray("")).toEqual([])
  })

  it("returns an array with a single uppercase string if the input is a string", () => {
    expect(coerceToStringArray("usd")).toEqual(["USD"])
  })

  it("returns an array of uppercase strings if the input is an array of strings", () => {
    expect(coerceToStringArray(["usd", "eur"])).toEqual(["USD", "EUR"])
  })

  it("throws a ConfigError if the input is not a string or an array of strings", () => {
    expect(() => coerceToStringArray(21)).toThrow(ConfigError)
    expect(() => coerceToStringArray({ attr: "value" })).toThrow(ConfigError)
    expect(() => coerceToStringArray(["usd", 21])).toThrow(ConfigError)
  })
})

describe("getFractionDigits", () => {
  const USD = "USD" as CurrencyCode
  const JPY = "JPY" as CurrencyCode

  test("returns correct fraction digits for a valid currency", () => {
    const resultUsd = getFractionDigits({ currency: USD })
    expect(resultUsd).toBe(2)
    const resultJpy = getFractionDigits({ currency: JPY })
    expect(resultJpy).toBe(0)
  })

  test("returns provided fraction digits for a valid currency", () => {
    const currency = USD
    const fractionDigits = 3
    const result = getFractionDigits({ currency, fractionDigits })
    expect(result).toBe(fractionDigits)
  })

  test("returns provided fraction digits for a non-standard currency", () => {
    const currency = "ARSp" as CurrencyCode
    const fractionDigits = 3
    const result = getFractionDigits({ currency, fractionDigits })
    expect(result).toBe(fractionDigits)
  })

  test("throws ConfigError for an invalid currency", () => {
    const currency = "INVALID" as CurrencyCode
    const expectedErrorMessage = `Invalid currency. If ${currency} is a custom currency please add fractionDigits`
    expect(() => getFractionDigits({ currency })).toThrow(ConfigError)
    expect(() => getFractionDigits({ currency })).toThrowError(expectedErrorMessage)
  })
})
