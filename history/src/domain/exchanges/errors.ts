import { ServiceError } from "../errors"

export class ExchangeServiceError extends ServiceError {}
export class InvalidExchangeProviderError extends ExchangeServiceError {}
export class InvalidExchangeIdError extends ExchangeServiceError {}
export class InvalidExchangeConfigError extends ExchangeServiceError {}

export class OHLCVNotSupportedExchangeServiceError extends ExchangeServiceError {}
export class UnknownExchangeServiceError extends ExchangeServiceError {}
