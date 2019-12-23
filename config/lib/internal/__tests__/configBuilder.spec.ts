import { ConfigDefinition, DeepPartial, FeatureToggleEnvironmentMap } from '../../configInterface'
import { buildConfigFromDefinition, buildFeatureTogglesFromDefinitions } from '../configBuilder'
import { Brand, Country, Environment } from '../../configTypes'

describe('configBuilder', () => {
  describe('buildConfigFromDefinition', () => {
    it('resolves config with nested BrandRecordParam correctly', () => {
      const config: DeepPartial<ConfigDefinition> = {
        aws: {
          credentials: {
            alpha: {
              accessKeyId: 'token',
              secretAccessKey: 'id'
            },
            beta: {
              [Country.US]: {
                accessKeyId: 'tokenUsa',
                secretAccessKey: 'isUsa'
              }
            }
          }
        }
      }

      const resolvedConfigalpha = buildConfigFromDefinition(config, Country.US, Brand.Alpha)
      const resolvedConfigbeta = buildConfigFromDefinition(config, Country.US, Brand.Beta)

      expect(resolvedConfigalpha).toMatchSnapshot()
      expect(resolvedConfigbeta).toMatchSnapshot()
    })

    it('resolves config with brand default correctly', () => {
      const config: DeepPartial<ConfigDefinition> = {
        aws: {
          credentials: {
            brandDefault: {
              accessKeyId: 'token',
              secretAccessKey: 'id'
            },
            beta: {
              [Country.US]: {
                accessKeyId: 'tokenUsa',
                secretAccessKey: 'isUsa'
              }
            }
          }
        }
      }

      const resolvedConfigAlpha = buildConfigFromDefinition(config, Country.US, Brand.Alpha)
      const resolvedConfigBeta = buildConfigFromDefinition(config, Country.US, Brand.Beta)

      expect(resolvedConfigAlpha).toMatchSnapshot()
      expect(resolvedConfigBeta).toMatchSnapshot()
    })

    it('resolves config with country default correctly', () => {
      const config: DeepPartial<ConfigDefinition> = {
        aws: {
          credentials: {
            beta: {
              countryDefault: {
                accessKeyId: 'tokenDefault',
                secretAccessKey: 'isDefault'
              },
              [Country.US]: {
                accessKeyId: 'tokenUsa',
                secretAccessKey: 'isUsa'
              }
            }
          }
        }
      }

      const resolvedConfigUS = buildConfigFromDefinition(config, Country.US, Brand.Beta)

      const resolvedConfigTurkey = buildConfigFromDefinition(config, Country.TURKEY, Brand.Beta)

      expect(resolvedConfigUS).toMatchSnapshot()
      expect(resolvedConfigTurkey).toMatchSnapshot()
    })

    it('resolves config with country is a first filter', () => {
      const config: DeepPartial<ConfigDefinition> = {
        aws: {
          region: {
            countryDefault: 'eu-west-1',
            [Country.US]: 'eu-west-1'
          },
          credentials: {
            countryDefault: {
              accessKeyId: 'tokenDefault',
              secretAccessKey: 'isDefault'
            },
            [Country.US]: {
              accessKeyId: 'tokenUsa',
              secretAccessKey: 'isUsa'
            }
          }
        }
      }

      const resolvedConfigUS = buildConfigFromDefinition(config, Country.US, Brand.Beta)

      const resolvedConfigTurkey = buildConfigFromDefinition(config, Country.TURKEY, Brand.Beta)

      expect(resolvedConfigUS).toMatchSnapshot()
      expect(resolvedConfigTurkey).toMatchSnapshot()
    })

    it('resolves config with missing default correctly', () => {
      const config: DeepPartial<ConfigDefinition> = {
        isDebugMode: {
          brandDefault: true,
          alpha: {
            [Country.RUSSIA]: false,
            [Country.TURKEY]: false
          }
        }
      }

      const resolvedConfigUS = buildConfigFromDefinition(config, Country.US, Brand.Alpha)

      const resolvedConfigTurkey = buildConfigFromDefinition(config, Country.TURKEY, Brand.Alpha)

      expect(resolvedConfigUS).toMatchSnapshot()
      expect(resolvedConfigTurkey).toMatchSnapshot()
    })

    it('resolves arrays correctly', () => {
      const config: DeepPartial<ConfigDefinition> = {
        aws: {
          supportedFeatures: ['a', 'b']
        }
      }

      const resolvedConfigalpha = buildConfigFromDefinition(config, Country.US, Brand.Alpha)

      expect(resolvedConfigalpha).toMatchSnapshot()
    })

    it('resolves numbers correctly', () => {
      const config: DeepPartial<ConfigDefinition> = {
        aws: {
          credentials: {
            alpha: {
              secretAccessKey: '8a82941762aaf2a10162aec726f3090a',
              accessKeyId: 'OGE4Mjk0MTc2MmFhZjJhMTAxNjJhZWM2ZWFkYTA5MDZ8TjdwcHBSeFplTQ=='
            }
          },
          retriesOnError: 10000
        },
        someExternalService: {
          timeout: 20000
        }
      }

      const resolvedConfigalpha = buildConfigFromDefinition(config, Country.US, Brand.Alpha)

      expect(resolvedConfigalpha).toMatchSnapshot()
    })

    it('resolves deep nested params correctly', () => {
      const config: DeepPartial<ConfigDefinition> = {
        someExternalService: {
          auth: {
            alpha: {
              [Country.US]: {
                username: 'dummy city'
              }
            }
          }
        }
      }

      const resolvedConfigalpha = buildConfigFromDefinition(config, Country.US, Brand.Alpha)

      expect(resolvedConfigalpha).toMatchSnapshot()
    })
  })

  describe('buildFeatureTogglesFromDefinitions', () => {
    it('resolves config with global value correctly', () => {
      const config: FeatureToggleEnvironmentMap = {
        prod: {
          GLOBAL_FEATURE: true,
          moduleOne: {
            SOME_FEATURE: false
          }
        }
      }

      const resolvedConfig = buildFeatureTogglesFromDefinitions(
        config,
        Environment.production,
        Country.US,
        Brand.Alpha
      )
      expect(resolvedConfig).toMatchSnapshot()
    })

    it('merges config from other environment correctly', () => {
      const config: FeatureToggleEnvironmentMap = {
        [Environment.development]: {
          moduleOne: {
            SOME_FEATURE: true
          },
          moduleTwo: {
            ANOTHER_FEATURE: false
          }
        },
        [Environment.staging]: {},
        [Environment.production]: {
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
        Brand.Alpha
      )
      expect(resolvedConfig).toMatchSnapshot()
    })

    it('merges partial config from other environment correctly', () => {
      const config: FeatureToggleEnvironmentMap = {
        [Environment.development]: {
          moduleOne: {
            SOME_FEATURE: true
          },
          moduleTwo: {
            ANOTHER_FEATURE: false
          }
        },
        [Environment.staging]: {},
        [Environment.production]: {
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
        Brand.Alpha
      )
      expect(resolvedConfig).toMatchSnapshot()
    })

    it('merges config from multiple environments correctly', () => {
      const config: FeatureToggleEnvironmentMap = {
        [Environment.staging]: {
          moduleOne: {
            SOME_FEATURE: true
          }
        },
        [Environment.production]: {
          moduleTwo: {
            ANOTHER_FEATURE: true
          }
        }
      }

      const resolvedConfig = buildFeatureTogglesFromDefinitions(
        config,
        Environment.development,
        Country.US,
        Brand.Alpha
      )
      expect(resolvedConfig).toMatchSnapshot()
    })

    it('resolves flag for multiple countries for all brands correctly', () => {
      const config: FeatureToggleEnvironmentMap = {
        [Environment.staging]: {
          moduleOne: {
            SOME_FEATURE: [Country.RUSSIA, Country.US]
          }
        },
        [Environment.production]: {
          moduleTwo: {
            ANOTHER_FEATURE: true
          }
        }
      }

      const resolvedConfigUS = buildFeatureTogglesFromDefinitions(
        config,
        Environment.development,
        Country.US,
        Brand.Alpha
      )

      const resolvedConfigTR = buildFeatureTogglesFromDefinitions(
        config,
        Environment.development,
        Country.TURKEY,
        Brand.Alpha
      )
      expect(resolvedConfigUS).toMatchSnapshot()
      expect(resolvedConfigTR).toMatchSnapshot()
    })

    it('resolves flag for multiple countries for different brands correctly', () => {
      const config: FeatureToggleEnvironmentMap = {
        stg: {
          moduleOne: {
            SOME_FEATURE: {
              alpha: [Country.FRANCE, Country.TURKEY],
              beta: [Country.RUSSIA, Country.US]
            }
          }
        }
      }

      const resolvedConfigalphaUS = buildFeatureTogglesFromDefinitions(
        config,
        Environment.development,
        Country.US,
        Brand.Alpha
      )

      const resolvedConfigalphaTR = buildFeatureTogglesFromDefinitions(
        config,
        Environment.development,
        Country.TURKEY,
        Brand.Alpha
      )

      const resolvedConfigbetaUS = buildFeatureTogglesFromDefinitions(
        config,
        Environment.development,
        Country.US,
        Brand.Beta
      )

      const resolvedConfigbetaTR = buildFeatureTogglesFromDefinitions(
        config,
        Environment.development,
        Country.TURKEY,
        Brand.Beta
      )
      expect(resolvedConfigalphaUS).toMatchSnapshot()
      expect(resolvedConfigalphaTR).toMatchSnapshot()
      expect(resolvedConfigbetaUS).toMatchSnapshot()
      expect(resolvedConfigbetaTR).toMatchSnapshot()
    })
  })
})
