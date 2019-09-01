import deepMerge from 'deepmerge'
import memoizee from 'memoizee'
import * as dotenv from 'dotenv'

dotenv.config() // This needs to be called before we import config

import {
  environmentConfig,
  defaultConfig,
  environmentFeatureToggles,
  defaultFeatureToggles,
  dbConfig
} from './config'
import { Brand, Config, Environment, FeatureToggles } from './configInterface'
import {
  buildConfigFromDefinition,
  buildFeatureTogglesFromDefinition
} from './internal/configBuilder'

const environment: Environment = (process.env.APP_ENV as Environment) || Environment.development

// ToDo Implement env-specific config
export function getDbConfig() {
  return dbConfig.default
}

export const getConfig = memoizee(getConfigInternal, {
  normalizer: (args: any) => {
    return `${args[0]}-${args[1]}`
  }
})

function getConfigInternal(country: string, brand: Brand): Config {
  if (!Object.values(Environment).includes(environment)) {
    throw new Error(`Unknown environment: ${environment}`)
  }
  const builtDefaultConfig = buildConfigFromDefinition(defaultConfig, country, brand)

  const environmentDefinition = environmentConfig[environment]
  if (!environmentDefinition) {
    return builtDefaultConfig
  }

  const builtConfig = buildConfigFromDefinition(environmentDefinition, country, brand)

  return deepMerge(builtDefaultConfig, builtConfig)
}

export const getFeatures = memoizee(getFeaturesInternal, {
  normalizer: (args: any) => {
    return `${args[0]}-${args[1]}`
  }
})

function getFeaturesInternal(country: string, brand: Brand): FeatureToggles {
  if (!Object.values(Environment).includes(environment)) {
    throw new Error(`Unknown environment: ${environment}`)
  }

  const builtDefaultConfig = buildFeatureTogglesFromDefinition(
    defaultFeatureToggles,
    country,
    brand
  )

  const environmentDefinition = environmentFeatureToggles[environment]
  if (!environmentDefinition) {
    return builtDefaultConfig
  }

  const builtConfig = buildFeatureTogglesFromDefinition(environmentDefinition, country, brand)

  return deepMerge(builtDefaultConfig, builtConfig)
}
