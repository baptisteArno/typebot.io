import { StepIndices, WhatsAppButtonsListStep } from 'models'
import React from 'react'
import { ItemNodesList } from 'components/shared/Graph/Nodes/ItemNode'
import { Stack, Text } from '@chakra-ui/react'
import { WithVariableContent } from '../../WithVariableContent'
import { OctaDivider } from 'components/octaComponents/OctaDivider/OctaDivider'
import { TextHtmlContent } from '../../TextHtmlContent'

type Props = {
  step: WhatsAppButtonsListStep
  indices: StepIndices
}

const WhatsApButtonsContent = ({ step, indices }: Props) => {
  return (
    <Stack>
      {!step.options?.body?.content?.plainText && !step.options?.header?.content?.plainText &&
        <Text noOfLines={0}>
          Clique para editar...
        </Text>
      }
      {step.options?.body?.content?.plainText &&
        <>
          {step.options?.header?.content?.plainText && (
            <TextHtmlContent html={step.options.header.content.html} fontSize='xl' />
          )}

          <TextHtmlContent html={step.options.body.content.html} />
          <ItemNodesList step={step} indices={indices} />
          <TextHtmlContent html={step.options.footer.content?.html} renderIfEmpty={false} fontSize='xs' />
          <OctaDivider />
          <WithVariableContent variableId={step?.options?.variableId} property={step?.options?.property} />
        </>
      }
    </Stack>
  )
}

export default WhatsApButtonsContent
