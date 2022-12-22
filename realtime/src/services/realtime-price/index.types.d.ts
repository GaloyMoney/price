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
  totalActive(currency: CurrencyCode): number
  mid(currency: CurrencyCode): number
  spread(currency: CurrencyCode): number
  asks(currency: CurrencyCode): number[]
  bids(currency: CurrencyCode): number[]
}
