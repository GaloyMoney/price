const PriceDirection = {
  Increase: "Increase",
  Decrease: "Decrease",
} as const

type PriceDirection = (typeof PriceDirection)[keyof typeof PriceDirection]

type PriceChangedEvent = {
  currentPriceInUsd: string
  priceChangeDirection: PriceDirection
  priceChangeInBips: string
  timeRange: PriceRange
  timestamp: number
}

export const createPriceChangedEvent = ({
  range,
  initialPrice,
  finalPrice,
}: PriceChangedArgs): PriceChangedEvent => {
  const priceChange = calculatePriceChangeBips(initialPrice.price, finalPrice.price)

  return {
    currentPriceInUsd: finalPrice.price.toFixed(2),
    priceChangeDirection: priceChange.changeDirection,
    priceChangeInBips: priceChange.bipAmount,
    timeRange: range,
    timestamp: finalPrice.timestamp,
  }
}

const calculatePriceChangeBips = (initialPrice: Price, finalPrice: Price) => {
  const bipAmount = Math.round(
    ((finalPrice - initialPrice) / initialPrice) * 10000,
  ).toString()

  const changeDirection =
    finalPrice > initialPrice ? PriceDirection.Increase : PriceDirection.Decrease
  return { bipAmount, changeDirection }
}
