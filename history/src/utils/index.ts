export const assertUnreachable = (x: never): never => {
  throw new Error(`This should never compile with ${x}`)
}

export const unixTimestamp = (date: Date) => Math.floor(date.getTime() / 1000)
