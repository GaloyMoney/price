import {
  SemanticAttributes,
  SemanticResourceAttributes,
} from "@opentelemetry/semantic-conventions"
import { W3CTraceContextPropagator } from "@opentelemetry/core"
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node"
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http"
import { GrpcInstrumentation } from "@opentelemetry/instrumentation-grpc"
import { registerInstrumentations } from "@opentelemetry/instrumentation"
import { SimpleSpanProcessor, Span as SdkSpan } from "@opentelemetry/sdk-trace-base"
import { JaegerExporter } from "@opentelemetry/exporter-jaeger"
import { Resource } from "@opentelemetry/resources"
import {
  trace,
  context,
  propagation,
  SpanAttributes,
  SpanOptions,
  TimeInput,
} from "@opentelemetry/api"
import { tracingConfig } from "@config"

propagation.setGlobalPropagator(new W3CTraceContextPropagator())

registerInstrumentations({
  instrumentations: [
    new HttpInstrumentation({
      ignoreIncomingPaths: ["/healthz"],
      headersToSpanAttributes: {
        server: {
          requestHeaders: ["apollographql-client-name", "apollographql-client-version"],
        },
      },
    }),
    new GrpcInstrumentation(),
  ],
})

const provider = new NodeTracerProvider({
  resource: Resource.default().merge(
    new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: tracingConfig.tracingServiceName,
    }),
  ),
})

class SpanProcessorWrapper extends SimpleSpanProcessor {
  onStart(span: SdkSpan) {
    const ctx = context.active()
    if (ctx) {
      const baggage = propagation.getBaggage(ctx)
      if (baggage) {
        baggage.getAllEntries().forEach(([key, entry]) => {
          span.setAttribute(key, entry.value)
        })
      }
    }
    super.onStart(span)
  }
}
provider.addSpanProcessor(
  new SpanProcessorWrapper(
    new JaegerExporter({
      host: tracingConfig.jaegerHost,
      port: tracingConfig.jaegerPort,
    }),
  ),
)

provider.register()

export const tracer = trace.getTracer(
  tracingConfig.tracingServiceName,
  process.env.COMMITHASH || "dev",
)
export const addAttributesToCurrentSpan = (attributes: SpanAttributes) => {
  const span = trace.getSpan(context.active())
  if (span) {
    for (const [key, value] of Object.entries(attributes)) {
      if (value) {
        span.setAttribute(key, value)
      }
    }
  }
}

export const addEventToCurrentSpan = (
  name: string,
  attributesOrStartTime?: SpanAttributes | TimeInput | undefined,
  startTime?: TimeInput | undefined,
) => {
  const span = trace.getSpan(context.active())
  if (span) {
    span.addEvent(name, attributesOrStartTime, startTime)
  }
}

export const asyncRunInSpan = <F extends () => ReturnType<F>>(
  spanName: string,
  attributes: SpanAttributes,
  fn: F,
) => {
  const ret = tracer.startActiveSpan(spanName, { attributes }, async (span) => {
    const ret = await Promise.resolve(fn())
    if ((ret as unknown) instanceof Error) {
      span.recordException(ret)
    }
    span.end()
    return ret
  })
  return ret
}

const resolveFunctionSpanOptions = ({
  namespace,
  functionName,
  functionArgs,
  spanAttributes,
}: {
  namespace: string
  functionName: string
  functionArgs: Array<unknown>
  spanAttributes: SpanAttributes
}): SpanOptions => {
  const attributes = {
    [SemanticAttributes.CODE_FUNCTION]: functionName,
    [SemanticAttributes.CODE_NAMESPACE]: namespace,
    ...spanAttributes,
  }
  if (functionArgs && functionArgs.length > 0) {
    const params =
      typeof functionArgs[0] === "object" ? functionArgs[0] : { "0": functionArgs[0] }
    for (const key in params) {
      attributes[`${SemanticAttributes.CODE_FUNCTION}.params.${key}`] = params[key]
      attributes[`${SemanticAttributes.CODE_FUNCTION}.params.${key}.null`] =
        params[key] === null
    }
  }
  return { attributes }
}

export const wrapToRunInSpan = <
  A extends Array<unknown>,
  R extends PartialResult<unknown> | unknown,
>({
  fn,
  namespace,
}: {
  fn: (...args: A) => R
  namespace: string
}) => {
  return (...args: A): R => {
    const functionName = fn.name
    const spanName = `${namespace}.${functionName}`
    const spanOptions = resolveFunctionSpanOptions({
      namespace,
      functionName,
      functionArgs: args,
      spanAttributes: {},
    })
    const ret = tracer.startActiveSpan(spanName, spanOptions, (span) => {
      try {
        const ret = fn(...args)
        if (ret instanceof Error) span.recordException(ret)
        const partialRet = ret as PartialResult<unknown>
        if (partialRet?.partialResult && partialRet?.error)
          span.recordException(partialRet.error)
        span.end()
        return ret
      } catch (error) {
        span.recordException(error)
        span.end()
        throw error
      }
    })
    return ret
  }
}

type PromiseReturnType<T> = T extends Promise<infer Return> ? Return : T

export const wrapAsyncToRunInSpan = <
  A extends Array<unknown>,
  R extends PartialResult<unknown> | unknown,
>({
  fn,
  namespace,
}: {
  fn: (...args: A) => Promise<PromiseReturnType<R>>
  namespace: string
}) => {
  return (...args: A): Promise<PromiseReturnType<R>> => {
    const functionName = fn.name
    const spanName = `${namespace}.${functionName}`
    const spanOptions = resolveFunctionSpanOptions({
      namespace,
      functionName,
      functionArgs: args,
      spanAttributes: {},
    })
    const ret = tracer.startActiveSpan(spanName, spanOptions, async (span) => {
      try {
        const ret = await fn(...args)
        if (ret instanceof Error) span.recordException(ret)
        const partialRet = ret as PartialResult<unknown>
        if (partialRet?.partialResult && partialRet?.error)
          span.recordException(partialRet.error)
        span.end()
        return ret
      } catch (error) {
        span.recordException(error)
        span.end()
        throw error
      }
    })
    return ret
  }
}

export const addAttributesToCurrentSpanAndPropagate = <F extends () => ReturnType<F>>(
  attributes: { [key: string]: string | undefined },
  fn: F,
) => {
  const ctx = context.active()
  let baggage = propagation.getBaggage(ctx) || propagation.createBaggage()
  const currentSpan = trace.getSpan(ctx)
  Object.entries(attributes).forEach(([key, value]) => {
    if (value) {
      baggage = baggage.setEntry(key, { value })
      if (currentSpan) {
        currentSpan.setAttribute(key, value)
      }
    }
  })
  return context.with(propagation.setBaggage(ctx, baggage), fn)
}

export const shutdownTracing = async () => {
  provider.shutdown()
}

export { SemanticAttributes, SemanticResourceAttributes }
