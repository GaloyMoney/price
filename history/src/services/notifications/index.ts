import { notificationsEndpoint } from "@config"
import {
  NotificationsServiceError,
  UnknownNotificationServiceError,
} from "@domain/notifications"

import { GrpcNotificationsClient } from "./grpc-client"
import { createPriceChangedEvent } from "./price-changed-event"
import {
  HandleNotificationEventRequest,
  NotificationEvent,
} from "./proto/notifications_pb"

export const NotificationsService = (): INotificationsService => {
  const grpcClient = GrpcNotificationsClient({
    notificationsApi: notificationsEndpoint,
  })

  const priceChanged = async (
    args: PriceChangedArgs,
  ): Promise<true | NotificationsServiceError> => {
    try {
      const req = new HandleNotificationEventRequest()
      const event = new NotificationEvent()
      const priceChangedEvent = createPriceChangedEvent(args)
      event.setPrice(priceChangedEvent)
      req.setEvent(event)
      await grpcClient.handleNotificationEvent(req)
      return true
    } catch (err) {
      if (err instanceof Error) {
        return new NotificationsServiceError(err.message)
      }
      return new UnknownNotificationServiceError(err.toString())
    }
  }
  return {
    priceChanged,
  }
}
