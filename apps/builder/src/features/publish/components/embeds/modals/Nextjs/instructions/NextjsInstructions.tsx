import { NextjsBubbleInstructions } from './NextjsBubbleInstructions'
import { NextjsPopupInstructions } from './NextjsPopupInstructions'
import { NextjsStandardInstructions } from './NextjsStandardInstructions'

type Props = {
  type: 'standard' | 'popup' | 'bubble'
}

export const NextjsInstructions = ({ type }: Props) => {
  switch (type) {
    case 'standard': {
      return <NextjsStandardInstructions />
    }
    case 'popup': {
      return <NextjsPopupInstructions />
    }
    case 'bubble': {
      return <NextjsBubbleInstructions />
    }
  }
}
