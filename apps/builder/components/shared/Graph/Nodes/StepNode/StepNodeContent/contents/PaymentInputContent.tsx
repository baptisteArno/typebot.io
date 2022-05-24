import { Text } from '@chakra-ui/react'
import { PaymentInputStep } from 'models'

type Props = {
  step: PaymentInputStep
}

export const PaymentInputContent = ({ step }: Props) => {
  if (
    !step.options.amount ||
    !step.options.credentialsId ||
    !step.options.currency
  )
    return <Text color="gray.500">Configure...</Text>
  return (
    <Text noOfLines={0} pr="6">
      Collect {step.options.amount} {step.options.currency}
    </Text>
  )
}
