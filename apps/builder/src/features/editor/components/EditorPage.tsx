import { Seo } from '@/components/Seo'
import { Flex, Spinner, useColorModeValue } from '@chakra-ui/react'
import {
  EditorProvider,
  useEditor,
  RightPanel as RightPanelEnum,
} from '../providers/EditorProvider'
import { useTypebot } from '../providers/TypebotProvider'
import { BlocksSideBar } from './BlocksSideBar'
import { BoardMenuButton } from './BoardMenuButton'
import { GettingStartedModal } from './GettingStartedModal'
import { PreviewDrawer } from '@/features/preview/components/PreviewDrawer'
import { TypebotHeader } from './TypebotHeader'
import { Graph } from '@/features/graph/components/Graph'
import { GraphDndProvider } from '@/features/graph/providers/GraphDndProvider'
import { GraphProvider } from '@/features/graph/providers/GraphProvider'
import { EventsCoordinatesProvider } from '@/features/graph/providers/EventsCoordinateProvider'
import { TypebotNotFoundPage } from './TypebotNotFoundPage'
import { SuspectedTypebotBanner } from './SuspectedTypebotBanner'

export const EditorPage = () => {
  const { typebot, currentUserMode, is404 } = useTypebot()
  const backgroundImage = useColorModeValue(
    'radial-gradient(#c6d0e1 1px, transparent 0)',
    'radial-gradient(#2f2f39 1px, transparent 0)'
  )
  const bgColor = useColorModeValue('#f4f5f8', 'gray.850')

  if (is404) return <TypebotNotFoundPage />
  return (
    <EditorProvider>
      <Seo title={typebot?.name ? `${typebot.name} | Editor` : 'Editor'} />
      <Flex overflow="clip" h="100vh" flexDir="column" id="editor-container">
        <GettingStartedModal />
        {typebot?.riskLevel === 100 && (
          <SuspectedTypebotBanner typebotId={typebot.id} />
        )}
        <TypebotHeader />
        <Flex
          flex="1"
          pos="relative"
          h="full"
          bgColor={bgColor}
          backgroundImage={backgroundImage}
          backgroundSize="40px 40px"
          backgroundPosition="-19px -19px"
        >
          {typebot ? (
            <GraphDndProvider>
              {currentUserMode === 'write' && <BlocksSideBar />}
              <GraphProvider
                isReadOnly={
                  currentUserMode === 'read' || currentUserMode === 'guest'
                }
              >
                <EventsCoordinatesProvider events={typebot.events}>
                  <Graph flex="1" typebot={typebot} key={typebot.id} />
                  <BoardMenuButton pos="absolute" right="40px" top="20px" />
                  <RightPanel />
                </EventsCoordinatesProvider>
              </GraphProvider>
            </GraphDndProvider>
          ) : (
            <Flex justify="center" align="center" boxSize="full">
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
