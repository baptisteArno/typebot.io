import { Text } from '@chakra-ui/react'
import { RatingInputBlock } from 'models'

type Props = {
  block: RatingInputBlock
}

export const RatingInputContent = ({ block }: Props) => (
  <Text noOfLines={1} pr="6">
    Rate from 1 to {block.options.length}
  </Text>
)
