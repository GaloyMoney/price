import { supportedCurrencies } from "@config"

export const listCurrencies = async (): Promise<FiatCurrency[] | ApplicationError> => {
  return supportedCurrencies
}
