import { TimeboxedPromise } from '../lib/TimeboxedPromise'

describe('TimeboxedPromise', () => {
  it('resolves correctly', async () => {
    const promise = new Promise((resolve) => {
      setTimeout(() => {
        resolve('all good')
      }, 20)
    })

    const timeBoxedPromise = new TimeboxedPromise(promise, 1000)
    const result = await timeBoxedPromise
    expect(result).toEqual('all good')
  })

  it('timeouts correctly', async () => {
    const promise = new Promise((resolve) => {
      setTimeout(() => {
        resolve('all good')
      }, 200)
    })

    const timeBoxedPromise = new TimeboxedPromise(promise, 100)
    await expect(timeBoxedPromise).rejects.toEqual('Promise timed out')
  })

  it('timeouts with custom error message correctly', async () => {
    const promise = new Promise((resolve) => {
      setTimeout(() => {
        resolve('all good')
      }, 200)
    })

    const timeBoxedPromise = new TimeboxedPromise(promise, 100, 'Custom timeout')
    await expect(timeBoxedPromise).rejects.toEqual('Custom timeout')
  })
})
