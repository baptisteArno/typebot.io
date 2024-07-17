import { Block } from '@sniper.io/schemas'
import { IntegrationBlockType } from '@sniper.io/schemas/features/blocks/integrations/constants'

type Feature = 'editor' | Block['type']

export const onboardingVideos: Partial<
  Record<
    Feature,
    | {
        key: string
        youtubeId: string
        deployedAt: Date
      }
    | undefined
  >
> = {
  editor: {
    key: 'editor',
    youtubeId: 'vlbtd47OQdI',
    deployedAt: new Date('2024-06-04'),
  },
  [IntegrationBlockType.ZAPIER]: {
    key: IntegrationBlockType.ZAPIER,
    youtubeId: '2ZskGItI_Zo',
    deployedAt: new Date('2024-06-04'),
  },
  [IntegrationBlockType.MAKE_COM]: {
    key: IntegrationBlockType.MAKE_COM,
    youtubeId: 'V-y1Orys_kY',
    deployedAt: new Date('2024-06-04'),
  },
}
