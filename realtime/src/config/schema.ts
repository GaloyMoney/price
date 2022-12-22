import { JTDDataType } from "ajv/dist/types/jtd-schema"

export type ConfigSchema = JTDDataType<typeof import("./schema").configSchema>

export const configSchema = {
  type: "object",
  properties: {
    base: { type: "string" },
    quotes: {
      type: "array",
      uniqueItems: true,
      items: {
        type: "object",
        properties: {
          code: { type: "string" },
          symbol: { type: "string" },
          name: { type: "string" },
          flag: { type: "string", default: "" },
        },
        required: ["code", "symbol", "name"],
        additionalProperties: false,
      },
    },
    exchanges: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          enabled: { type: "boolean", default: false },
          quoteAlias: { type: "string", default: "USD" },
          base: { type: "string", default: "BTC" },
          quote: { type: "string", default: "USD" },
          provider: { type: "string", enum: ["ccxt", "exchangeratesapi"] },
          cron: { type: "string" },
          config: { type: "object" },
        },
        required: ["name", "quoteAlias", "base", "quote", "provider", "cron"],
        additionalProperties: false,
      },
      uniqueItems: true,
    },
  },
  required: ["base", "quotes", "exchanges"],
  additionalProperties: false,
} as const
