type NotificationsServiceError = import("./errors").NotificationsServiceError

interface INotificationsService {
  priceChanged(args: PriceChangedArgs): Promise<void | NotificationsServiceError>
}

type PriceChangedArgs = {
  range: PriceRange
  initialPrice: Tick
  finalPrice: Tick
}
