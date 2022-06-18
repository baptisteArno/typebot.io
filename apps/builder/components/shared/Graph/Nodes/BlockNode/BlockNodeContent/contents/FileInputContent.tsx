import { Text } from '@chakra-ui/react'
import { FileInputOptions } from 'models'

type Props = {
  options: FileInputOptions
}

export const FileInputContent = ({ options: { isMultipleAllowed } }: Props) => (
  <Text noOfLines={1} pr="6">
    Collect {isMultipleAllowed ? 'files' : 'file'}
  </Text>
)
