export * from "./errors"

export const toPrice = (price: number): Price => {
  return price as Price
}

export const isExchangeActive = (timestamp: Timestamp): boolean => {
  const staleAfter = 30 * 1000 // value in ms
  return new Date().getTime() - timestamp < staleAfter
}
