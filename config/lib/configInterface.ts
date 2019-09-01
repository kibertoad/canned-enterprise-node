export enum Brand {
  MainBrand = 'mainbrand',
  OtherBrand = 'otherbrand'
}

export enum Country {
  US = 'US',
  RUSSIA = 'RU'
}

export interface Config {
  aws: {
    accessKeyId: string
    secretAccessKey: string
    region: string
  }
  someExternalService: {
    baseUrl: string
    auth: {
      username: string
      password: string
    }
    callTimeout: number
  }
}

export interface ConfigDefinition {
  aws: {
    accessKeyId: StringParam
    secretAccessKey: StringParam
    region: StringParam
  }
  someExternalService: {
    baseUrl: StringParam
    auth: {
      username: StringParam
      password: StringParam
    }
    callTimeout: NumberParam
  }
}

export type ConfigDefinitionMap = DeepPartial<
  { [key in Environment | 'default']: ConfigDefinition }
>

type StringParam =
  | string
  | { [key in Brand]: string | { [key in Country]: string } }
  | { [key in Country]: string }
type BooleanParam = boolean | { [key in Brand]: boolean | { [key in Country]: boolean } | string[] }
type NumberParam = number | { [key in Brand]: number | { [key in Country]: number } | number[] }

export enum Environment {
  production = 'production',
  staging = 'staging',
  test = 'test',
  development = 'development'
}

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
