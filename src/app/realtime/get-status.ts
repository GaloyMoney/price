import { supportedCurrencies } from "@config"
import { ServiceStatus } from "@domain/index"

import { realTimeData } from "./data"

export const getStatus = async (): Promise<ServiceStatus | ApplicationError> => {
  const isActive = supportedCurrencies
    .map((c: Currency) => (realTimeData.totalActive(c) > 0 ? 1 : 2))
    .every((i) => i === 1)

  return isActive ? ServiceStatus.SERVING : ServiceStatus.NOT_SERVING
}
