import * as DomainErrors from "@domain/errors"
import * as PrimitivesErrors from "@domain/primitives/errors"
import * as PriceErrors from "@domain/price/errors"

export const ApplicationErrors = {
  ...DomainErrors,
  ...PrimitivesErrors,
  ...PriceErrors,
} as const
