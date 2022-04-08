import { DomainError } from "@domain/errors"

export class CacheError extends DomainError {}

export class LocalCacheServiceError extends CacheError {}
export class LocalCacheNotAvailableError extends LocalCacheServiceError {}
export class LocalCacheUndefinedError extends LocalCacheServiceError {}
export class UnknownLocalCacheServiceError extends LocalCacheServiceError {}
