import { WOZSuggestionStep } from 'models'
import React from 'react'
import { chakra, Stack, Text } from '@chakra-ui/react'

type Props = {
  step: WOZSuggestionStep
}

const WOZSuggestionContent = ({ step }: Props) => {
  return (
    <Stack>
      <Text noOfLines={0}>
        Saiba Mais...
      </Text>
    </Stack>
  )
}

export default WOZSuggestionContent