import { PriceRange } from "@domain/price"
import { createPriceChangedEvent } from "@services/notifications/price-changed-event"

describe("createPriceChangedEvent", () => {
  it("should create a price changed event", () => {
    const range = PriceRange.OneDay
    const initialPrice = { price: 50, timestamp: 0 } as Tick
    const finalPrice = { price: 75, timestamp: 100 } as Tick
    const event = createPriceChangedEvent({ range, initialPrice, finalPrice })
    expect(event).toEqual({
      currentPriceInUsd: "75.00",
      priceChangeDirection: "Increase",
      priceChangeInBips: "5000",
      timeRange: range,
      timestamp: 100,
    })
  })
})
