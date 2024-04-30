import React from 'react'
import { Stack } from '@chakra-ui/react'

import {
  StepIndices,
  WhatsAppButtonsListStep,
  defaultWhatsAppButtonsListOptions,
} from 'models'
import { ItemNodesList } from 'components/shared/Graph/Nodes/ItemNode'
import { OctaDivider } from 'components/octaComponents/OctaDivider/OctaDivider'

import { WithVariableContent } from '../../WithVariableContent'
import { TextHtmlContent } from '../../TextHtmlContent'

type Props = {
  step: WhatsAppButtonsListStep
  indices: StepIndices
}

const WhatsApButtonsContent = ({ step, indices }: Props) => {
  if (!step.options) step.options = defaultWhatsAppButtonsListOptions

  return (
    <Stack>
      <TextHtmlContent
        html={step.options?.header?.content?.html}
        fontSize="xl"
        renderIfEmpty={false}
      />
      <TextHtmlContent
        html={step.options?.body?.content?.html}
        defaultPlaceholder="Configurar..."
      />
      <ItemNodesList step={step} indices={indices} />
      <TextHtmlContent
        html={step.options?.footer?.content?.html}
        renderIfEmpty={false}
        fontSize="xs"
      />

      <OctaDivider />
      <WithVariableContent
        variableId={step?.options?.variableId}
        property={step?.options?.property}
      />
    </Stack>
  )
}

export default WhatsApButtonsContent
