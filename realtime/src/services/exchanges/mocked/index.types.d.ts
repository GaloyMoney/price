type MockedConfig = {
  devMockPrice: {
    [key: string]: {
      [key: string]: number
    }
  }
}

type MockedExchangeServiceArgs = {
  base: string
  quote: string
  config?: MockedConfig
}
