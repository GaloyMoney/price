export type Seconds = number & { readonly brand: unique symbol }

// LocalCacheKeys =
//   (typeof import("./index").CacheKeys)[keyof typeof import("./index").CacheKeys]

export type CacheSetArgs<T> = {
  key: string
  value: T
  ttlSecs: Seconds
}

export type CacheGetOrSetArgs<F extends () => ReturnType<F>> = {
  key: string
  fn: F
  ttlSecs: Seconds
}