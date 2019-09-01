const { OpenApi3SpecificationCombiner } = require('swagger-combinator')
const combiner = new OpenApi3SpecificationCombiner()

const TARGET_SPEC_FILE = '../serviceSpec.yaml'

function combine() {
  const mergedSpec = combiner.generateMergedSpec('../src/**/api/**/*.yaml')
  combiner.writeSpecAsYaml(mergedSpec, TARGET_SPEC_FILE)
}


combine()
