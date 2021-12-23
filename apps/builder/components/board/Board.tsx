import { Flex } from '@chakra-ui/react'
import React from 'react'
import Graph from './graph/Graph'
import { DndContext } from 'contexts/DndContext'
import { StepTypesList } from './StepTypesList'
import { PreviewDrawer } from './preview/PreviewDrawer'
import { RightPanel, useEditor } from 'contexts/EditorContext'

export const Board = () => {
  const { rightPanel } = useEditor()
  return (
    <Flex flex="1" pos="relative" bgColor="gray.50" h="full">
      <DndContext>
        <StepTypesList />
        <Graph />
        {rightPanel === RightPanel.PREVIEW && <PreviewDrawer />}
      </DndContext>
    </Flex>
  )
}
