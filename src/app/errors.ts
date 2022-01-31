import * as DomainErrors from "@domain/errors"
import * as ExchangesErrors from "@domain/exchanges/errors"
import * as ProvidersErrors from "@domain/providers/errors"

export const ApplicationErrors = {
  ...DomainErrors,
  ...ExchangesErrors,
  ...ProvidersErrors,
} as const
