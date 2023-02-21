import { WixBubbleInstructions } from './WixBubbleInstructions'
import { WixPopupInstructions } from './WixPopupInstructions'
import { WixStandardInstructions } from './WixStandardInstuctions'

type WixInstructionsProps = {
  type: 'standard' | 'popup' | 'bubble'
}

export const WixInstructions = ({ type }: WixInstructionsProps) => {
  switch (type) {
    case 'standard': {
      return <WixStandardInstructions />
    }
    case 'popup': {
      return <WixPopupInstructions />
    }
    case 'bubble': {
      return <WixBubbleInstructions />
    }
  }
}
