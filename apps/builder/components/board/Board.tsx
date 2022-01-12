import { Flex } from '@chakra-ui/react'
import React from 'react'
import Graph from './graph/Graph'
import { DndContext } from 'contexts/DndContext'
import { StepTypesList } from './StepTypesList'
import { PreviewDrawer } from './preview/PreviewDrawer'
import { RightPanel, useEditor } from 'contexts/EditorContext'
import { GraphProvider } from 'contexts/GraphContext'
import { BoardMenuButton } from './BoardMenuButton'

export const Board = () => {
  const { rightPanel } = useEditor()
  return (
    <Flex flex="1" pos="relative" bgColor="gray.50" h="full">
      <DndContext>
        <StepTypesList />
        <GraphProvider>
          <Graph flex="1" />
          <BoardMenuButton pos="absolute" right="20px" top="20px" />
          {rightPanel === RightPanel.PREVIEW && <PreviewDrawer />}
        </GraphProvider>
      </DndContext>
    </Flex>
  )
}
