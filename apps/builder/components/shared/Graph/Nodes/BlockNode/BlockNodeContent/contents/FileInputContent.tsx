import { Text } from '@chakra-ui/react'
import { FileInputOptions } from 'models'

type Props = {
  options: FileInputOptions
}

export const FileInputContent = ({ options: { isMultipleAllowed } }: Props) => (
  <Text noOfLines={0} pr="6">
    Collect {isMultipleAllowed ? 'files' : 'file'}
  </Text>
)
