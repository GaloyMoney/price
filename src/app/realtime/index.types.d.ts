type RefreshRealtimeDataArgs = {
  currency: Currency
  exchange: ExchangeConfig
}

type RefreshDataCallbackArgs = {
  exchangeName: string
  ticker: Ticker
}

type RefreshDataCallback = (
  error: ApplicationError | null,
  data?: RefreshDataCallbackArgs,
) => void
