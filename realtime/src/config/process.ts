export const tracingConfig = {
  otelServiceName: process.env.OTEL_SERVICE_NAME || "galoy-price-dev",
  enableFilter: process.env.TRACING_ENABLE_FILTER === "true",
}
