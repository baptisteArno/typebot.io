import { Text } from '@chakra-ui/react'
import { ZapierStep } from 'models'
import { isNotDefined } from 'utils'

type Props = {
  step: ZapierStep
}

export const ZapierContent = ({ step }: Props) => {
  if (isNotDefined(step.webhook.body))
    return <Text color="gray.500">Configure...</Text>
  return (
    <Text isTruncated pr="6">
      {step.webhook.url ? 'Enabled' : 'Disabled'}
    </Text>
  )
}
