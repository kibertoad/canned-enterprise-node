const IS_DEVELOPMENT = process.env.NODE_ENV === 'development'

export function roundProperties(obj: any): any {
  if (typeof obj !== 'object') {
    return obj
  }
  return Object.keys(obj).reduce((acc, curr) => {
    const currentObject = obj[curr]
    acc[curr] = typeof currentObject === 'number' ? Math.round(obj[curr]) : currentObject
    return acc
  }, {} as Record<string, any>)
}

export function stripCredentialsFromUrl(url: string): string {
  if (typeof url !== 'string' || IS_DEVELOPMENT) {
    return url
  } else {
    return url.replace(/^((?:\w+:)?\/\/)(?:[^@/]+@)/, '$1')
  }
}
