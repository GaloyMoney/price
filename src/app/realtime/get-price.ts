import { defaultQuoteCurrency, supportedCurrencies } from "@config"
import { checkedToCurrency, InvalidCurrencyError, toPrice } from "@domain/primitives"

import { realTimeData } from "./data"

export const getPrice = async (currency: string): Promise<Price | ApplicationError> => {
  const checkedCurrency = checkedToCurrency(currency || defaultQuoteCurrency)
  if (checkedCurrency instanceof Error) return checkedCurrency

  const supportedCurrency = supportedCurrencies.find((c) => c === checkedCurrency)
  if (!supportedCurrency) return new InvalidCurrencyError()

  return toPrice(realTimeData.mid(checkedCurrency))
}

export const getExchangePrices = async (
  currency: string,
): Promise<ExchangePrice[] | ApplicationError> => {
  const checkedCurrency = checkedToCurrency(currency || defaultQuoteCurrency)
  if (checkedCurrency instanceof Error) return checkedCurrency

  const supportedCurrency = supportedCurrencies.find((c) => c === checkedCurrency)
  if (!supportedCurrency) return new InvalidCurrencyError()

  const exchanges = realTimeData.exchanges[currency]

  const prices: ExchangePrice[] = []
  for (const exchangeName in exchanges) {
    prices.push({
      exchangeName,
      price: toPrice(exchanges[exchangeName].mid),
    })
  }

  return prices
}
