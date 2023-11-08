import { FlagIcon } from '@/components/icons'
import { HStack, Text } from '@chakra-ui/react'

export const StartEventNode = () => {
  return (
    <HStack spacing={3}>
      <FlagIcon />
      <Text>Start</Text>
    </HStack>
  )
}
