export const parseErrorFromUnknown = (error: unknown): Error => {
  const err =
    error instanceof Error
      ? error
      : typeof error === "string"
      ? new Error(error)
      : error instanceof Object
      ? new Error(JSON.stringify(error))
      : new Error("Unknown error")
  return err
}
