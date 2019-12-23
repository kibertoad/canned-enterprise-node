import { Counter, Histogram } from 'prom-client'
import * as Prometheus from 'prom-client'

let areMetricsInitted = false
export let httpRequestCounter: Counter
export let httpRequestDurationSeconds: Histogram

export function initOutgoingMetrics() {
  if (!areMetricsInitted) {
    httpRequestDurationSeconds = new Prometheus.Histogram({
      name: 'outgoing_http_request_duration_seconds',
      help: 'Duration of HTTP outgoing requests in seconds',
      labelNames: ['request', 'locale', 'service']
    })

    httpRequestCounter = new Prometheus.Counter({
      name: 'outgoing_http_request_count',
      help: 'Outgoing request status code',
      labelNames: ['request', 'statusCode', 'locale', 'service']
    })

    areMetricsInitted = true
  }
}
