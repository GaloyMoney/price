export const ErrorLevel = {
  Info: "info",
  Warn: "warn",
  Critical: "critical",
} as const

export const RankedErrorLevel = [ErrorLevel.Info, ErrorLevel.Warn, ErrorLevel.Critical]

export class DomainError extends Error {
  name: string
  level?: ErrorLevel
  constructor(message?: string) {
    super(message)
    this.name = this.constructor.name
    this.level = ErrorLevel.Info
  }
}

export class ServiceError extends DomainError {}
export class UnknownServiceError extends ServiceError {
  level = ErrorLevel.Critical
}
