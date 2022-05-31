import { Tag, Text, Wrap, WrapItem } from '@chakra-ui/react'
import { SendEmailStep } from 'models'

type Props = {
  step: SendEmailStep
}

export const SendEmailContent = ({ step }: Props) => {
  if (step.options.recipients.length === 0)
    return <Text color="gray.500">Configure...</Text>
  return (
    <Wrap noOfLines={2} pr="6">
      <WrapItem>
        <Text>Send email to</Text>
      </WrapItem>
      {step.options.recipients.map((to) => (
        <WrapItem key={to}>
          <Tag>{to}</Tag>
        </WrapItem>
      ))}
    </Wrap>
  )
}
