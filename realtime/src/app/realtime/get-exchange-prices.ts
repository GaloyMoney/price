import { defaultQuoteCurrency, supportedCurrencies } from "@config"
import { checkedToCurrencyCode, InvalidCurrencyError } from "@domain/primitives"
import { RealtimePriceRepository } from "@services/realtime-price"

const realtimePriceRepository = RealtimePriceRepository()

export const getExchangePrices = async (
  currency: string,
): Promise<ExchangePrice[] | ApplicationError> => {
  const checkedCurrency = checkedToCurrencyCode(currency || defaultQuoteCurrency.code)
  if (checkedCurrency instanceof Error) return checkedCurrency

  const supportedCurrency = supportedCurrencies.find((c) => c.code === checkedCurrency)
  if (!supportedCurrency) return new InvalidCurrencyError()

  return realtimePriceRepository.getExchangePrices(checkedCurrency)
}
