export enum Brand {
  Alpha = 'alpha',
  Beta = 'beta'
}

export const BRAND_DEFAULT_FILTER = 'brandDefault'
declare type BRAND_DEFAULT_FILTER_TYPE = 'brandDefault'

export const COUNTRY_DEFAULT_FILTER = 'countryDefault'
declare type COUNTRY_DEFAULT_FILTER_TYPE = 'countryDefault'

export type NestedRecordParam<T> =
  | T
  | { [key in Country | COUNTRY_DEFAULT_FILTER_TYPE]?: T }
  | {
      [key in Brand | BRAND_DEFAULT_FILTER_TYPE]?:
        | T
        | { [key in Country | COUNTRY_DEFAULT_FILTER_TYPE]?: T }
    }

export type StringParam =
  | string
  | {
      [key in Brand | BRAND_DEFAULT_FILTER_TYPE]:
        | string
        | { [key in Country | COUNTRY_DEFAULT_FILTER_TYPE]: string }
    }
  | { [key in Country | COUNTRY_DEFAULT_FILTER_TYPE]: string }

export type StringArrayParam =
  | string[]
  | {
      [key in Brand | BRAND_DEFAULT_FILTER_TYPE]:
        | string[]
        | { [key in Country | COUNTRY_DEFAULT_FILTER_TYPE]: string[] }
    }
  | { [key in Country | COUNTRY_DEFAULT_FILTER_TYPE]: string[] }

export type BooleanParam =
  | boolean
  | {
      [key in Brand | BRAND_DEFAULT_FILTER_TYPE]:
        | boolean
        | { [key in Country | COUNTRY_DEFAULT_FILTER_TYPE]: boolean }
        | string[]
    }
export type NumberParam =
  | number
  | {
      [key in Brand | BRAND_DEFAULT_FILTER_TYPE]:
        | number
        | { [key in Country | COUNTRY_DEFAULT_FILTER_TYPE]: number }
        | number[]
    }

export enum Country {
  CANADA = 'CA',
  BULGARIA = 'BG',
  BELGIUM = 'BE',
  CROATIA = 'HR',
  CZECH = 'CZ',
  DENMARK = 'DK',
  FINLAND = 'FI',
  FRANCE = 'FR',
  GERMANY = 'DE',
  GREECE = 'GR',
  HUNGARY = 'HU',
  IRELAND = 'IE',
  NETHERLANDS = 'NL',
  POLAND = 'PL',
  PORTUGAL = 'PT',
  RUSSIA = 'RU',
  ROMANIA = 'RO',
  SLOVAKIA = 'SK',
  SWITZERLAND = 'CH',
  TURKEY = 'TR',
  UK = 'GB',
  US = 'US'
}

export enum Environment {
  production = 'prod',
  staging = 'stg',
  test = 'test',
  branch = 'branch',
  development = 'dev'
}
