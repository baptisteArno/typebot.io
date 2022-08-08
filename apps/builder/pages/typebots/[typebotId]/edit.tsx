import { Seo } from 'components/Seo'
import { TypebotHeader } from 'components/shared/TypebotHeader'
import {
  EditorContext,
  RightPanel as RightPanelEnum,
  useEditor,
} from 'contexts/EditorContext'
import React from 'react'
import { KBar } from 'components/shared/KBar'
import { BoardMenuButton } from 'components/editor/BoardMenuButton'
import { PreviewDrawer } from 'components/editor/preview/PreviewDrawer'
import { BlocksSideBar } from 'components/editor/BlocksSideBar'
import { Graph } from 'components/shared/Graph'
import { GraphProvider, GroupsCoordinatesProvider } from 'contexts/GraphContext'
import { GraphDndContext } from 'contexts/GraphDndContext'
import { useTypebot } from 'contexts/TypebotContext'
import { GettingStartedModal } from 'components/editor/GettingStartedModal'
import { Spinner, Flex } from '@chakra-ui/react'

const TypebotEditPage = () => {
  const { typebot, isReadOnly } = useTypebot()

  return (
    <EditorContext>
      <Seo title="Editor" />
      <KBar />
      <Flex overflow="clip" h="100vh" flexDir="column" id="editor-container">
        <GettingStartedModal />
        <TypebotHeader />
        <Flex
          flex="1"
          pos="relative"
          h="full"
          background="#f4f5f8"
          backgroundImage="radial-gradient(#c6d0e1 1px, transparent 0)"
          backgroundSize="40px 40px"
          backgroundPosition="-19px -19px"
        >
          {typebot ? (
            <GraphDndContext>
              <BlocksSideBar />
              <GraphProvider isReadOnly={isReadOnly}>
                <GroupsCoordinatesProvider groups={typebot.groups}>
                  <Graph flex="1" typebot={typebot} />
                  <BoardMenuButton pos="absolute" right="40px" top="20px" />
                  <RightPanel />
                </GroupsCoordinatesProvider>
              </GraphProvider>
            </GraphDndContext>
          ) : (
            <Flex
              justify="center"
              align="center"
              boxSize="full"
              bgColor="rgba(255, 255, 255, 0.5)"
            >
              <Spinner color="gray" />
            </Flex>
          )}
        </Flex>
      </Flex>
    </EditorContext>
  )
}

const RightPanel = () => {
  const { rightPanel } = useEditor()
  return rightPanel === RightPanelEnum.PREVIEW ? <PreviewDrawer /> : <></>
}

export default TypebotEditPage
