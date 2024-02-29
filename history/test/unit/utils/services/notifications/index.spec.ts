import { PriceRange } from "@domain/price"
import { createPriceChangedEvent } from "@services/notifications/price-changed-event"
import { PriceChangeDirection } from "@services/notifications/proto/notifications_pb"

describe("createPriceChangedEvent", () => {
  it("should create a price changed event", () => {
    const range = PriceRange.OneDay
    const initialPrice = { price: 50, timestamp: 0 } as Tick
    const finalPrice = { price: 75, timestamp: 100 } as Tick
    const event = createPriceChangedEvent({ range, initialPrice, finalPrice })

    expect(event.getDirection()).toEqual(PriceChangeDirection.UP)
    expect(event.getPriceChangePercentage()).toEqual(50)
    expect(event.getPriceOfOneBitcoin()?.getMinorUnits()).toEqual(7500)
    expect(event.getPriceOfOneBitcoin()?.getCurrencyCode()).toEqual("USD")
  })
})
