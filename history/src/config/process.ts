export const tracingConfig = {
  otelServiceName: process.env.OTEL_SERVICE_NAME || "galoy-price-history-dev",
  enableFilter: process.env.TRACING_ENABLE_FILTER === "true",
}

export const databaseConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "", 10) || 5432,
  user: process.env.DB_USER || "galoy-price-usr",
  password: process.env.DB_PWD || "galoy-price-pwd",
  database: process.env.DB_DB || "galoy-price",
  poolMin: parseInt(process.env.DB_POOL_MIN || "", 10) || 1,
  poolMax: parseInt(process.env.DB_POOL_MAX || "", 10) || 5,
  debug: process.env.DB_DEBUG === "true",
}

export const notificationsEndpoint =
  process.env.NOTIFICATIONS_ENDPOINT || "localhost:6685"
