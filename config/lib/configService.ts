import * as R from 'ramda'
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

const environment: Environment =
  (process.env.APP_ENV as Environment) || Environment.development

// ToDo Implement env-specific config
export function getDbConfig() {
  return dbConfig.default
}

export const getConfig = R.memoizeWith((country: string, brand: Brand) => {
  return `${country}-${brand}`
}, getConfigInternal)

function getConfigInternal(country: string, brand: Brand): Config {
  if (!Object.values(Environment).includes(environment)) {
    throw new Error(`Unknown environment: ${environment}`)
  }
  const builtDefaultConfig = buildConfigFromDefinition(
    defaultConfig,
    country,
    brand
  )

  const environmentDefinition = environmentConfig[environment]
  if (!environmentDefinition) {
    return builtDefaultConfig
  }

  const builtConfig = buildConfigFromDefinition(
    environmentDefinition,
    country,
    brand
  )

  return R.mergeDeepRight<Config, Config>(builtDefaultConfig, builtConfig)
}

export const getFeatures = R.memoizeWith((country: string, brand: Brand) => {
  return `${country}-${brand}`
}, getFeaturesInternal)

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

  const builtConfig = buildFeatureTogglesFromDefinition(
    environmentDefinition,
    country,
    brand
  )

  return R.mergeDeepRight<FeatureToggles, FeatureToggles>(
    builtDefaultConfig,
    builtConfig
  )
}
