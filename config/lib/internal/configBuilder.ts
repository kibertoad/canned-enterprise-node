import * as R from 'ramda'

import {
  Brand,
  Config,
  ConfigDefinition,
  Country,
  DeepPartial,
  Environment,
  FeatureToggleDefinition,
  FeatureToggleEnvironmentMap,
  FeatureToggles
} from '../configInterface'
const DO_NOT_ADD = Symbol()

export function buildFeatureTogglesFromDefinitions(
  toggleConfigs: FeatureToggleEnvironmentMap,
  environment: Environment,
  country: string,
  brand: Brand
): FeatureToggles {
  const envIndex = Object.values(Environment).indexOf(environment)
  if (envIndex === -1) {
    throw new Error(`Unknown environment: ${environment}`)
  }
  const envsToMerge = Object.values(Environment).slice(0, envIndex)
  const configsToMerge: DeepPartial<FeatureToggleDefinition>[] = Object.entries(
    toggleConfigs
  )
    .filter(([key, value]) => {
      return envsToMerge.includes(key) && value
    })
    .map(([_key, value]) => {
      return value
    }) as DeepPartial<FeatureToggleDefinition>[]

  const mainConfig = toggleConfigs[environment]
  if (mainConfig) {
    configsToMerge.push(mainConfig)
  }

  const transformedConfigs: FeatureToggles[] = configsToMerge.map(
    configDefinition => {
      return buildFeatureTogglesFromDefinition(configDefinition, country, brand)
    }
  )

  return transformedConfigs.reduce((acc, value) => {
    return R.mergeDeepRight<object, FeatureToggles>(acc, value)
  }, {}) as FeatureToggles
}

export function buildFeatureTogglesFromDefinition(
  definition: DeepPartial<FeatureToggleDefinition>,
  country: string,
  brand: Brand
): FeatureToggles {
  return Object.entries(definition).reduce((acc, [key, value]) => {
    const transformedValue = getTransformedDefinitionValue(
      key,
      value,
      country,
      brand,
      true
    )
    acc[key] = transformedValue
    return acc
  }, {} as Record<string, any>) as FeatureToggles
}

export function buildConfigFromDefinition(
  definition: DeepPartial<ConfigDefinition>,
  country: string,
  brand: Brand
): Config {
  return Object.entries(definition).reduce((acc, [key, value]) => {
    const transformedValue = getTransformedDefinitionValue(
      key,
      value,
      country,
      brand,
      false
    )
    acc[key] = transformedValue
    return acc
  }, {} as Record<string, any>) as Config
}

function isBrand(key: string): boolean {
  return Object.values(Brand).includes(key)
}

function isCountry(key: string): boolean {
  return Object.values(Country).includes(key)
}

function resolveCountryConfig(
  sourceValue: any,
  country: string,
  resultIsBoolean: boolean
) {
  if (typeof sourceValue !== 'object') {
    return sourceValue
  }

  if (resultIsBoolean) {
    if (Array.isArray(sourceValue)) {
      return sourceValue.includes(country)
    }
  }

  const countryConfig = sourceValue[country]
  return countryConfig || DO_NOT_ADD
}

/**
 * Handle logic for bulk configuration.
 * If brand is omitted, config option applies to all brands.
 * If country is omitted, config option applies to all countries.
 * If boolean param has an "array of strings" type, it is a list of countries where it is true.
 */
function getTransformedDefinitionValue(
  // ToDo take a look
  // @ts-ignore
  sourceKey: string,
  sourceValue: any,
  country: string,
  brand: Brand,
  resultIsBoolean: boolean
) {
  if (typeof sourceValue !== 'object') {
    return sourceValue
  }

  return Object.entries(sourceValue).reduce((acc, [key, value]) => {
    // Value is already resolved, nothing to do anymore
    // ToDo take a look
    // @ts-ignore
    if (acc !== DO_NOT_ADD && typeof acc !== 'object') {
      return acc
    }

    if (isBrand(key)) {
      if (key !== brand) {
        return DO_NOT_ADD
      }
      return resolveCountryConfig(value, country, resultIsBoolean)
    }

    if (isCountry(key)) {
      if (key !== country) {
        return DO_NOT_ADD
      }
      return value
    }

    if (resultIsBoolean) {
      if (Array.isArray(sourceValue)) {
        return sourceValue.includes(country)
      }
    }

    const transformedValue = getTransformedDefinitionValue(
      key,
      value,
      country,
      brand,
      resultIsBoolean
    )
    if (transformedValue !== DO_NOT_ADD) {
      acc[key] = transformedValue
    }
    return acc
  }, {} as Record<string, any>)
}
