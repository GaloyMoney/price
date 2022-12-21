import { supportedCurrencies } from "@config"

import { toCurrency } from "@domain/primitives"

export const listCurrencies = async (): Promise<Currency[] | ApplicationError> => {
  return supportedCurrencies.map(toCurrency)
}
