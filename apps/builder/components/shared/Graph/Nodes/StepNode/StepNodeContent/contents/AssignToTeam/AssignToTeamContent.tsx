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
