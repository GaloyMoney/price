import { Exchange } from "ccxt"

type CcxtConfig = { [key in keyof Exchange]?: Exchange[key] }

type CcxtExchangeServiceArgs = {
  exchangeId: string
  base: string
  quote: string
  config?: CcxtConfig
}
