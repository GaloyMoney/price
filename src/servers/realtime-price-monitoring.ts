import dotenv from "dotenv"
import { MeterProvider } from "@opentelemetry/sdk-metrics-base"
import { PrometheusExporter } from "@opentelemetry/exporter-prometheus"
import { getExchangesConfig, supportedCurrencies } from "@config"
import { data } from "@app"
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

meter.createObservableGauge(
  "price",
  {
    description: "Example of a sync observer with callback",
  },
  (observerResult) => {
    const exchanges = getExchangesConfig()

    for (const currency of supportedCurrencies) {
      observerResult.observe(data.mid(currency), { label: `${currency}_median` })
      for (const exchange of exchanges.filter((e) => e.quoteCurrency === currency)) {
        observerResult.observe(data.exchanges[currency][exchange.name].mid, {
          label: `${currency}_${exchange.name}`,
        })
      }
    }
  },
)
