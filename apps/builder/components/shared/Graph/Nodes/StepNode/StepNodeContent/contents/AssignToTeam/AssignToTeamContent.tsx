import React from 'react'
import { Text, Wrap, WrapItem, Flex, Box, Stack } from '@chakra-ui/react'
import { AssignToTeamOptions, Assign, AssignToTeamStep } from 'models'
import { SourceEndpoint } from '../../../../../Endpoints'
import { TableListOcta } from 'components/shared/TableListOcta'
import { AssignToTeamContentItems } from './AssignToTeamContentItems'

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {
  options: AssignToTeamOptions['labels']
  isLong?: boolean
  isReadOnly?: boolean
  step: AssignToTeamStep
}

export const AssignToTeamContent = ({
  options,
  step,
  isLong,
  isReadOnly = false,
}: Props) => {
  const itemContent = { comparisons: [{ id: 'asd' }] }
  return (
    <TableListOcta<Assign>
      initialItems={itemContent.comparisons}
      Item={AssignToTeamContentItems}
    />
  )
}
{
  /* <Stack maxW="170px">
      <WrapItem>
        <Text color={'gray.500'} h={isLong ? '100px' : 'auto'}>
          {options.placeholder.assignToTeam}
        </Text>
      </WrapItem>
    </Stack>

    <Flex
      px="4"
      py="2"
      borderWidth="1px"
      borderColor="gray.300"
      bgColor={isReadOnly ? '' : 'gray.50'}
      rounded="md"
      pos="relative"
      align="center"
      cursor={isReadOnly ? 'pointer' : 'not-allowed'}
    >
      <Text color={isReadOnly ? 'inherit' : 'gray.500'}>Default</Text>
      <SourceEndpoint
        source={{
          blockId: '1',
          stepId: '1',
        }}
        pos="absolute"
        right="-49px"
      />
    </Flex>
  </Stack> */
}
