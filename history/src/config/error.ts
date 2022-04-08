export class ConfigError<T> extends Error {
  data?: T
  constructor(message?: string, data?: T) {
    super(message)
    this.data = data
  }
}
