import dotenv from "dotenv"
import { MeterProvider } from "@opentelemetry/sdk-metrics-base"
import { PrometheusExporter } from "@opentelemetry/exporter-prometheus"
import { supportedCurrencies } from "@config"
import { Realtime } from "@app"
import { baseLogger } from "@services/logger"

import { startServer } from "./realtime-price"

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
  interval: 2000,
}).getMeter("prices-prometheus")

for (const currency of supportedCurrencies) {
  meter.createObservableGauge(
    `${currency}_price`,
    { description: `${currency} prices` },
    async (observerResult) => {
      const price = await Realtime.getPrice(currency)
      if (price instanceof Error) return

      observerResult.observe(price, { label: "median" })

      const exchangePrices = await Realtime.getExchangePrices(currency)
      if (exchangePrices instanceof Error) return

      for (const { exchangeName, price } of exchangePrices) {
        observerResult.observe(price, { label: `${exchangeName}` })
      }
    },
  )
}
