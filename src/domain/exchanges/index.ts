export * from "./errors"

export const isExchangeActive = (timestamp: Timestamp): boolean => {
  const staleAfter = 30 * 1000 // value in ms
  return new Date().getTime() - timestamp < staleAfter
}
