import { CacheServiceError, NonError } from "../errors"
import { Seconds } from "./index.types"
import { ICacheService } from "./ICacheService"

interface IAuthStorage {
  getAccessToken(): Promise<string | CacheServiceError>
  setAccessToken (token: string, expiresAt?: number): Promise<string | CacheServiceError> 
  getRefreshToken(): Promise<string | CacheServiceError>
  setRefreshToken (token: string, expiresAt?: number): Promise<string | CacheServiceError> 
}

const KEYS = {
    accessToken: "ibex:accessToken",
    refreshToken: "ibex:refreshToken"
}

export class AuthStorage implements IAuthStorage {
    cache: ICacheService 
    
    constructor(cache: ICacheService) { 
        this.cache = cache
    }

    getAccessToken = (): Promise<string | CacheServiceError> => {
        return this.cache.get(KEYS.accessToken)
    }

    setAccessToken = (token: string, expiresAt?: number): Promise<string | CacheServiceError> => {
        return this.cache.set({
            key: KEYS.accessToken,
            value: token as NonError<string>,
            ttlSecs: ttl(expiresAt) || 86400 as Seconds // default to 1 day
        })
    }

    getRefreshToken = (): Promise<string | CacheServiceError> => {
        return this.cache.get(KEYS.refreshToken)
    }

    setRefreshToken = (token: string, expiresAt?: number): Promise<string | CacheServiceError> => {
        return this.cache.set({
            key: KEYS.refreshToken,
            value: token as NonError<string>,
            ttlSecs: ttl(expiresAt) || 604800 as Seconds // defaults to 7 days
        })
    }
}

const ttl = (expiresAt?: number): Seconds | undefined => {
    if (!expiresAt) return undefined
    const ttl = Math.floor(
        ((expiresAt * 1000) - Date.now()) / 1000
    ) as Seconds
    return ttl > 0 ? ttl : undefined
}