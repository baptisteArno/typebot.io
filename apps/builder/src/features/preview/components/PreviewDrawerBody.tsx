import { runtimes } from '../data'
import { ApiPreviewInstructions } from './ApiPreviewInstructions'
import { WebPreview } from './WebPreview'

type Props = {
  runtime: (typeof runtimes)[number]['name']
}

export const PreviewDrawerBody = ({ runtime }: Props) => {
  switch (runtime) {
    case 'Web': {
      return <WebPreview />
    }
    case 'API': {
      return <ApiPreviewInstructions pt="4" />
    }
  }
}
