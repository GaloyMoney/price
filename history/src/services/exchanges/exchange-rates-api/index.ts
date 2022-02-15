import {
  ExchangeServiceError,
  InvalidExchangeConfigError,
  OHLCVNotSupportedExchangeServiceError,
} from "@domain/exchanges"

export const ExchangeRatesAPIExchangeService = async ({
  config,
}: ExchangeRatesAPIExchangeServiceArgs): Promise<
  IExchangeService | ExchangeServiceError
> => {
  if (!config || !config.apiKey) return new InvalidExchangeConfigError()

  const listPrices = async (
    args: ExchangeListPricesArgs,
  ): Promise<ExchangePrice[] | ServiceError> => {
    return new OHLCVNotSupportedExchangeServiceError(args.timeframe)
  }

  return { listPrices }
}
