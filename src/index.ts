import ccxt from 'ccxt'
import { protoDescriptor } from "./grpc";
const grpc = require('@grpc/grpc-js');

const exchange_init = {
  'enableRateLimit': true,
  'rateLimit': 1000,
  'timeout': 5000,
}

const exchanges_json = [
  {
    name: "bitfinex",
    pair: "BTC/USD"
  },
  {
    name: "binance",
    pair: "BTC/USDT"
  }, 
  {
    name: "ftx",
    pair: "BTC/USD"
  } 
]

const exchanges: any[] = []

export const median = arr => {
  const arr_ = arr.filter(n => !!n)
  const mid = Math.floor(arr_.length / 2),
    nums = [...arr_].sort((a, b) => a - b);
  return arr_.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};

const Ticker = {
  bid: undefined, 
  ask: undefined, 
  timestamp: undefined, 
  percentage: undefined,
  get active() {
    const staleAfter = 30 * 1000 // value in ms
  
    try {
      return new Date().getTime() - this.timestamp! < staleAfter 
    } catch (err) {
      console.error({err}, "can't decode input")
      return false
    }
  },
  get mid() {
    try {
      return (this.ask! + this.bid!) / 2
    } catch (err) {
      return 0
    }
  }
}

interface Data {
  exchanges: {
    bitfinex: typeof Ticker,
    binance: typeof Ticker,
    ftx: typeof Ticker,
  }
  totalActive: number,
  mid: number,
  percentage: number
  spread: number,
  asks: number[],
  bids: number[],
}

export const data: Data = {
  exchanges: {
    bitfinex: Ticker,
    binance: Ticker,
    ftx: Ticker,
  },
  // exchanges: {
  //  "bifinex": Ticker,
  //  "binance": Ticker,
  //  "ftx": Ticker,
  // }
  get totalActive() {
    return Object.values(this.exchanges).reduce((total, {active}) => total + (active ? 1 : 0), 0)
  },
  get bids() {
    const bids: number[] = []
    Object.values(this.exchanges).forEach(({bid}) => {
      if (!!bid) { 
        bids.push(bid!) 
      }
    })
    return bids
  },
  get asks() {
    const asks: number[] = []
    Object.values(this.exchanges).forEach(({ask}) => {
      if (!!ask) { 
        asks.push(ask!)  
      }
    })
    return asks
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
    const percentages: number[] = []
    Object.values(this.exchanges).forEach(({percentage}) => {
      if (!!percentage) { 
        percentages.push(percentage!)  
      }
    })
    return median(percentages)
  }
}


export const init = async () => {
  for (const exchange_json of exchanges_json) {
    const exchange = new ccxt[exchange_json.name](exchange_init)
    exchange.pair = exchange_json.pair
    exchanges.push(exchange)
  }
}

export const refresh = async (exchange) => {
    let bid, ask, percentage, timestamp

    try {
      ({bid, ask, percentage, timestamp} = await exchange.fetchTicker(exchange.pair))

    //   {
    //     symbol: 'BTC/USD',
    //     timestamp: 1616073510751,
    //     datetime: '2021-03-18T13:18:30.751Z',
    //     high: undefined,
    //     low: undefined,
    //     bid: 57996,
    //     bidVolume: undefined,
    //     ask: 57997,
    //     askVolume: undefined,
    //     vwap: undefined,
    //     open: undefined,
    //     close: 57992,
    //     last: 57992,
    //     previousClose: undefined,
    //     change: undefined,
    //     percentage: 0.05067120781173572,
    //     average: undefined,
    //     baseVolume: undefined,
    //     quoteVolume: 269803113.9994,
    //     info: {
    //       raw response...
    //     }
    //   }

    } catch (err) {
      console.error({err}, `can't refresh ${exchange.id}`)
      return
    }

    const ticker = Object.create(Ticker)

    ticker.ask = ask
    ticker.bid = bid
    ticker.timestamp = timestamp
    ticker.percentage = percentage

    data.exchanges[exchange.id] = ticker
}

const loop = async (exchange) => {
  const refresh_time = 1000

  try {
    const timeout = setTimeout(async function () {
      await refresh(exchange)

      console.log({
        exchanges: data.exchanges,
        totalActive: data.totalActive,
        mid: data.mid,
        spread: data.spread,
        percentage: data.percentage,
        bids: data.bids,
        asks: data.asks,
        exchange_updated: exchange.id,
      })

      // TODO check if this could lead to a stack overflow
      loop(exchange)

    }, refresh_time);
  } catch (err) {
    console.error({}, "loop error exiting")
  }
}

export const main = async () => {
  await init()
  exchanges.forEach(exchange => loop(exchange))
}


function getPrice(call, callback) {
  callback(null, {price: data.mid})
}

function getServer() {
  const server = new grpc.Server();
  server.addService(protoDescriptor.PriceFeed.service, {
    getPrice,
  });
  return server;
}

const routeServer = getServer();
routeServer.bindAsync('0.0.0.0:50051', 
  grpc.ServerCredentials.createInsecure(), () => {
    main()
    routeServer.start();
});


