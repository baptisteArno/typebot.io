import { GtmBubbleInstructions } from './GtmBubbleInstructions'
import { GtmPopupInstructions } from './GtmPopupInstructions'
import { GtmStandardInstructions } from './GtmStandardInstructions'

type GtmInstructionsProps = {
  type: 'standard' | 'popup' | 'bubble'
  publicId: string
}

export const GtmInstructions = ({ type, publicId }: GtmInstructionsProps) => {
  switch (type) {
    case 'standard': {
      return <GtmStandardInstructions publicId={publicId} />
    }
    case 'popup': {
      return <GtmPopupInstructions />
    }
    case 'bubble': {
      return <GtmBubbleInstructions />
    }
  }
}
