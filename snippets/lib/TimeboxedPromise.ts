import Timeout = NodeJS.Timeout

export class TimeboxedPromise<T> {
  constructor(promise: Promise<T>, timeoutInMsecs: number, timeoutMessage = 'Promise timed out') {
    let timeout: Timeout
    return new Promise((resolve, reject) => {
      timeout = setTimeout(() => {
        reject(timeoutMessage)
      }, timeoutInMsecs)

      promise
        .then((result: T) => {
          clearTimeout(timeout)
          resolve(result)
        })
        .catch((err) => {
          clearTimeout(timeout)
          reject(err)
        })
    })
  }
}
