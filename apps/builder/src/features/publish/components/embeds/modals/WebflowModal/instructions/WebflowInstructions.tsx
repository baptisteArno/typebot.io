import { WebflowStandardInstructions } from './WebflowStandardInstructions'
import { WebflowPopupInstructions } from './WebflowPopupInstructions'
import { WebflowBubbleInstructions } from './WebflowBubbleInstructions'

type WebflowInstructionsProps = {
  type: 'standard' | 'popup' | 'bubble'
}

export const WebflowInstructions = ({ type }: WebflowInstructionsProps) => {
  switch (type) {
    case 'standard': {
      return <WebflowStandardInstructions />
    }
    case 'popup': {
      return <WebflowPopupInstructions />
    }
    case 'bubble': {
      return <WebflowBubbleInstructions />
    }
  }
}
