import {
  ConfigDefinition,
  DeepPartial,
  Country,
  Environment,
  FeatureToggleEnvironmentMap, Brand
} from '../../configInterface'
import {
  buildConfigFromDefinition,
  buildFeatureTogglesFromDefinitions
} from '../configBuilder'

describe('configBuilder', () => {
  describe('buildFeatureTogglesFromDefinitions', () => {
    it('resolves config with global value correctly', () => {
      const config: FeatureToggleEnvironmentMap = {
        production: {
          moduleTwo: {
            ANOTHER_FEATURE: false
          }
        }
      }

      const resolvedConfig = buildFeatureTogglesFromDefinitions(
        config,
        Environment.production,
        Country.US,
        Brand.MainBrand
      )
      expect(resolvedConfig).toMatchSnapshot()
    })

    it('merges config from other environment correctly', () => {
      const config: FeatureToggleEnvironmentMap = {
        development: {
          moduleOne: {
            SOME_FEATURE: true
          },
          moduleTwo: {
            ANOTHER_FEATURE: false
          }
        },
        staging: {},
        production: {
          moduleOne: {
            SOME_FEATURE: false
          },
          moduleTwo: {
            ANOTHER_FEATURE: true
          }
        }
      }

      const resolvedConfig = buildFeatureTogglesFromDefinitions(
        config,
        Environment.staging,
        Country.US,
        Brand.MainBrand
      )
      expect(resolvedConfig).toMatchSnapshot()
    })

    it('merges partial config from other environment correctly', () => {
      const config: FeatureToggleEnvironmentMap = {
        staging: {
          moduleOne: {
            SOME_FEATURE: true
          }
        },
        production: {
          moduleOne: {
            SOME_FEATURE: false
          },
          moduleTwo: {
            ANOTHER_FEATURE: true
          }
        }
      }

      const resolvedConfig = buildFeatureTogglesFromDefinitions(
        config,
        Environment.staging,
        Country.US,
        Brand.MainBrand
      )
      expect(resolvedConfig).toMatchSnapshot()
    })

    it('merges config from multiple environments correctly', () => {
      const config: FeatureToggleEnvironmentMap = {
        staging: {
          moduleOne: {
            SOME_FEATURE: true
          }
        },
        production: {
          moduleTwo: {
            ANOTHER_FEATURE: true
          }
        }
      }

      const resolvedConfig = buildFeatureTogglesFromDefinitions(
        config,
        Environment.development,
        Country.US,
        Brand.MainBrand
      )
      expect(resolvedConfig).toMatchSnapshot()
    })

    it('resolves flag for multiple countries for all brands correctly', () => {
      const config: FeatureToggleEnvironmentMap = {
        staging: {
          moduleOne: {
            SOME_FEATURE: [Country.RUSSIA, Country.US]
          }
        },
        production: {
          moduleTwo: {
            ANOTHER_FEATURE: true
          }
        }
      }

      const resolvedConfigUS = buildFeatureTogglesFromDefinitions(
        config,
        Environment.development,
        Country.US,
        Brand.OtherBrand
      )

      const resolvedConfigRU = buildFeatureTogglesFromDefinitions(
        config,
        Environment.development,
        Country.RUSSIA,
        Brand.MainBrand
      )
      expect(resolvedConfigUS).toMatchSnapshot()
      expect(resolvedConfigRU).toMatchSnapshot()
    })

    it('resolves flag for multiple countries for different brands correctly', () => {
      const config: FeatureToggleEnvironmentMap = {
        staging: {
          moduleOne: {
            SOME_FEATURE: {
              [Brand.MainBrand]: [Country.US],
              [Brand.OtherBrand]: [Country.RUSSIA, Country.US]
            }
          }
        }
      }

      const resolvedConfigMainUS = buildFeatureTogglesFromDefinitions(
        config,
        Environment.development,
        Country.US,
        Brand.MainBrand
      )

      const resolvedConfigMainBrandRU = buildFeatureTogglesFromDefinitions(
        config,
        Environment.development,
        Country.RUSSIA,
        Brand.MainBrand
      )

      const resolvedConfigOtherBrandUS = buildFeatureTogglesFromDefinitions(
        config,
        Environment.development,
        Country.US,
        Brand.OtherBrand
      )

      const resolvedConfigOtherBrandRU = buildFeatureTogglesFromDefinitions(
        config,
        Environment.development,
        Country.RUSSIA,
        Brand.OtherBrand
      )
      expect(resolvedConfigMainUS).toMatchSnapshot()
      expect(resolvedConfigMainBrandRU).toMatchSnapshot()
      expect(resolvedConfigOtherBrandUS).toMatchSnapshot()
      expect(resolvedConfigOtherBrandRU).toMatchSnapshot()
    })
  })

  describe('buildConfigFromDefinition', () => {
    it('resolves config with global value correctly', () => {
      const config: DeepPartial<ConfigDefinition> = {
        someExternalService: {
          baseUrl: 'https://someservice.com/services1/'
        }
      }

      const resolvedConfig = buildConfigFromDefinition(
        config,
        Country.US,
        Brand.MainBrand
      )
      expect(resolvedConfig).toMatchSnapshot()
    })

    it('resolves config with brand-wide global value correctly', () => {
      const config: DeepPartial<ConfigDefinition> = {
        someExternalService: {
          baseUrl: {
            [Brand.OtherBrand]: 'https://someservice.com/services1/',
            [Brand.MainBrand]: 'https://someservice.com/services2/'
          }
        }
      }

      const resolvedConfig = buildConfigFromDefinition(
        config,
        Country.US,
        Brand.MainBrand
      )
      expect(resolvedConfig).toMatchSnapshot()
    })

    it('resolves config with all brands global value correctly', () => {
      const config: DeepPartial<ConfigDefinition> = {
        someExternalService: {
          baseUrl: 'https://someservice.com/services/'
        }
      }

      const resolvedConfig = buildConfigFromDefinition(
        config,
        Country.US,
        Brand.MainBrand
      )
      expect(resolvedConfig).toMatchSnapshot()
    })

    it('resolves config for specific country correctly', () => {
      const config: DeepPartial<ConfigDefinition> = {
        someExternalService: {
          baseUrl: {
            [Brand.OtherBrand]: 'https://someservice.com/services/',
            [Brand.MainBrand]: {
              [Country.US]: 'https://someservice1.com/services/',
              [Country.RUSSIA]: 'https://someservice.2ru/services/'
            }
          }
        }
      }

      const resolvedConfig = buildConfigFromDefinition(
        config,
        Country.RUSSIA,
        Brand.MainBrand
      )
      expect(resolvedConfig).toMatchSnapshot()
    })

    it('resolves config for specific country for all brands correctly', () => {
      const config: DeepPartial<ConfigDefinition> = {
        someExternalService: {
          baseUrl: {
            [Country.US]: 'https://someservice.com/services/',
            [Country.RUSSIA]: 'https://someservice.ru/services/'
          }
        }
      }

      const resolvedConfig = buildConfigFromDefinition(
        config,
        Country.RUSSIA,
        Brand.MainBrand
      )
      expect(resolvedConfig).toMatchSnapshot()
    })
  })
})
