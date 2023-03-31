import { supportedCurrencies } from "@config"
import { ServiceStatus } from "@domain/index"
import { RealtimePriceRepository } from "@services/realtime-price"

const realtimePriceRepository = RealtimePriceRepository()
const USD = "USD" as CurrencyCode
const THRESHOLD = 0.7

export const getStatus = async (): Promise<ServiceStatus | ApplicationError> => {
  const hasUsdActiveExchanges = await realtimePriceRepository.hasActiveExchanges(USD)
  if (hasUsdActiveExchanges instanceof Error) return hasUsdActiveExchanges
  if (!hasUsdActiveExchanges) return ServiceStatus.NOT_SERVING

  let servingCurrencies = 0
  for (const currency of supportedCurrencies) {
    const hasActiveExchanges = await realtimePriceRepository.hasActiveExchanges(
      currency.code,
    )
    if (hasActiveExchanges instanceof Error) return hasActiveExchanges
    if (hasActiveExchanges) servingCurrencies++
  }

  const servingRatio = servingCurrencies / supportedCurrencies.length
  return servingRatio >= THRESHOLD ? ServiceStatus.SERVING : ServiceStatus.NOT_SERVING
}
