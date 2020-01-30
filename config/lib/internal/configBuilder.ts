import deepMerge from 'deepmerge'
import {
  Config,
  ConfigDefinition,
  DeepPartial,
  FeatureToggleDefinition,
  FeatureToggleEnvironmentMap,
  FeatureToggles
} from '../configInterface'
import {
  Country,
  BRAND_DEFAULT_FILTER,
  Environment,
  COUNTRY_DEFAULT_FILTER,
  Brand,
  CONFIG_FINAL_VALUE,
  ConfigValueProducer
} from '../configTypes'

export function buildFeatureTogglesFromDefinitions(
  toggleConfigs: FeatureToggleEnvironmentMap,
  environment: Environment,
  country: Country,
  brand: Brand
): FeatureToggles {
  const envIndex = Object.values(Environment).indexOf(environment as Environment)
  if (envIndex === -1) {
    throw new Error(`Unknown environment: ${environment}`)
  }
  const envsToMerge = Object.values(Environment).slice(0, envIndex)
  const configsToMerge: DeepPartial<FeatureToggleDefinition>[] = Object.entries(toggleConfigs)
    .filter(([key, value]) => {
      return envsToMerge.includes(key as Environment) && value
    })
    .map(([_key, value]) => {
      return value
    }) as DeepPartial<FeatureToggleDefinition>[]

  const mainConfig = toggleConfigs[environment]
  if (mainConfig) {
    configsToMerge.push(mainConfig)
  }

  const transformedConfigs: FeatureToggles[] = configsToMerge.map((configDefinition) => {
    return buildFeatureTogglesFromDefinition(configDefinition, country, brand)
  })

  return transformedConfigs.reduce((acc, value) => {
    return deepMerge(acc, value)
  }, {}) as FeatureToggles
}

export function buildFeatureTogglesFromDefinition(
  definition: DeepPartial<FeatureToggleDefinition>,
  country: Country,
  brand: Brand
): FeatureToggles {
  return processConfigNode(definition, {}, '', country, brand, true)
}

export function buildConfigFromDefinition(
  definition: DeepPartial<ConfigDefinition>,
  country: Country,
  brand: Brand
): Config {
  return processConfigNode(definition, {}, '', country, brand, false)
}

function isBrand(key: string): boolean {
  return Object.values(Brand).includes(key as Brand)
}

function isCountry(key: string): boolean {
  return Object.values(Country).includes(key as Country)
}

function getBranchRelevance(
  key: string,
  country: Country,
  brand: Brand,
  parentNode: Record<string, any>
): Relevance {
  if (isBrand(key)) {
    return key === brand ? Relevance.IS_FILTER : Relevance.IRRELEVANT
  }

  if (isCountry(key)) {
    return key === country ? Relevance.IS_FILTER : Relevance.IRRELEVANT
  }

  if (key === BRAND_DEFAULT_FILTER) {
    return parentNode[brand] === undefined ? Relevance.IS_FILTER : Relevance.IRRELEVANT
  }

  if (key === COUNTRY_DEFAULT_FILTER) {
    return parentNode[country] === undefined ? Relevance.IS_FILTER : Relevance.IRRELEVANT
  }

  if (key === CONFIG_FINAL_VALUE) {
    return Relevance.IS_FINAL_VALUE
  }

  return Relevance.IS_VALUE
}

export enum Relevance {
  IRRELEVANT,
  IS_FILTER,
  IS_VALUE,
  IS_FINAL_VALUE
}

function setConfigField(
  targetConfig: Record<string, any>,
  parentKey: string,
  key: string,
  value: any,
  relevance: Relevance
) {
  if (relevance === Relevance.IS_VALUE) {
    if (parentKey) {
      if (targetConfig[parentKey] === undefined) {
        targetConfig[parentKey] = {}
      }
      targetConfig[parentKey][key] = value
    } else {
      targetConfig[key] = value
    }
  }

  // If current node is filter, we ignore its key, as it should not be present in resolved config
  if (relevance === Relevance.IS_FILTER) {
    targetConfig[parentKey] = value
  }
}

function initChildren(targetConfig: Record<string, any>, key: string, parentKey: string) {
  if (parentKey) {
    if (targetConfig[parentKey] === undefined) {
      targetConfig[parentKey] = {}
    }

    if (targetConfig[parentKey][key] === undefined) {
      targetConfig[parentKey][key] = {}
    }
    return
  }

  if (targetConfig[key] === undefined) {
    targetConfig[key] = {}
  }
}

/**
 * Handle logic for bulk configuration.
 * Iterate over all nodes in configuration tree and build complete config for specific country and brand
 * If brand is omitted, config option applies to all brands.
 * If country is omitted, config option applies to all countries.
 * If boolean param has an "array of strings" type, it is a list of countries where it is true.
 */
function processConfigNode<T extends Config | FeatureToggles>(
  sourceValue: any,
  targetConfig: Partial<T>,
  parentKey: string,
  country: Country,
  brand: Brand,
  resultIsBoolean: boolean
): T {
  let isEmptyLeafNode = true

  Object.entries(sourceValue).forEach(([key, value]) => {
    const relevance = getBranchRelevance(key, country, brand, sourceValue)
    if (relevance === Relevance.IRRELEVANT) {
      return
    }
    isEmptyLeafNode = false

    // Handle value providers
    if (typeof value === 'function') {
      const resolvedValue = (value as ConfigValueProducer<any>)(brand, country)
      setConfigField(targetConfig, parentKey, key, resolvedValue, relevance)
      return
    }

    // Process primitive and explicitly final values
    if (typeof value !== 'object' || relevance === Relevance.IS_FINAL_VALUE) {
      setConfigField(targetConfig, parentKey, key, value, relevance)
      return
    }

    if (Array.isArray(value)) {
      // If boolean param has an "array of strings" type, it is a list of countries where it is true.
      if (resultIsBoolean) {
        const resolvedValue = value.includes(country)
        setConfigField(targetConfig, parentKey, key, resolvedValue, relevance)
        return
      }

      // Otherwise it should be preserved as is
      setConfigField(targetConfig, parentKey, key, value, relevance)
      return
    }

    // Process object
    let nextTargetConfig = targetConfig

    let nextParentKey = parentKey
    if (relevance === Relevance.IS_VALUE) {
      initChildren(targetConfig, key, parentKey)

      if (parentKey) {
        nextTargetConfig = targetConfig[parentKey]
      }

      // We need to store last non-filter key to correctly handle cases with filters, so that we known correctly where to attach next resolved non-filter value
      nextParentKey = key
    }

    processConfigNode(value, nextTargetConfig, nextParentKey, country, brand, resultIsBoolean)
  })

  // If node has no children and there is no value resolved for him, it should be undefined, not an empty object (that would be set via initChildren previously)
  if (isEmptyLeafNode && parentKey) {
    setConfigField(targetConfig, parentKey, '', undefined, Relevance.IS_FILTER)
  }

  return targetConfig as T
}
