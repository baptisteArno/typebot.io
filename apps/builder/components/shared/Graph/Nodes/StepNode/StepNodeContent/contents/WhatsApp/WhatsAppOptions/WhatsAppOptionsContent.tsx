import { StepIndices, WhatsAppOptionsListStep } from 'models'
import React from 'react'
import { BoxContainer, Container, Space } from './WhatsAppOptionsContent.style'
import { ItemNodesList } from 'components/shared/Graph/Nodes/ItemNode'
import { Stack, Text } from '@chakra-ui/react'
import { WithVariableContent } from '../../WithVariableContent'
import { OctaDivider } from 'assets/OctaDivider'

type Props = {
  step: WhatsAppOptionsListStep
  indices: StepIndices
}

const WhatsAppOptionsContent = ({ step, indices }: Props) => {
  return (
    <Stack>
      {!step.options?.body?.content?.plainText && !step.options?.header?.content?.plainText &&
        <Text noOfLines={0}>
          Clique para editar...
        </Text>
      }
      <Text noOfLines={0}>
        {step.options?.header && (
          <strong>{step.options.header.content?.plainText}</strong>
        )}
      </Text>
      <Text noOfLines={0}>
        {step.options?.body && step.options.body.content?.plainText}
      </Text>
      <Text noOfLines={0}>
        {step.options?.listTitle && step.options.listTitle.content?.plainText}
      </Text>
      <ItemNodesList step={step} indices={indices} />
      <Text fontSize="xs" noOfLines={0}>
        {step.options?.footer && step.options.footer.content?.plainText}
      </Text>
      <OctaDivider />
      <WithVariableContent variableId={step.options?.variableId} property={step?.options?.property} />
    </Stack >
  )
}

export default WhatsAppOptionsContent
