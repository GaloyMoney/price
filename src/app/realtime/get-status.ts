import { supportedCurrencies } from "@config"
import { ServiceStatus } from "@domain/index"
import { RealtimePriceRepository } from "@services/realtime-price"

const realtimePriceRepository = RealtimePriceRepository()

export const getStatus = async (): Promise<ServiceStatus | ApplicationError> => {
  for (const currency of supportedCurrencies) {
    const hasActiveExchanges = await realtimePriceRepository.hasActiveExchanges(currency)
    if (hasActiveExchanges instanceof Error) return hasActiveExchanges
    if (!hasActiveExchanges) return ServiceStatus.NOT_SERVING
  }

  return ServiceStatus.SERVING
}
