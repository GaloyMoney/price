type ExchangeTickerData = {
  bid: number | undefined
  ask: number | undefined
  timestamp: number | undefined
  readonly active: boolean
  readonly mid: number
}

type ExchangesData = { [currency: string]: { [exchange: string]: ExchangeTickerData } }

interface Data {
  exchanges: ExchangesData
  totalActive(currency: Currency): number
  mid(currency: Currency): number
  spread(currency: Currency): number
  asks(currency: Currency): number[]
  bids(currency: Currency): number[]
}

type Provider = "ccxt" | "exchangeratesapi"

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
