import { StepIndices, WhatsAppOptionsListStep } from 'models'
import React from 'react'
import { BoxContainer, Container, Space } from './WhatsAppOptionsContent.style'
import { ItemNodesList } from 'components/shared/Graph/Nodes/ItemNode'
import { Stack, Text } from '@chakra-ui/react'
import { WithVariableContent } from '../../WithVariableContent'

type Props = {
  step: WhatsAppOptionsListStep
  indices: StepIndices
}

const WhatsAppOptionsContent = ({ step, indices }: Props) => {
  return (
    <>
      <Container>
        <BoxContainer>
          {
            <Stack>
              <Text color={'gray.500'} noOfLines={0}>
                {step.options?.header && (
                  <strong>{step.options.header.content?.plainText}</strong>
                )}
              </Text>
              <Text color={'gray.500'} noOfLines={0}>
                {step.options?.body && (
                  <label>{step.options.body.content?.plainText}</label>
                )}
              </Text>
              <Text color={'gray.500'} noOfLines={0}>
                {step.options?.listTitle && (
                  <label>{step.options.listTitle.content?.plainText}</label>
                )}
              </Text>
            </Stack>
          }
        </BoxContainer>
        <ItemNodesList step={step} indices={indices} />
        <BoxContainer>
          {
            <Stack>
              <Text color={'gray.500'} fontSize="xs" noOfLines={0}>
                {step.options?.footer && (
                  <label>{step.options.footer.content?.plainText}</label>
                )}
              </Text>
            </Stack>
          }
        </BoxContainer>
        <Space>
          <WithVariableContent variableId={step.options?.variableId} />
        </Space>
      </Container>
    </>
  )
}

export default WhatsAppOptionsContent
