import { ServiceError } from "../errors"

export class ExchangeServiceError extends ServiceError {}
export class InvalidExchangeIdError extends ExchangeServiceError {}
export class InvalidTickerError extends ExchangeServiceError {}
export class UnknownExchangeServiceError extends ExchangeServiceError {}
