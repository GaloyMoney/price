import { isDefined, median } from "@utils"

const exchanges: ExchangesData = {}
export const data: Data = {
  exchanges,
  totalActive(currency: Currency) {
    return Object.values(this.exchanges[currency]).reduce(
      (total, { active }) => total + (active ? 1 : 0),
      0,
    )
  },
  bids(currency: Currency) {
    return Object.values(this.exchanges[currency])
      .filter((e) => e.active)
      .map<number | undefined>((e) => e.bid)
      .filter(isDefined)
  },
  asks(currency: Currency) {
    return Object.values(this.exchanges[currency])
      .filter((e) => e.active)
      .map<number | undefined>((e) => e.ask)
      .filter(isDefined)
  },
  mid(currency: Currency) {
    const ask = median(this.asks(currency))
    const bid = median(this.bids(currency))
    return (ask + bid) / 2
  },
  spread(currency: Currency) {
    const highAsk = Math.max(...this.asks(currency))
    const lowBid = Math.min(...this.bids(currency))
    const spread = (highAsk - lowBid) / lowBid
    return spread
  },
}
