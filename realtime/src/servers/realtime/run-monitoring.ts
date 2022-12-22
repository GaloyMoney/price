import dotenv from "dotenv"
import { MeterProvider } from "@opentelemetry/sdk-metrics-base"
import { PrometheusExporter } from "@opentelemetry/exporter-prometheus"
import { supportedCurrencies } from "@config"
import { Realtime } from "@app"
import { baseLogger } from "@services/logger"

import { startServer } from "./run"

dotenv.config()

const prometheusPort =
  process.env.PROMETHEUS_PORT || PrometheusExporter.DEFAULT_OPTIONS.port
const prometheusEndpoint = PrometheusExporter.DEFAULT_OPTIONS.endpoint

const exporter = new PrometheusExporter(
  {
    port: Number(prometheusPort),
    endpoint: prometheusEndpoint,
  },
  () => {
    baseLogger.info(
      { endpoint: `http://localhost:${prometheusPort}${prometheusEndpoint}` },
      `prometheus scrape ready`,
    )
  },
)

startServer()

const meter = new MeterProvider({
  exporter,
  interval: 5000,
}).getMeter("prices-prometheus")

for (const currency of supportedCurrencies) {
  meter.createObservableGauge(
    `${currency.code}_price`,
    { description: `${currency.code} prices` },
    async (observerResult) => {
      const price = await Realtime.getPrice(currency.code)
      if (price instanceof Error) return

      observerResult.observe(price, { label: "median" })

      const exchangePrices = await Realtime.getExchangePrices(currency.code)
      if (exchangePrices instanceof Error) {
        baseLogger.error(
          { error: exchangePrices, currency },
          "Error getting exchange price",
        )
        return
      }

      for (const { exchangeName, price } of exchangePrices) {
        observerResult.observe(price, { label: `${exchangeName}` })
      }
    },
  )
}
