type NotificationsServiceError = import("./errors").NotificationsServiceError

interface INotificationsService {
  priceChanged(args: PriceChangedArgs): Promise<true | NotificationsServiceError>
}

type PriceChangedArgs = {
  range: PriceRange
  initialPrice: Tick
  finalPrice: Tick
}
