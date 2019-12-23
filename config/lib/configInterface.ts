import {
  BooleanParam,
  Environment,
  NestedRecordParam,
  NumberParam,
  StringArrayParam,
  StringParam
} from './configTypes'

// Interface for consumption of fully resolved config from chkapi implementation
export interface Config {
  aws: {
    credentials: {
      accessKeyId: string
      secretAccessKey: string
    }
    region: string
    supportedFeatures: string[]
    retriesOnError: number
  }
  someExternalService: {
    region: string
    auth: {
      username: string
      password: string
    }
    callTimeout: number
  }
  isDebugMode: boolean
}

// Interface for defining all possible configs with optional grouping by brands/countries
export interface ConfigDefinition {
  aws: {
    credentials: NestedRecordParam<{
      accessKeyId: StringParam
      secretAccessKey: StringParam
    }>
    region: StringParam
    supportedFeatures: StringArrayParam
    retriesOnError: NumberParam
  }
  someExternalService: {
    region: StringParam
    auth: NestedRecordParam<{
      username: StringParam
      password: StringParam
    }>
    timeout: NumberParam
  }
  isDebugMode: BooleanParam
}

export type ConfigDefinitionMap = DeepPartial<
  { [key in Environment | 'default']: ConfigDefinition }
>

export interface FeatureToggles {
  moduleOne: {
    SOME_FEATURE: boolean
  }
  moduleTwo: {
    ANOTHER_FEATURE: boolean
  }
  GLOBAL_FEATURE: boolean
}

export interface FeatureToggleDefinition {
  moduleOne: {
    SOME_FEATURE: BooleanParam | string[]
  }
  moduleTwo: {
    ANOTHER_FEATURE: BooleanParam | string[]
  }
  GLOBAL_FEATURE: BooleanParam | string[]
}

export type FeatureToggleEnvironmentMap = DeepPartial<
  { [key in Environment]: FeatureToggleDefinition }
>

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : DeepPartial<T[P]>
}
