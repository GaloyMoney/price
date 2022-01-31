type CreateExchangeServiceArgs = {
  name: string
  base: string
  quote: string
  exchangeConfig?: { [key: string]: string | number | boolean }
}

interface IProviderService {
  createExchangeService(
    args: CreateExchangeServiceArgs,
  ): Promise<IExchangeService | ServiceError>
}
