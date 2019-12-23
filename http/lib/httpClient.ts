import { GotOptions, HTTPError, ResponseType } from 'got'
import * as got from 'got'
import defaultGot from 'got'
import * as http from 'http'
import * as https from 'https'
import { labelValues } from 'prom-client'
import { httpRequestCounter, httpRequestDurationSeconds } from './httpMetrics'

import { initKeepAliveAgent } from './initKeepAliveAgent'
import * as httpNode from 'http'
import CacheableRequest from 'cacheable-request'
import { Readable as ReadableStream } from 'stream'
import { roundProperties } from './httpUtils'

// The timeout value is an educated guess because there is no correct answer.
// Some requests probably can use a higher value.
const DEFAULT_FREE_SOCKET_TIMEOUT = 4500
const getDefaultKeepAliveAgent = initKeepAliveAgent(DEFAULT_FREE_SOCKET_TIMEOUT)

const defaultOptions: Partial<GotOptions> = {
  encoding: 'utf8'
}

export type HttpClientOptions = {
  requestId?: string
  locale?: string
  requestName?: string
  serviceName?: string
  timeout?: number
  returnErrors?: boolean
  gzip?: boolean
  cache?: string | CacheableRequest.StorageAdapter | false
  responseType?: ResponseType
  retry?: number
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  agent?: http.Agent | https.Agent
  baseUrl?: string
  qs?: Record<string, any>
  headers?: http.IncomingHttpHeaders
}

type HttpOptionsInternal = {
  formBody?: Record<string, any>
  body?: string | Buffer | ReadableStream
  json?: Record<string, any> | Record<string, any>[] | undefined
  url: string
} & HttpClientOptions

export declare type ResponseBody = Buffer | string | object

export class HttpClient {
  private readonly got: got.Got
  private defaults: Partial<HttpClientOptions>

  constructor(gotInstance: got.Got = defaultGot, defaults: Partial<HttpClientOptions> = {}) {
    this.got = gotInstance
    this.defaults = defaults
  }

  async get<T extends ResponseBody = Record<string, any>>(
    url: string,
    options: HttpClientOptions = {}
  ): Promise<got.Response<T>> {
    const response: got.Response<T> = await execute(this.got, {
      url,
      responseType: 'json',
      ...options,
      method: 'GET'
    })
    return response
  }

  async post<T extends ResponseBody = Record<string, any>>(
    url: string,
    body: Record<string, any> | Record<string, any>[] | string | undefined,
    options: HttpClientOptions = {}
  ): Promise<got.Response<T>> {
    const response: got.Response<T> = await execute(this.got, {
      url,
      responseType: 'json',
      ...options,
      ...mapRequestBody(body),
      method: 'POST'
    })
    return response
  }

  async postForm<T extends ResponseBody = Record<string, any>>(
    url: string,
    formBody: Record<string, any>,
    options: HttpClientOptions = {}
  ): Promise<got.Response<T>> {
    const response: got.Response<T> = await execute(this.got, {
      url,
      responseType: 'json',
      ...options,
      formBody,
      method: 'POST'
    })
    return response
  }

  async patch<T extends ResponseBody = Record<string, any>>(
    url: string,
    body: Record<string, any>,
    options: HttpClientOptions = {}
  ): Promise<got.Response<T>> {
    const response: got.Response<T> = await execute(this.got, {
      url,
      responseType: 'json',
      ...options,
      ...mapRequestBody(body),
      method: 'PATCH'
    })
    return response
  }

  async put<T extends ResponseBody = Record<string, any>>(
    url: string,
    body: Record<string, any>,
    options: HttpClientOptions = {}
  ): Promise<got.Response<T>> {
    const response: got.Response<T> = await execute(this.got, {
      url,
      responseType: 'json',
      ...options,
      ...mapRequestBody(body),
      method: 'PUT'
    })
    return response
  }

  async delete<T extends ResponseBody = Record<string, any>>(
    url: string,
    options: HttpClientOptions = {}
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

function initHeaders(
  requestOptions: Partial<HttpClientOptions> = {}
): httpNode.IncomingHttpHeaders {
  const requestHeaders = requestOptions.requestId
    ? { 'X-Request-ID': requestOptions.requestId }
    : {}

  return {
    ...requestHeaders,
    ...requestOptions.headers,
    Authorization: requestOptions.headers?.['Authorization'] ?? undefined
  }
}

declare type ResolvedOptions = {
  searchParams?: Record<string, any>
} & GotOptions

function mapOptions(options: Partial<HttpOptionsInternal>): ResolvedOptions {
  const resolvedOptions: ResolvedOptions = {
    timeout: options.timeout ?? undefined,
    decompress: options.gzip ?? true,
    retry: options.retry ?? 0,
    prefixUrl: options.baseUrl,
    responseType: options.responseType,
    method: options.method,
    cache: options.cache
  }

  if (options.qs) {
    resolvedOptions.searchParams = removeUndefinedValues(options.qs)
    if (Object.keys(resolvedOptions.searchParams).length === 0) {
      resolvedOptions.searchParams = undefined
    }
  }

  if (options.json) {
    resolvedOptions.json = options.json
  }
  if (options.body) {
    resolvedOptions.body = options.body
  }
  if (options.formBody) {
    resolvedOptions.form = options.formBody
  }
  return resolvedOptions
}

function initOptions(options: HttpOptionsInternal): GotOptions {
  const agent = 'agent' in options ? options.agent : getDefaultKeepAliveAgent(options.url)

  const resolvedOptions: GotOptions = mapOptions(options)
  const headers = initHeaders(options)

  console.debug('HTTP request', {
    locale: options.locale,
    requestId: options.requestId,
    method: options.method,
    headers,
    url: options.url
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

    console.info('HTTP response', {
      locale: options.locale,
      requestId: options.requestId,
      method: resolvedOptions.method,
      url: response.url,
      status: response.statusCode,
      duration: duration ?? undefined,
      timingPhases: roundProperties(response.timings)
    })

    return response as any
  } catch (err) {
    if (err instanceof HTTPError) {
      const { code, message, response } = err
      // @ts-ignore
      err['statusCode'] = err.response.statusCode
      // @ts-ignore
      err['error'] = err.response.statusMessage
      // @ts-ignore
      err['body'] = err.response.body
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
        locale: options.locale,
        requestId: options.requestId,
        method: options.method,
        statusCode: code,
        url: href,
        errMsg: message || ''
      })

      if (!options.returnErrors) {
        throw err
      }
      return err.response as any
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
      locale: options.locale,
      requestId: options.requestId,
      method: options.method,
      url: options.url,
      code: err.code
    })
    throw err
  }
}

export function withDefaults(optionDefaults: Partial<HttpClientOptions>): HttpClient {
  return new HttpClient(
    defaultGot.extend({
      ...mapOptions(optionDefaults),
      headers: initHeaders(optionDefaults),
      searchParams: optionDefaults.qs
    }),
    optionDefaults
  )
}

function isString(x: any): x is string {
  return typeof x === 'string'
}

function isObject(x: any): x is object {
  return typeof x === 'object'
}

function mapRequestBody(
  body: Record<string, any> | Record<string, any>[] | string | undefined
): { json: any } | { body: any } | {} {
  if (isObject(body)) {
    return {
      json: removeUndefinedValues(body)
    }
  }
  if (isString(body)) {
    return {
      body
    }
  }
  return {}
}

function removeUndefinedValues(sourceObject: Record<string, any>): Record<string, any> {
  return Object.entries(sourceObject).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key] = value
    }
    return acc
  }, {} as Record<string, any>)
}

export const httpClient = new HttpClient()
