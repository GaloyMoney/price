export class IbexClientError extends Error {
    constructor(message?: string) {
        super(message)
    }
}

export class ApiError extends IbexClientError {
    code: number // http error code
    constructor(code: number, message?: string) {
        super(message)
        this.code = code
    }
}
export class AuthenticationError extends IbexClientError {}
export class UnexpectedResponseError extends IbexClientError {}

export class CacheError extends IbexClientError {}
export class CacheServiceError extends CacheError {}
export class CacheNotAvailableError extends CacheServiceError {}
export class CacheUndefinedError extends CacheServiceError {}
export class UnknownCacheServiceError extends CacheServiceError {}
export type NonError<T> = T extends Error ? never : T
