import {
  ConfigDefinition,
  ConfigDefinitionMap,
  DeepPartial,
  FeatureToggleDefinition,
  FeatureToggleEnvironmentMap
} from './configInterface'
import { Brand, Country, Environment } from './configTypes'

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
      region: 'http://service.com',
      auth: {
        username: getMandatoryEnvParam('EXTERNAL_SYSTEM_USERNAME'),
        password: getMandatoryEnvParam('EXTERNAL_SYSTEM_PASSWORD')
      }
    },
    aws: {
      credentials: {
        accessKeyId: getMandatoryEnvParam('AWS_ACCESS_KEY_ID'),
        secretAccessKey: getMandatoryEnvParam('AWS_SECRET_ACCESS_KEY')
      }
    }
  },
  [Environment.production]: {
    aws: {
      region: {
        [Brand.Alpha]: {
          [Country.US]: 'eu-west-1',
          [Country.RUSSIA]: 'eu-north-1'
        },
        [Brand.Beta]: {
          [Country.US]: 'eu-north-1',
          [Country.RUSSIA]: 'eu-west-1'
        }
      }
    }
  },
  [Environment.staging]: {
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
    [Brand.Alpha]: false,
    [Brand.Beta]: true
  }
}

export const environmentFeatureToggles: FeatureToggleEnvironmentMap = {
  [Environment.staging]: {
    GLOBAL_FEATURE: {
      [Brand.Alpha]: true,
      [Brand.Beta]: true
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
