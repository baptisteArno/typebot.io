import { ShopifyBubbleInstructions } from './ShopifyBubbleInstructions'
import { ShopifyPopupInstructions } from './ShopifyPopupInstructions'
import { ShopifyStandardInstructions } from './ShopifyStandardInstructions'

type ShopifyInstructionsProps = {
  type: 'standard' | 'popup' | 'bubble'
  publicId: string
}

export const ShopifyInstructions = ({
  type,
  publicId,
}: ShopifyInstructionsProps) => {
  switch (type) {
    case 'standard': {
      return <ShopifyStandardInstructions publicId={publicId} />
    }
    case 'popup': {
      return <ShopifyPopupInstructions />
    }
    case 'bubble': {
      return <ShopifyBubbleInstructions />
    }
  }
}
