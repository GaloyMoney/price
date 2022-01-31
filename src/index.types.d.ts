type Ticker = {
  bid: number | undefined
  ask: number | undefined
  timestamp: number | undefined
  percentage: number | undefined
  readonly active: boolean
  readonly mid: number
}

interface Data {
  exchanges: {
    bitfinex: Ticker
    binance: Ticker
    ftx: Ticker
  }
  readonly totalActive: number
  readonly mid: number
  readonly percentage: number
  readonly spread: number
  readonly asks: number[]
  readonly bids: number[]
}
