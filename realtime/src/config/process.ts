export const tracingConfig = {
  otelServiceName: process.env.OTEL_SERVICE_NAME || "galoy-price-dev",
  enableFilter: process.env.TRACING_ENABLE_FILTER === "true",
}

export const IBEX = {
  url: process.env.IBEX_URL as string,
  email: process.env.IBEX_EMAIL as string,
  password: process.env.IBEX_PASSWORD as string
}