export const tracingConfig = {
  tracingServiceName: process.env.TRACING_SERVICE_NAME || "galoy-price-history-dev",
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
