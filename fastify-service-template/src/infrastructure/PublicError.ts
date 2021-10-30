export class PublicError extends Error {
  public readonly httpCode: number
  public readonly errorCode: string | undefined
  public readonly metadata?: Record<string, any>

  constructor(message: string, httpCode = 500, errorCode?: string, metadata?: Record<string, any>) {
    super(message)
    this.name = 'PublicError'
    if (metadata) {
      this.metadata = metadata
    }
    this.httpCode = httpCode
    this.errorCode = errorCode
  }
}
