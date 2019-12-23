import * as R from 'ramda'
import express from 'express'

import { FeatureToggles } from './configInterface'
import { getFeatures as getBaseFeatures } from './configService'
import { Brand, Locale } from '@tf-pltfrm/core'

const HEADER_OVERWRITE_FEATURES = 'x-overwrite-features'
function extractFeaturesFromHeader(req) {
  const header = req.get(HEADER_OVERWRITE_FEATURES)
  if (!header) return {}
  const featuresWithEqualSignList = splitAndGetPropsWithEqualSign(header)
  const featurePairs = featuresWithEqualSignList.map((prop) => {
    const splitProp = prop.split('=', 2)
    return [splitProp[0], splitProp[1] === 'true']
  })
  return R.fromPairs(featurePairs)
}
const splitAndGetPropsWithEqualSign = (str) => str.split(';').filter((c) => c.indexOf('=') > 0)

export function getFeatures(locale: Locale, brand: Brand, req: express.Request): FeatureToggles {
  const features = getBaseFeatures(locale, brand)
  const featuresToOverwriteFromHeader = extractFeaturesFromHeader(req)
  return (R.mergeDeepRight(features, featuresToOverwriteFromHeader) as unknown) as FeatureToggles
}
