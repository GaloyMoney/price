export const isDefined = <T>(item: T | undefined): item is T => {
  return !!item
}

export const median = (arr) => {
  const arr_ = arr.filter((n) => !!n)
  const mid = Math.floor(arr_.length / 2),
    nums = [...arr_].sort((a, b) => a - b)
  return arr_.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2
}

export const assertUnreachable = (x: never): never => {
  throw new Error(`This should never compile with ${x}`)
}

export const round = (number: number): number =>
  +(Math.round(Number(number + "e+2")) + "e-2")
