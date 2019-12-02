import { GotOptions, HTTPError, ResponseType } from 'got'
import * as got from 'got'
import defaultGot from 'got'
import { OptionsOfDefaultResponseBody } from 'got/dist/source/create'
import * as http from 'http'
import * as https from 'https'
import { labelValues } from 'prom-client'
import { httpRequestCounter, httpRequestDurationSeconds } from './httpMetrics'
import { roundProperties, stripCredentialsFromUrl } from './httpUtils'

import { initKeepAliveAgent } from './initKeepAliveAgent'
// The timeout value is an educated guess because there is no correct answer.
// Some requests probably can use a higher value.
const DEFAULT_FREE_SOCKET_TIMEOUT = 4500
const getDefaultKeepAliveAgent = initKeepAliveAgent(DEFAULT_FREE_SOCKET_TIMEOUT)

const defaultHeaders = {
  'user-agent': 'MicroserviceX/1.0'
}

const defaultOptions: Partial<OptionsOfDefaultResponseBody> = {
  encoding: 'utf8'
}

export type HttpOptions = {
  requestId?: string
  locale?: string
  requestName?: string
  serviceName?: string

  responseType?: ResponseType
  retry?: number
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  agent?: http.Agent | https.Agent
  baseUrl?: string
  qs?: Record<string, any>
  headers?: http.IncomingHttpHeaders
}

type HttpOptionsInternal = {
  json?: Record<string, any> | Record<string, any>[]
  url: string
} & HttpOptions

export declare type ResponseBody = Buffer | string | object

export class HttpClient {
  private readonly got: got.Got

  constructor(gotInstance: got.Got = defaultGot) {
    this.got = gotInstance
  }

  async get<T extends ResponseBody>(
    url: string,
    options: HttpOptions = {}
  ): Promise<got.Response<T>> {
    const response: got.Response<T> = await execute(this.got, {
      url,
      responseType: 'json',
      ...options,
      method: 'GET'
    })
    return response
  }

  async post<T extends ResponseBody>(
    url: string,
    body: Record<string, any> | Record<string, any>[],
    options: HttpOptions = {}
  ): Promise<got.Response<T>> {
    const response: got.Response<T> = await execute(this.got, {
      url,
      responseType: 'json',
      ...options,
      json: body,
      method: 'POST'
    })
    return response
  }

  async patch<T extends ResponseBody>(
    url: string,
    body: Record<string, any>,
    options: HttpOptions = {}
  ): Promise<got.Response<T>> {
    const response: got.Response<T> = await execute(this.got, {
      url,
      responseType: 'json',
      ...options,
      json: body,
      method: 'PATCH'
    })
    return response
  }

  async put<T extends ResponseBody>(
    url: string,
    body: Record<string, any>,
    options: HttpOptions = {}
  ): Promise<got.Response<T>> {
    const response: got.Response<T> = await execute(this.got, {
      url,
      responseType: 'json',
      ...options,
      json: body,
      method: 'PUT'
    })
    return response
  }

  async delete<T extends ResponseBody>(
    url: string,
    options: HttpOptions = {}
  ): Promise<got.Response<T>> {
    const response: got.Response<T> = await execute(this.got, {
      url,
      responseType: 'json',
      ...options,
      method: 'DELETE'
    })
    return response
  }
}

function initHeaders(requestOptions: Partial<HttpOptions> = {}): http.IncomingHttpHeaders {
  const requestHeaders = requestOptions.requestId
    ? { 'X-Request-ID': requestOptions.requestId }
    : {}

  return {
    ...defaultHeaders,
    ...requestHeaders
  }
}

declare type ResolvedOptions = {
  searchParams?: Record<string, any>
} & GotOptions

function mapOptions(options: Partial<HttpOptionsInternal>): ResolvedOptions {
  const resolvedOptions: ResolvedOptions = {
    retry: options.retry ?? 0,
    prefixUrl: options.baseUrl,
    responseType: options.responseType,
    method: options.method
  }

  if (options.qs) {
    resolvedOptions.searchParams = options.qs
  }

  if (options.json) {
    resolvedOptions.json = options.json
  }
  return resolvedOptions
}

function initOptions(options: HttpOptionsInternal): GotOptions {
  const agent = 'agent' in options ? options.agent : getDefaultKeepAliveAgent(options.url)

  const resolvedOptions: GotOptions = mapOptions(options)
  const headers = initHeaders(options)

  console.debug('HTTP request', {
    requestId: options.requestId,
    method: options.method,
    headers,
    url: stripCredentialsFromUrl(options.url)
  })

  return {
    ...defaultOptions,
    ...resolvedOptions,
    agent,
    headers
  }
}

async function execute<T extends ResponseBody>(
  gotInstance: got.Got,
  options: HttpOptionsInternal
): Promise<got.Response<T>> {
  const metricLabels: labelValues = {
    locale: options.locale!,
    ...(options.requestName && { request: options.requestName }),
    ...(options.serviceName && { service: options.serviceName })
  }
  const trackMetrics = !!(options.requestName || options.serviceName)
  const resolvedOptions = initOptions(options)

  let endTimer: (labels?: labelValues) => void
  let start: Date
  if (trackMetrics) {
    start = new Date()
    endTimer = httpRequestDurationSeconds.startTimer()
  }

  try {
    const response = await gotInstance(options.url, resolvedOptions as any)
    if (trackMetrics) {
      endTimer!({ ...metricLabels })
    }
    let duration
    if (trackMetrics) {
      duration = new Date().getTime() - start!.getTime()
      httpRequestCounter.inc(
        {
          statusCode: response.statusCode,
          ...metricLabels
        },
        1,
        new Date()
      )
    }

    console.debug('HTTP response', {
      method: resolvedOptions.method,
      url: stripCredentialsFromUrl(response.url),
      status: response.statusCode,
      requestId: options.requestId,
      duration: duration ?? undefined,
      timingPhases: roundProperties(response.timings)
    })

    return response as any
  } catch (err) {
    if (err instanceof HTTPError) {
      const { code, message, response } = err
      // The server responded with a status codes other than 2xx.
      // Check reason.statusCode
      if (trackMetrics) {
        httpRequestCounter.inc(
          {
            statusCode: response.statusCode,
            ...metricLabels
          },
          1,
          new Date()
        )
      }

      const href = response.request && response.url
      console.warn('HTTP StatusCodeError', err, {
        method: options.method,
        statusCode: code,
        requestId: options.requestId,
        url: stripCredentialsFromUrl(href),
        errMsg: message || ''
      })

      throw err
    }

    // The request failed due to technical reasons.
    // reason.cause is the Error object Request would pass into a callback.
    if (trackMetrics) {
      httpRequestCounter.inc(
        {
          statusCode: -1,
          ...metricLabels
        },
        1,
        new Date()
      )
    }

    console.warn('HTTP RequestError', err, {
      method: options.method,
      requestId: options.requestId,
      url: stripCredentialsFromUrl(options.url),
      errMsg: err.message,
      code: err.code,
      errStack: err.stack
    })
    throw err
  }
}

export function withDefaults(optionDefaults: Partial<HttpOptions>): HttpClient {
  return new HttpClient(defaultGot.extend(mapOptions(optionDefaults)))
}

export const httpClient = new HttpClient()
