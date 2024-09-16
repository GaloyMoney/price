import { CacheNotAvailableError, CacheServiceError, CacheUndefinedError, UnknownCacheServiceError } from "../errors"
import { ICacheService } from "./ICacheService"
import NodeCache from "node-cache"
import { CacheSetArgs } from "./index.types"

const localCache = new NodeCache()

export const InMemoryCache = (): ICacheService => {
  const set = <T>({
    key,
    value,
    ttlSecs,
  }: CacheSetArgs<T>): Promise<T | CacheServiceError> => {
    try {
      const res = localCache.set<T>(key, value, ttlSecs)
      if (res) return Promise.resolve(value)
      return Promise.resolve(new CacheNotAvailableError())
    } catch (err: any) {
      return Promise.resolve(new UnknownCacheServiceError(err.message))
    }
  }

  const get = <T>(key: string): Promise<T | CacheServiceError> => {
    try {
      const value = localCache.get<T>(key)
      if (value === undefined) return Promise.resolve(new CacheUndefinedError())
      return Promise.resolve(value)
    } catch (err: any) {
      return Promise.resolve(new UnknownCacheServiceError(err.message))
    }
  }

  return {
    get,
    set
  }
}