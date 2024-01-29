import { WOZAssignStep } from 'models'
import React from 'react'
import { Stack, Text } from '@chakra-ui/react'

type Props = {
  step: WOZAssignStep
}

const WOZAssignContent = ({ step }: Props) => {
  return (
    <Stack>
      <Text noOfLines={0}>
        Saiba Mais...
      </Text>
    </Stack>
  )
}

export default WOZAssignContent