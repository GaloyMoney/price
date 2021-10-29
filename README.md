# Price

The price service exposes a GRPC endpoint providing a near real-time BTC/USD price index based on the recent median of mid-prices from these exchanges and currency pairs:

- Bitfinex BTC/USD
- Binance BTC/USDT
- FTX BTC/USD

A health check/watch is also available to guard against price staleness.

The price index is calculated by polling each pair bid-ask price, calculating the mid and taking the median of the collection.

The services are:

- Price.GetPrice()
- Health.Check()
- Health.Watch()

For usage, see the [sample client](./src/client_test.ts)
