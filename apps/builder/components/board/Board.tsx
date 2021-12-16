import { Flex } from '@chakra-ui/react'
import React from 'react'
import StepsList from './StepTypesList'
import Graph from './graph/Graph'
import { DndContext } from 'contexts/DndContext'

export const Board = () => (
  <Flex flex="1" pos="relative" bgColor="gray.50">
    <DndContext>
      <StepsList />
      <Graph />
    </DndContext>
  </Flex>
)
