import { CacheServiceError } from "../errors"
import { CacheSetArgs } from "./index.types"


export interface ICacheService {
  set<T>(args: CacheSetArgs<T>): Promise<T | CacheServiceError>
  get<T>(key: string): Promise<T | CacheServiceError>
}

