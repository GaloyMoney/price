import { defaultBaseCurrency, defaultQuoteCurrency, supportedCurrencies } from "@config"
import { checkedToPriceRange, PriceRange } from "@domain/price"
import { checkedToCurrency, InvalidCurrencyError } from "@domain/primitives"
import { PriceRepository } from "@services/database"

const priceRepository = PriceRepository("bitfinex")

export const getPriceHistory = async ({
  currency,
  range,
}: GetPriceHistoryArgs): Promise<Tick[] | ApplicationError> => {
  const quote = checkedToCurrency(currency || defaultQuoteCurrency)
  if (quote instanceof Error) return quote

  const priceRange = checkedToPriceRange(range || PriceRange.OneDay)
  if (priceRange instanceof Error) return priceRange

  const supportedCurrency = supportedCurrencies.find((c) => c === quote)
  if (!supportedCurrency) return new InvalidCurrencyError()

  return priceRepository.listPrices({
    base: defaultBaseCurrency,
    quote,
    range: priceRange,
  })
}
