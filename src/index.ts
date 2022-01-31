import ccxt, { Exchange } from "ccxt"
import pino from "pino"
import dotenv from "dotenv"
import { Server, ServerCredentials } from "@grpc/grpc-js"
import healthCheck from "grpc-health-check"

import { protoDescriptor } from "./grpc"

dotenv.config()

export const logger = pino({
  level: process.env.LOGLEVEL || "info",
})

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Define service status map. Key is the service name, value is the corresponding status.
// By convention, the empty string "" key represents that status of the entire server.
const statusMap = {
  "": 2,

  // 1 is serving
  // 2 is not serving
}

// Construct the health service implementation
const healthImpl = new healthCheck.Implementation(statusMap)

const exchange_init = {
  enableRateLimit: true,
  rateLimit: 2000,
  timeout: 8000,
}

const exchanges_json = [
  {
    name: "bitfinex2",
    pair: "BTC/USD",
  },
  {
    name: "binance",
    pair: "BTC/USDT",
  },
  {
    name: "ftx",
    pair: "BTC/USD",
  },
]

const exchanges: Exchange[] = []

export const median = (arr) => {
  const arr_ = arr.filter((n) => !!n)
  const mid = Math.floor(arr_.length / 2),
    nums = [...arr_].sort((a, b) => a - b)
  return arr_.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2
}

const ticker: Ticker = {
  bid: undefined,
  ask: undefined,
  timestamp: undefined,
  percentage: undefined,
  get active() {
    const staleAfter = 30 * 1000 // value in ms
    if (this.timestamp) {
      return new Date().getTime() - this.timestamp < staleAfter
    }
    return false
  },
  get mid() {
    if (this.active && this.ask && this.bid) {
      return (this.ask + this.bid) / 2
    }
    return NaN
  },
}

const isDefined = <T>(item: T | undefined): item is T => {
  return !!item
}

export const data: Data = {
  exchanges: {
    bitfinex: Object.create(ticker),
    binance: Object.create(ticker),
    ftx: Object.create(ticker),
  },
  get totalActive() {
    const total = Object.values(this.exchanges).reduce(
      (total, { active }) => total + (active ? 1 : 0),
      0,
    )
    healthImpl.setStatus("", total > 0 ? 1 : 2)
    return total
  },
  get bids() {
    return Object.values(this.exchanges)
      .filter((e) => e.active)
      .map<number | undefined>((e) => e.bid)
      .filter(isDefined)
  },
  get asks() {
    return Object.values(this.exchanges)
      .filter((e) => e.active)
      .map<number | undefined>((e) => e.ask)
      .filter(isDefined)
  },
  get mid() {
    const ask = median(this.asks)
    const bid = median(this.bids)
    return (ask + bid) / 2
  },
  get spread() {
    const high_ask = Math.max(...this.asks)
    const low_bid = Math.min(...this.bids)
    const spread = (high_ask - low_bid) / low_bid
    return spread
  },
  get percentage() {
    // FIXME: different scale
    // binance: {
    //   percentage: 5.583
    // },
    // ftx: {
    //   percentage: 0.05661823757027086
    // }

    const percentages = Object.values(this.exchanges)
      .map<number | unknown>((e) => e.percentage)
      .filter(isDefined)
    return median(percentages)
  },
}

export const init = () => {
  // FIXME: if the exchange doesn't initialize properly on the first call
  // then it seems ccxt will never be able to fetch data back from this exchange
  // so in case of init failure there should be a loop such that the init keep retrying
  // until successful, with some form of a backoff.

  // look at: https://github.com/ccxt/ccxt/wiki/Manual#market-cache-force-reload
  for (const exchange_json of exchanges_json) {
    const exchange: Exchange = new ccxt[exchange_json.name](exchange_init)
    exchange.pair = exchange_json.pair
    exchanges.push(exchange)
  }
}

export const refresh = async (exchange: Exchange) => {
  let bid, ask, percentage, timestamp
  try {
    ;({ bid, ask, percentage, timestamp } = await exchange.fetchTicker(exchange.pair))
  } catch (err) {
    logger.warn({ name: exchange.id, err }, `can't refresh ${exchange.id}`)
    await sleep(5000)
    return
  }

  const ticker = data.exchanges[exchange.name.toLowerCase()]

  ticker.ask = ask
  ticker.bid = bid
  ticker.timestamp = timestamp
  ticker.percentage = percentage
}

const loop = async (exchange: Exchange) => {
  await refresh(exchange)

  const refresh_time = 2000

  logger.debug({
    exchanges: data.exchanges,
    totalActive: data.totalActive,
    mid: data.mid,
    spread: data.spread,
    percentage: data.percentage,
    bids: data.bids,
    asks: data.asks,
    exchange_updated: exchange.id,
  })

  setTimeout(async () => {
    // TODO check if this could lead to a stack overflow
    loop(exchange)
  }, refresh_time)
}

export const main = async () => {
  init()
  await sleep(500)

  exchanges.forEach((exchange) => loop(exchange))
}

function getPrice(call, callback) {
  callback(null, { price: data.mid })
}

export const startServer = () => {
  const port = process.env.PORT || 50051
  const server = new Server()

  server.addService(protoDescriptor.PriceFeed.service, { getPrice })
  server.addService(healthCheck.service, healthImpl)

  server.bindAsync(`0.0.0.0:${port}`, ServerCredentials.createInsecure(), () => {
    logger.info(`Price server running on port ${port}`)
    main()
    server.start()
  })

  return server
}

if (require.main === module) {
  startServer()
}
