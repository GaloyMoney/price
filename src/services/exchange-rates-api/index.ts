import { ExchangeRatesAPIExchangeService } from "./service"

export const ExchangeRatesAPIProviderService = (): IProviderService => {
  const createExchangeService = async ({
    base,
    quote,
    exchangeConfig,
  }: CreateExchangeServiceArgs): Promise<IExchangeService | ServiceError> => {
    return ExchangeRatesAPIExchangeService({
      base: base,
      quote: quote,
      config: exchangeConfig,
    })
  }

  return { createExchangeService }
}
