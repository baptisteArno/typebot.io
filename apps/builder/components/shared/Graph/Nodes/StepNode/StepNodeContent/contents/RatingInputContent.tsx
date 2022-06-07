import { Text } from '@chakra-ui/react'
import { RatingInputStep } from 'models'

type Props = {
  step: RatingInputStep
}

export const RatingInputContent = ({ step }: Props) => (
  <Text noOfLines={0} pr="6">
    Rate from 1 to {step.options.length}
  </Text>
)
