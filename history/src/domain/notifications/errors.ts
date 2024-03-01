import { ErrorLevel, ServiceError } from "../errors"

export class NotificationsServiceError extends ServiceError {}
export class UnknownNotificationServiceError extends NotificationsServiceError {
  level = ErrorLevel.Critical
}
