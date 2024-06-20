import { ForgedBlockDefinition } from '@sniper.io/forge-repository/types'
import { Block } from '@sniper.io/schemas'
import { onboardingVideos } from '../data'
import { isDefined } from '@sniper.io/lib/utils'

type Props = {
  blockType: Block['type']
  blockDef?: ForgedBlockDefinition
}
export const hasOnboardingVideo = ({ blockType, blockDef }: Props) =>
  isDefined(
    blockDef?.onboarding?.youtubeId ?? onboardingVideos[blockType]?.youtubeId
  )
