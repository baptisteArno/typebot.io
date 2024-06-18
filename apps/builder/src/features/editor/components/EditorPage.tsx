import { Seo } from '@/components/Seo'
import { Flex, Spinner, useColorModeValue } from '@chakra-ui/react'
import {
  EditorProvider,
  useEditor,
  RightPanel as RightPanelEnum,
} from '../providers/EditorProvider'
import { useSniper } from '../providers/SniperProvider'
import { BlocksSideBar } from './BlocksSideBar'
import { BoardMenuButton } from './BoardMenuButton'
import { GettingStartedModal } from './GettingStartedModal'
import { PreviewDrawer } from '@/features/preview/components/PreviewDrawer'
import { SniperHeader } from './SniperHeader'
import { Graph } from '@/features/graph/components/Graph'
import { GraphDndProvider } from '@/features/graph/providers/GraphDndProvider'
import { GraphProvider } from '@/features/graph/providers/GraphProvider'
import { EventsCoordinatesProvider } from '@/features/graph/providers/EventsCoordinateProvider'
import { SniperNotFoundPage } from './SniperNotFoundPage'
import { SuspectedSniperBanner } from './SuspectedSniperBanner'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { VariablesDrawer } from '@/features/preview/components/VariablesDrawer'

export const EditorPage = () => {
  const { sniper, currentUserMode, is404 } = useSniper()
  const { workspace } = useWorkspace()
  const backgroundImage = useColorModeValue(
    'radial-gradient(#c6d0e1 1px, transparent 0)',
    'radial-gradient(#2f2f39 1px, transparent 0)'
  )
  const bgColor = useColorModeValue('#f4f5f8', 'gray.850')

  const isSuspicious = sniper?.riskLevel === 100 && !workspace?.isVerified

  if (is404) return <SniperNotFoundPage />
  return (
    <EditorProvider>
      <Seo title={sniper?.name ? `${sniper.name} | Editor` : 'Editor'} />
      <Flex overflow="clip" h="100vh" flexDir="column" id="editor-container">
        <GettingStartedModal />
        {isSuspicious && <SuspectedSniperBanner sniperId={sniper.id} />}
        <SniperHeader />
        <Flex
          flex="1"
          pos="relative"
          h="full"
          bgColor={bgColor}
          backgroundImage={backgroundImage}
          backgroundSize="40px 40px"
          backgroundPosition="-19px -19px"
        >
          {sniper ? (
            <GraphDndProvider>
              {currentUserMode === 'write' && <BlocksSideBar />}
              <GraphProvider
                isReadOnly={
                  currentUserMode === 'read' || currentUserMode === 'guest'
                }
              >
                <EventsCoordinatesProvider events={sniper.events}>
                  <Graph flex="1" sniper={sniper} key={sniper.id} />
                  <BoardMenuButton
                    pos="absolute"
                    right="40px"
                    top={`calc(20px + ${isSuspicious ? '70px' : '0px'})`}
                  />
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
  const { rightPanel, setRightPanel } = useEditor()

  switch (rightPanel) {
    case RightPanelEnum.PREVIEW:
      return <PreviewDrawer />
    case RightPanelEnum.VARIABLES:
      return <VariablesDrawer onClose={() => setRightPanel(undefined)} />
    case undefined:
      return null
  }
}
