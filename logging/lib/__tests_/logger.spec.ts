import Mockdate from 'mockdate'
import { defaultPrettyPrintOptions, Logger } from '../logger'

describe('logger', () => {
  const consoleSpy = jest.spyOn(process.stdout, 'write')
  let logger: Logger

  async function resetLogger(level: string | undefined) {
    process.env.LOG_LEVEL = level
    jest.resetModules()
    logger = (await import('../logger')).defaultLogger
  }

  beforeAll(async () => {
    const mockedDate = new Date('2011-10-05T14:48:00.000Z')
    Mockdate.set(mockedDate)
    await resetLogger('debug')
  })

  afterEach(async () => {
    consoleSpy.mockReset()
    await resetLogger('debug')
  })

  afterAll(() => {
    Mockdate.reset()
  })

  it('does not log DEBUG info when logger is set to INFO level', async () => {
    await resetLogger('info')

    logger.debug({ requestId: 'dummy' }, 'Dummy text', {})
    expect(consoleSpy).not.toHaveBeenCalled()
  })

  it('logs INFO level entry', () => {
    logger.info({ requestId: 'dummy' }, 'Dummy text', {})
    expect(consoleSpy).toHaveBeenCalled()
    expect(consoleSpy.mock.calls[0][0]).toMatchSnapshot()
  })

  // Skip it until we figure out why colour codes are omitted in CI
  it.skip('logs pretty INFO level entry', () => {
    const prettyLogger = new Logger({
      prettyPrint: defaultPrettyPrintOptions,
      level: 'debug',
      name: 'dummy'
    })
    prettyLogger.info({ requestId: 'dummy' }, 'Dummy text', {})
    expect(consoleSpy).toHaveBeenCalled()
    expect(consoleSpy.mock.calls[0][0]).toMatchSnapshot()
  })

  it('logs DEBUG level entry with context data', () => {
    logger.debug(
      {
        requestId: 'dummyId'
      },
      'Request-header validation passed.',
      {
        originalHost: 'localhost'
      }
    )

    expect(consoleSpy).toHaveBeenCalled()
    expect(consoleSpy.mock.calls[0][0]).toMatchSnapshot()
  })

  it('Logs ERROR level entry with error data', () => {
    const e: any = new Error('Dummy error message')
    e.additionalFields = {
      productId: 'dummyId'
    }
    logger.error(
      {
        requestId: 'dummyId'
      },
      e.message,
      undefined,
      e.additionalFields
    )

    expect(consoleSpy).toHaveBeenCalled()
    expect(consoleSpy.mock.calls[0][0]).toMatchSnapshot()
  })

  it('Logs ERROR level entry with error', () => {
    const e: any = new Error('Dummy error message')
    e.additionalFields = {
      productId: 'dummyId'
    }
    e.stack = 'Dummy stack'
    logger.error(
      {
        requestId: 'dummyId'
      },
      e.message,
      e,
      e.additionalFields
    )

    expect(consoleSpy).toHaveBeenCalled()
    expect(consoleSpy.mock.calls[0][0]).toMatchSnapshot()
  })

  it('Logs WARN level entry with error data', () => {
    const e: any = new Error('Dummy error message')
    e.additionalFields = {
      productId: 'dummyId'
    }
    logger.warn(
      {
        requestId: 'dummyId'
      },
      e.message,
      e.additionalFields
    )

    expect(consoleSpy).toHaveBeenCalled()
    expect(consoleSpy.mock.calls[0][0]).toMatchSnapshot()
  })

  it('Supports setting requestId in childLogger', () => {
    const childLogger = logger.childLogger({ requestId: 'abc' })

    childLogger.info(null, 'dummy')

    expect(consoleSpy).toHaveBeenCalled()
    expect(consoleSpy.mock.calls[0][0]).toMatchSnapshot()
  })

  it('Supports overriding childLogger base values', () => {
    const childLogger = logger.childLogger({ serviceId: 'abc' })

    childLogger.info(null, 'dummy2', { serviceId: 'xyz' })

    expect(consoleSpy).toHaveBeenCalled()
    expect(consoleSpy.mock.calls[0][0]).toMatchSnapshot()
  })
})
