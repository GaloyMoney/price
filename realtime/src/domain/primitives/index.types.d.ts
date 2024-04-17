type CurrencyCode = string & { readonly brand: unique symbol }
type Price = number & { readonly brand: unique symbol }
type Timestamp = number & { readonly brand: unique symbol }
type Seconds = number & { readonly brand: unique symbol }

type FiatCurrency = {
  readonly code: CurrencyCode
  readonly symbol: string
  readonly name: string
  readonly flag: string
  readonly fractionDigits: number
  readonly countryCodes: CountryCode[]
}
