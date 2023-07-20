import { StepIndices, WhatsAppButtonsListStep } from 'models'
import React from 'react'
import { ItemNodesList } from 'components/shared/Graph/Nodes/ItemNode'
import { Stack, Text } from '@chakra-ui/react'
import { WithVariableContent } from '../../WithVariableContent'
import { OctaDivider } from 'assets/OctaDivider'

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
          <Text noOfLines={0}>
            {step.options?.header.content?.plainText && (
              <strong>{step.options.header.content?.plainText}</strong>
            )}
          </Text>
          <Text noOfLines={0}>
            {step.options?.body?.content?.plainText && step.options.body.content?.plainText}
          </Text>
          <ItemNodesList step={step} indices={indices} />
          <Text fontSize="xs" noOfLines={0}>
            {step.options?.footer && step.options.footer.content?.plainText}
          </Text>
          <OctaDivider />
          <WithVariableContent variableId={step?.options?.variableId} property={step?.options?.property} />
        </>
      }
    </Stack>
  )
}

export default WhatsApButtonsContent
