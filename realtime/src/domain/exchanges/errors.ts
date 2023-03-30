import { ErrorLevel, ServiceError } from "../errors"

export class ExchangeServiceError extends ServiceError {}
export class InvalidExchangeProviderError extends ExchangeServiceError {}
export class InvalidExchangeIdError extends ExchangeServiceError {}
export class InvalidExchangeConfigError extends ExchangeServiceError {}
export class InvalidTickerError extends ExchangeServiceError {}
export class InvalidExchangeResponseError extends ExchangeServiceError {
  level = ErrorLevel.Critical
}
export class UnknownExchangeServiceError extends ExchangeServiceError {
  level = ErrorLevel.Critical
}
