import { Brand, Country, Environment } from '../configInterface'

describe('config', () => {
  let initialEnv = process.env.APP_ENV

  beforeAll(() => {
    initialEnv = process.env.APP_ENV
  })

  afterAll(() => {
    process.env.APP_ENV = initialEnv
  })

  it('values are correct', async () => {
    process.env.EXTERNAL_SYSTEM_USERNAME = 'dummy'
    process.env.EXTERNAL_SYSTEM_PASSWORD = 'dummy'
    process.env.AWS_ACCESS_KEY_ID = 'dummy'
    process.env.AWS_SECRET_ACCESS_KEY = 'dummy'

    for await (const environment of Object.values(Environment)) {
      process.env.APP_ENV = environment
      jest.resetModules()
      const configService = await import('../configService')

      Object.values(Brand).forEach((brand) => {
        Object.values(Country).forEach((country) => {
          expect(configService.getConfig(country, brand)).toMatchSnapshot(
            `Config for ${environment}: ${brand} ${country}`
          )
        })
      })
    }
  })

  it('feature toggle values are correct', async () => {
    for await (const environment of Object.values(Environment)) {
      process.env.APP_ENV = environment
      jest.resetModules()
      const configService = await import('../configService')

      Object.values(Brand).forEach((brand) => {
        Object.values(Country).forEach((country) => {
          expect(configService.getFeatures(country, brand)).toMatchSnapshot(
            `Features for ${environment}: ${brand} ${country}`
          )
        })
      })
    }
  })
})
