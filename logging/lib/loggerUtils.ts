import { Context } from './types'

export function extendMeta(
  ctx: Context | undefined | null,
  meta: {
    [key: string]: any
  }
): object {
  return {
    ...meta,
    ...(ctx
      ? {
          requestId: ctx.requestId
        }
      : {})
  }
}
