import { StepIndices, WhatsAppOptionsListStep } from 'models'
import React from 'react'
import { BoxContainer, Container, Space } from './WhatsAppOptionsContent.style'
import { ItemNodesList } from 'components/shared/Graph/Nodes/ItemNode'
import { Stack, Text } from '@chakra-ui/react'
import { WithVariableContent } from '../../WithVariableContent'
import { OctaDivider } from 'components/octaComponents/OctaDivider/OctaDivider'
import { TextHtmlContent } from '../../TextHtmlContent'

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
      {step.options?.header?.content?.plainText && (
        <TextHtmlContent html={step.options.header.content.html} fontSize='xl' />
      )}
      
      <TextHtmlContent html={step.options.body.content?.html} renderIfEmpty={false} />
      
      <TextHtmlContent html={step.options.listTitle.content?.html} renderIfEmpty={false} />
      <ItemNodesList step={step} indices={indices} />

      <TextHtmlContent html={step.options.footer.content?.html} renderIfEmpty={false} fontSize={"xs"} />
      <OctaDivider />
      <WithVariableContent variableId={step.options?.variableId} property={step?.options?.property} />
    </Stack >
  )
}

export default WhatsAppOptionsContent
