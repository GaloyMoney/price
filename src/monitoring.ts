import { MeterProvider } from '@opentelemetry/metrics';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { data } from ".";

const prometheusPort = PrometheusExporter.DEFAULT_OPTIONS.port;
const prometheusEndpoint = PrometheusExporter.DEFAULT_OPTIONS.endpoint;

const exporter = new PrometheusExporter(
  {
    // @ts-ignore
    startServer: true,
  },
  () => {
    console.log(
      `prometheus scrape endpoint: http://localhost:${prometheusPort}${prometheusEndpoint}`,
    );
  },
);

const meter = new MeterProvider({
  exporter,
  interval: 2000,
}).getMeter('your-meter-name');

meter.createValueObserver('price', {
  description: 'Example of a sync observer with callback',
}, (observerResult) => {
  observerResult.observe(data.mid, { label: 'median' });
  observerResult.observe(data.exchanges['bitfinex'].mid, { label: 'bitfinex' });
  observerResult.observe(data.exchanges['binance'].mid, { label: 'binance' });
  observerResult.observe(data.exchanges['ftx'].mid, { label: 'ftx' });
});

