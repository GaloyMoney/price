import { promisify } from "util"

import { credentials, Metadata } from "@grpc/grpc-js"

import { NotificationsServiceClient } from "./proto/notifications_grpc_pb"
import {
  HandleNotificationEventRequest,
  HandleNotificationEventResponse,
} from "./proto/notifications_pb"

export type GrpcNotificationsClientConfig = {
  notificationsApi: string
}

export const GrpcNotificationsClient = ({
  notificationsApi,
}: GrpcNotificationsClientConfig) => {
  const notificationsClient = new NotificationsServiceClient(
    notificationsApi,
    credentials.createInsecure(),
  )
  const metadata = new Metadata()

  const handleNotificationEvent = (request: HandleNotificationEventRequest) => {
    return promisify<
      HandleNotificationEventRequest,
      Metadata,
      HandleNotificationEventResponse
    >(notificationsClient.handleNotificationEvent.bind(notificationsClient))(
      request,
      metadata,
    )
  }

  return {
    handleNotificationEvent,
  }
}
