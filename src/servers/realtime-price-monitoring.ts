import dotenv from "dotenv"
import { MeterProvider } from "@opentelemetry/sdk-metrics-base"
import { PrometheusExporter } from "@opentelemetry/exporter-prometheus"
import { getExchangesConfig, supportedCurrencies } from "@config"
import { realTimeData } from "@app"
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

const exchanges = getExchangesConfig()

for (const currency of supportedCurrencies) {
  meter.createObservableGauge(
    `${currency}_price`,
    { description: `${currency} prices` },
    (observerResult) => {
      observerResult.observe(realTimeData.mid(currency), { label: "median" })

      for (const exchange of exchanges.filter((e) => e.quoteAlias === currency)) {
        observerResult.observe(realTimeData.exchanges[currency][exchange.name].mid, {
          label: `${exchange.name}`,
        })
      }
    },
  )
}
