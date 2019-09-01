import {
  Brand,
  ConfigDefinition,
  ConfigDefinitionMap,
  Country,
  DeepPartial,
  Environment,
  FeatureToggleDefinition,
  FeatureToggleEnvironmentMap
} from './configInterface'

export const dbConfig = Object.freeze({
  default: {
    client: 'pg',
    connection: {
      host: '127.0.0.1',
      user: 'your_database_user',
      password: 'your_database_password',
      database: 'myapp_test'
    }
  }
})

function getMandatoryEnvParam(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Please define environment variable ${key}`)
  }

  return value
}

// Default configuration for all environments. Single keys and values can be overridden in the environment specific configuration
export const defaultConfig: DeepPartial<ConfigDefinition> = {}

// Override the default config values here for environments if needed
export const environmentConfig: ConfigDefinitionMap = {
  default: {
    someExternalService: {
      baseUrl: 'http://service.com',
      auth: {
        username: getMandatoryEnvParam('EXTERNAL_SYSTEM_USERNAME'),
        password: getMandatoryEnvParam('EXTERNAL_SYSTEM_PASSWORD')
      }
    },
    aws: {
      accessKeyId: getMandatoryEnvParam('AWS_ACCESS_KEY_ID'),
      secretAccessKey: getMandatoryEnvParam('AWS_SECRET_ACCESS_KEY')
    }
  },
  production: {
    aws: {
      region: {
        [Brand.MainBrand]: {
          [Country.US]: 'eu-west-1',
          [Country.RUSSIA]: 'eu-north-1'
        },
        [Brand.OtherBrand]: {
          [Country.US]: 'eu-north-1',
          [Country.RUSSIA]: 'eu-west-1'
        }
      }
    }
  },
  staging: {
    aws: {
      region: {
        [Country.US]: 'eu-west-1',
        [Country.RUSSIA]: 'eu-north-1'
      }
    }
  }
}

export const defaultFeatureToggles: DeepPartial<FeatureToggleDefinition> = {
  GLOBAL_FEATURE: {
    [Brand.MainBrand]: false,
    [Brand.OtherBrand]: true
  }
}

export const environmentFeatureToggles: FeatureToggleEnvironmentMap = {
  staging: {
    GLOBAL_FEATURE: {
      [Brand.MainBrand]: true,
      [Brand.OtherBrand]: true
    },
    moduleOne: {
      SOME_FEATURE: [Country.US, Country.RUSSIA]
    },
    moduleTwo: {
      ANOTHER_FEATURE: true
    }
  }
}

export const isProductionEnvironment = process.env.APP_ENV === Environment.production
