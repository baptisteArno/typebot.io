import { Tag, Text, Wrap, WrapItem } from '@chakra-ui/react'
import { SendEmailStep } from 'models'

type Props = {
  step: SendEmailStep
}

export const SendEmailContent = ({ step }: Props) => {
  if (step.options.recipients.length === 0)
    return <Text color="gray.500">Configuração...</Text>
  return (
    <Wrap noOfLines={2} pr="6">
      <WrapItem>
        <Text>Enviar email para</Text>
      </WrapItem>
      {step.options.recipients.map((to) => (
        <WrapItem key={to}>
          <Tag>{to}</Tag>
        </WrapItem>
      ))}
    </Wrap>
  )
}
