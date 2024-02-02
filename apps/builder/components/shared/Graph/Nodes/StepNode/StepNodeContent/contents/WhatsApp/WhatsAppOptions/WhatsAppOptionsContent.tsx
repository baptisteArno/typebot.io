import {
  StepIndices,
  WhatsAppOptionsListStep,
  defaultWhatsAppOptionsListOptions,
} from 'models'
import React, { useEffect } from 'react'
import { ItemNodesList } from 'components/shared/Graph/Nodes/ItemNode'
import { Stack } from '@chakra-ui/react'
import { WithVariableContent } from '../../WithVariableContent'
import { OctaDivider } from 'components/octaComponents/OctaDivider/OctaDivider'
import { TextHtmlContent } from '../../TextHtmlContent'

type Props = {
  step: WhatsAppOptionsListStep
  indices: StepIndices
}

const WhatsAppOptionsContent = ({ step, indices }: Props) => {
  useEffect(() => {
    if (!step.options) step.options = defaultWhatsAppOptionsListOptions
  }, [step])
  return (
    <Stack>
      <TextHtmlContent
        html={step?.options?.header?.content?.html}
        fontSize="xl"
        renderIfEmpty={false}
      />

      {/* Campo obrigatório body */}
      <TextHtmlContent html={step.options?.body?.content?.html} />

      {/* Campo obrigatório listTitle */}
      <TextHtmlContent html={step?.options?.listTitle?.content?.html} />

      <ItemNodesList step={step} indices={indices} />

      <TextHtmlContent
        html={step?.options?.footer?.content?.html}
        renderIfEmpty={false}
        fontSize={'xs'}
      />
      <OctaDivider />
      <WithVariableContent
        variableId={step?.options?.variableId}
        property={step?.options?.property}
      />
    </Stack>
  )
}

export default WhatsAppOptionsContent
