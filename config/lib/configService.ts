import deepMerge from 'deepmerge'
import memoizee from 'memoizee'
import * as dotenv from 'dotenv'

import {
  environmentConfig,
  defaultConfig,
  environmentFeatureToggles,
  defaultFeatureToggles
} from './config'
import { Config, FeatureToggles } from './configInterface'
import {
  buildConfigFromDefinition,
  buildFeatureTogglesFromDefinition
} from './internal/configBuilder'

import { Brand, Country, Environment } from './configTypes'

dotenv.config() // This needs to be called before we import config
const environment: Environment = (process.env.APP_ENV as Environment) || 'dev'

export const getConfig = memoizee(getConfigInternal, {
  normalizer: (args: any) => {
    return `${args[0]}-${args[1]}`
  }
})

function getConfigInternal(country: Country, brand: Brand): Config {
  if (!Object.values(Environment).includes(environment)) {
    throw new Error(`Unknown environment: ${environment}`)
  }
  const builtDefaultConfig = buildConfigFromDefinition(defaultConfig, country, brand)

  const environmentDefinition = environmentConfig[environment]
  if (!environmentDefinition) {
    return builtDefaultConfig
  }

  const builtConfig = buildConfigFromDefinition(environmentDefinition, country, brand)
  // Avoid overriding default values with undefined values in environmental configs.
  const prunedConfig = JSON.parse(JSON.stringify(builtConfig))

  return deepMerge(builtDefaultConfig, prunedConfig)
}

export const getFeatures = memoizee(getFeaturesInternal, {
  normalizer: (args: any) => {
    return `${args[0]}-${args[1]}`
  }
})

function getFeaturesInternal(country: Country, brand: Brand): FeatureToggles {
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
