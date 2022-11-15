import { Seo } from '@/components/Seo'
import {
  Graph,
  GraphDndProvider,
  GraphProvider,
  GroupsCoordinatesProvider,
} from '@/features/graph'
import { Flex, Spinner } from '@chakra-ui/react'
import {
  EditorProvider,
  useEditor,
  RightPanel as RightPanelEnum,
} from '../providers/EditorProvider'
import { useTypebot } from '../providers/TypebotProvider'
import { BlocksSideBar } from './BlocksSideBar'
import { BoardMenuButton } from './BoardMenuButton'
import { GettingStartedModal } from './GettingStartedModal'
import { PreviewDrawer } from './PreviewDrawer'
import { TypebotHeader } from './TypebotHeader'

export const EditTypebotPage = () => {
  const { typebot, isReadOnly } = useTypebot()

  return (
    <EditorProvider>
      <Seo title="Editor" />
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
            <GraphDndProvider>
              <BlocksSideBar />
              <GraphProvider isReadOnly={isReadOnly}>
                <GroupsCoordinatesProvider groups={typebot.groups}>
                  <Graph flex="1" typebot={typebot} />
                  <BoardMenuButton pos="absolute" right="40px" top="20px" />
                  <RightPanel />
                </GroupsCoordinatesProvider>
              </GraphProvider>
            </GraphDndProvider>
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
    </EditorProvider>
  )
}

const RightPanel = () => {
  const { rightPanel } = useEditor()
  return rightPanel === RightPanelEnum.PREVIEW ? <PreviewDrawer /> : <></>
}
