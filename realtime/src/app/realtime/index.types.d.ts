type RefreshRealtimeDataArgs = {
  currency: CurrencyCode
  exchange: DevExchangeConfig | ExchangeConfig
}

type RefreshDataCallbackArgs = {
  exchangeName: string
  ticker: Ticker
}

type RefreshDataCallback = (
  error: ApplicationError | null,
  data?: RefreshDataCallbackArgs,
) => void
