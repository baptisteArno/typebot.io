import { FramerBubbleInstructions } from './FramerBubbleInstructions'
import { FramerPopupInstructions } from './FramerPopupInstructions'
import { FramerStandardInstructions } from './FramerStandardInstructions'

type Props = {
  type: 'standard' | 'popup' | 'bubble'
}

export const FramerInstructions = ({ type }: Props) => {
  switch (type) {
    case 'standard': {
      return <FramerStandardInstructions />
    }
    case 'popup': {
      return <FramerPopupInstructions />
    }
    case 'bubble': {
      return <FramerBubbleInstructions />
    }
  }
}
