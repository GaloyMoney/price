import { defaultQuoteCurrency, supportedCurrencies } from "@config"
import { checkedToCurrency, InvalidCurrencyError } from "@domain/primitives"
import { RealtimePriceRepository } from "@services/realtime-price"

const realtimePriceRepository = RealtimePriceRepository()

export const getPrice = async (currency: string): Promise<Price | ApplicationError> => {
  const checkedCurrency = checkedToCurrency(currency || defaultQuoteCurrency)
  if (checkedCurrency instanceof Error) return checkedCurrency

  const supportedCurrency = supportedCurrencies.find((c) => c === checkedCurrency)
  if (!supportedCurrency) return new InvalidCurrencyError()

  return realtimePriceRepository.getPrice(checkedCurrency)
}
