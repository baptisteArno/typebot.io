import { Tag, Text, Wrap, WrapItem } from '@chakra-ui/react'
import { SendEmailBlock } from '@typebot.io/schemas'

type Props = {
  block: SendEmailBlock
}

export const SendEmailContent = ({ block }: Props) => {
  if (block.options.recipients.length === 0)
    return <Text color="gray.500">Configure...</Text>
  return (
    <Wrap noOfLines={2} pr="6">
      <WrapItem>
        <Text>Send email to</Text>
      </WrapItem>
      {block.options.recipients.map((to) => (
        <WrapItem key={to}>
          <Tag>{to}</Tag>
        </WrapItem>
      ))}
    </Wrap>
  )
}
