import { wildcardMatch } from '@sniper.io/lib/wildcardMatch'
import {
  excludedModelsFromImageUrlSupport,
  modelsWithImageUrlSupport,
} from '../constants'

export const isModelCompatibleWithVision = (model: string | undefined) =>
  model && !excludedModelsFromImageUrlSupport.includes(model)
    ? wildcardMatch(modelsWithImageUrlSupport)(model)
    : false
