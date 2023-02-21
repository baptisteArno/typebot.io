import { JavascriptBubbleInstructions } from './JavascriptBubbleInstructions'
import { JavascriptPopupInstructions } from './JavascriptPopupInstructions'
import { JavascriptStandardInstructions } from './JavascriptStandardInstructions'

type JavascriptInstructionsProps = {
  type: 'standard' | 'popup' | 'bubble'
}

export const JavascriptInstructions = ({
  type,
}: JavascriptInstructionsProps) => {
  switch (type) {
    case 'standard': {
      return <JavascriptStandardInstructions />
    }
    case 'popup': {
      return <JavascriptPopupInstructions />
    }
    case 'bubble': {
      return <JavascriptBubbleInstructions />
    }
  }
}
