export * from "./errors"

export const toPrice = (price: number): Price => {
  return price as Price
}
