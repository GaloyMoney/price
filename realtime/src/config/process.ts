export const tracingConfig = {
  otelExporterOtlpEndpoint:
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://localhost:4318",
  tracingServiceName: process.env.TRACING_SERVICE_NAME || "galoy-price-dev",
}
