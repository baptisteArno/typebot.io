import { ForgedBlockDefinition } from '@typebot.io/forge-repository/types'
import { Block } from '@typebot.io/schemas'
import { onboardingVideos } from '../data'
import { isDefined } from '@typebot.io/lib/utils'

type Props = {
  blockType: Block['type']
  blockDef?: ForgedBlockDefinition
}
export const hasOnboardingVideo = ({ blockType, blockDef }: Props) =>
  isDefined(
    blockDef?.onboarding?.youtubeId ?? onboardingVideos[blockType]?.youtubeId
  )
