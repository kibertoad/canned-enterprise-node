import { default as HttpAgent, HttpOptions, HttpsAgent, HttpsOptions } from 'agentkeepalive'
import { Agent } from 'http'

const IS_DEVELOPMENT = process.env.NODE_ENV === 'development'

export function initKeepAliveAgent(timeout: number): (url: string) => Agent {
  const options: HttpOptions | HttpsOptions = {
    keepAlive: true,
    freeSocketTimeout: timeout,
    rejectUnauthorized: !IS_DEVELOPMENT
  }
  const httpKeepAliveAgent = new HttpAgent(options)
  const httpsKeepAliveAgent = new HttpsAgent(options)

  return (url: string) => {
    if (url.startsWith('https')) {
      return httpsKeepAliveAgent
    } else {
      return httpKeepAliveAgent
    }
  }
}
