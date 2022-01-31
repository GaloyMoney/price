import { CcxtExchangeService } from "./service"

export const CcxtProviderService = (): IProviderService => {
  const createExchangeService = async ({
    name,
    base,
    quote,
    exchangeConfig,
  }: CreateExchangeServiceArgs): Promise<IExchangeService | ServiceError> => {
    return CcxtExchangeService({
      exchangeId: name,
      base: base,
      quote: quote,
      config: exchangeConfig,
    })
  }

  return { createExchangeService }
}
