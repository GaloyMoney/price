import { defaultBaseCurrency } from "@config"
import { PriceRange, PriceRepositoryError } from "@domain/price"
import { checkedToCurrency } from "@domain/primitives"
import { PriceRepository } from "@services/database"
import { NotificationsService } from "@services/notifications"

export const notifyPriceChange = async (): Promise<boolean | ApplicationError> => {
  const quote = checkedToCurrency("USD")

  if (quote instanceof Error) {
    return quote
  }

  const rangeToQuery = PriceRange.OneDay
  const prices = await PriceRepository().listPrices({
    base: defaultBaseCurrency,
    quote,
    range: rangeToQuery,
  })

  if (prices instanceof PriceRepositoryError) {
    return prices
  }

  if (prices.length < 2) {
    return false
  }

  const notificationsService = NotificationsService()

  return notificationsService.priceChanged({
    initialPrice: prices[0],
    finalPrice: prices[prices.length - 1],
    range: rangeToQuery,
  })
}
