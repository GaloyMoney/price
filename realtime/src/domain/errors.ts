class DomainError extends Error {
  name = this.constructor.name
}

export class ServiceError extends DomainError {}
export class UnknownServiceError extends ServiceError {}
