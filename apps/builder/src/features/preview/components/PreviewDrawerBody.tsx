import { runtimes } from '../data'
import { ApiPreviewInstructions } from './ApiPreviewInstructions'
import { WebPreview } from './WebPreview'
import { WhatsAppPreviewInstructions } from './WhatsAppPreviewInstructions'

type Props = {
  runtime: (typeof runtimes)[number]['name']
}

export const PreviewDrawerBody = ({ runtime }: Props): JSX.Element => {
  switch (runtime) {
    case 'Web': {
      return <WebPreview />
    }
    case 'WhatsApp': {
      return <WhatsAppPreviewInstructions />
    }
    case 'API': {
      return <ApiPreviewInstructions pt="4" />
    }
  }
}
