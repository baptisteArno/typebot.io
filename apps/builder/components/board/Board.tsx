import { Flex } from '@chakra-ui/react'
import React from 'react'
import Graph from './graph/Graph'
import { DndContext } from 'contexts/DndContext'
import StepTypesList from './StepTypesList'

export const Board = () => (
  <Flex flex="1" pos="relative" bgColor="gray.50">
    <DndContext>
      <StepTypesList />
      <Graph />
    </DndContext>
  </Flex>
)
