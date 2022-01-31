import dotenv from "dotenv"
import { MeterProvider } from "@opentelemetry/sdk-metrics-base"
import { PrometheusExporter } from "@opentelemetry/exporter-prometheus"

import { data, logger, startServer } from "."
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
    logger.info(
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
    observerResult.observe(data.mid, { label: "median" })
    observerResult.observe(data.exchanges["bitfinex"].mid, { label: "bitfinex" })
    observerResult.observe(data.exchanges["binance"].mid, { label: "binance" })
    observerResult.observe(data.exchanges["ftx"].mid, { label: "ftx" })
  },
)
