import { Flex } from '@chakra-ui/react'
import React from 'react'
import { GraphDndContext } from 'contexts/GraphDndContext'
import { StepsSideBar } from '../../components/editor/StepsSideBar'
import { PreviewDrawer } from '../../components/editor/preview/PreviewDrawer'
import { RightPanel, useEditor } from 'contexts/EditorContext'
import { GraphProvider } from 'contexts/GraphContext'
import { BoardMenuButton } from '../../components/editor/BoardMenuButton'
import { useTypebot } from 'contexts/TypebotContext'
import { Graph } from 'components/shared/Graph'

export const Board = () => {
  const { typebot, isReadOnly } = useTypebot()
  const { rightPanel } = useEditor()

  return (
    <Flex
      flex="1"
      pos="relative"
      h="full"
      background="#f4f5f8"
      backgroundImage="radial-gradient(#c6d0e1 1px, transparent 0)"
      backgroundSize="40px 40px"
      backgroundPosition="-19px -19px"
    >
      <GraphDndContext>
        <StepsSideBar />
        <GraphProvider blocks={typebot?.blocks ?? []} isReadOnly={isReadOnly}>
          {typebot && <Graph flex="1" typebot={typebot} />}
          <BoardMenuButton pos="absolute" right="40px" top="20px" />
          {rightPanel === RightPanel.PREVIEW && <PreviewDrawer />}
        </GraphProvider>
      </GraphDndContext>
    </Flex>
  )
}
