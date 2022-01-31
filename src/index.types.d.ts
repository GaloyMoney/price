type Ticker1 = {
  bid: number | undefined
  ask: number | undefined
  timestamp: number | undefined
  percentage: number | undefined
  readonly active: boolean
  readonly mid: number
}

interface Data1 {
  exchanges: {
    bitfinex: Ticker1
    binance: Ticker1
    ftx: Ticker1
  }
  readonly totalActive: number
  readonly mid: number
  readonly percentage: number
  readonly spread: number
  readonly asks: number[]
  readonly bids: number[]
}
