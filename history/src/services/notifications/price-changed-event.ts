import { Money, PriceChangeDirection, PriceChanged } from "./proto/notifications_pb"

export const createPriceChangedEvent = ({
  initialPrice,
  finalPrice,
}: PriceChangedArgs) => {
  const priceChange = calculatePriceChangePercentage(initialPrice.price, finalPrice.price)

  const priceOfOneBitcoin = new Money()
  priceOfOneBitcoin.setMinorUnits(usdMajorUnitToMinorUnit(finalPrice.price))
  priceOfOneBitcoin.setCurrencyCode("USD")

  const priceChangedEvent = new PriceChanged()
  priceChangedEvent.setPriceOfOneBitcoin(priceOfOneBitcoin)
  priceChangedEvent.setDirection(priceChange.direction)
  priceChangedEvent.setPriceChangePercentage(priceChange.percentage)
  return priceChangedEvent
}

const usdMajorUnitToMinorUnit = (usd: number) => usd * 100

const calculatePriceChangePercentage = (initialPrice: Price, finalPrice: Price) => {
  const percentage = Math.abs(((finalPrice - initialPrice) / initialPrice) * 100)

  const direction =
    finalPrice > initialPrice ? PriceChangeDirection.UP : PriceChangeDirection.DOWN
  return { percentage, direction }
}
