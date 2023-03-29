import { coerceToStringArray, ConfigError } from "@config"

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
