export enum Brand {
  Alpha = 'alpha',
  Beta = 'beta'
}

export const BRAND_DEFAULT_FILTER = 'brandDefault'
declare type BRAND_DEFAULT_FILTER_TYPE = 'brandDefault'

export const COUNTRY_DEFAULT_FILTER = 'countryDefault'
declare type COUNTRY_DEFAULT_FILTER_TYPE = 'countryDefault'

export const CONFIG_FINAL_VALUE = 'configValue'
declare type ConfigFinalValue<T> = { configValue: T } // Used to specify that included value is final resolved value, its properties should not be parsed as filters

export declare type ConfigValueProducer<T> = (brand: Brand, country: Country) => T

export type NestedRecordParam<T> =
  | T
  | ConfigFinalValue<T>
  | {
      [key in Country | COUNTRY_DEFAULT_FILTER_TYPE]?:
        | T
        | { [key in Brand | BRAND_DEFAULT_FILTER_TYPE]?: T }
    }
  | {
      [key in Brand | BRAND_DEFAULT_FILTER_TYPE]?:
        | T
        | { [key in Country | COUNTRY_DEFAULT_FILTER_TYPE]?: T }
    }
  | {
      [key in Country | COUNTRY_DEFAULT_FILTER_TYPE]?:
        | ConfigFinalValue<T>
        | { [key in Brand | BRAND_DEFAULT_FILTER_TYPE]?: ConfigFinalValue<T> }
    }
  | {
      [key in Brand | BRAND_DEFAULT_FILTER_TYPE]?:
        | ConfigFinalValue<T>
        | { [key in Country | COUNTRY_DEFAULT_FILTER_TYPE]?: ConfigFinalValue<T> }
    }

export type StringParam =
  | string
  | ConfigValueProducer<string>
  | {
      [key in Brand | BRAND_DEFAULT_FILTER_TYPE]:
        | string
        | { [key in Country | COUNTRY_DEFAULT_FILTER_TYPE]: string }
        | ConfigValueProducer<string>
    }
  | {
      [key in Brand | BRAND_DEFAULT_FILTER_TYPE]:
        | string
        | { [key in Country | COUNTRY_DEFAULT_FILTER_TYPE]: ConfigValueProducer<string> }
    }
  | { [key in Country | COUNTRY_DEFAULT_FILTER_TYPE]: string }
  | { [key in Country | COUNTRY_DEFAULT_FILTER_TYPE]: ConfigValueProducer<string> }

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
  | { [key in Country | COUNTRY_DEFAULT_FILTER_TYPE]: boolean }

export type NumberParam =
  | number
  | {
      [key in Brand | BRAND_DEFAULT_FILTER_TYPE]:
        | number
        | { [key in Country | COUNTRY_DEFAULT_FILTER_TYPE]: number }
        | number[]
    }

export enum Country {
  ARGENTINA = 'AR',
  AUSTRALIA = 'AU',
  AUSTRIA = 'AT',
  BRAZIL = 'BR',
  CANADA = 'CA',
  CHILE = 'CL',
  COLOMBIA = 'CO',
  BULGARIA = 'BG',
  BELGIUM = 'BE',
  CROATIA = 'HR',
  CZECH = 'CZ',
  DENMARK = 'DK',
  EUROPEAN_UNION = 'EU',
  FINLAND = 'FI',
  FRANCE = 'FR',
  GERMANY = 'DE',
  GREECE = 'GR',
  HUNGARY = 'HU',
  INDIA = 'IN',
  IRELAND = 'IE',
  ITALY = 'IT',
  MALAYSIA = 'MY',
  MEXICO = 'MX',
  NETHERLANDS = 'NL',
  NEWZEALAND = 'NZ',
  NORWAY = 'NO',
  PERU = 'PE',
  PHILIPPINES = 'PH',
  POLAND = 'PL',
  PORTUGAL = 'PT',
  RUSSIA = 'RU',
  ROMANIA = 'RO',
  SINGAPORE = 'SG',
  SLOVAKIA = 'SK',
  SPAIN = 'ES',
  SWEDEN = 'SE',
  SWITZERLAND = 'CH',
  THAILAND = 'TH',
  TURKEY = 'TR',
  UK = 'GB',
  US = 'US',
  VIETNAM = 'VN'
}

export enum Environment {
  production = 'prod',
  staging = 'stg',
  test = 'test',
  branch = 'branch',
  development = 'dev'
}
