// import { GetRatesResponse200, GetRatesV2MetadataParam } from "./client/.api/apis/sing-in/types"

type IbexUrl = string & { readonly brand: unique symbol }
type IbexCredentials = { email: string, password: string }

type IbexConfig = { [key: string]: string | number | boolean }
type IbexRates = { [key: string]: number }

// type GetIbexRatesResponse = GetRatesResponse200
// {
//   meta: {
//     code: number
//     disclaimer: string
//   }
//   response: {
//     date: string
//     base: string
//     rates: unknown
//   }
// }

// type IbexExchangeServiceArgs = GetRatesV2MetadataParam
type IbexExchangeServiceArgs = {
  base: string
  quote: string
  config?: IbexConfig
}