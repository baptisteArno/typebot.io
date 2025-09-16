import { Seo } from '@/components/Seo'
import { Graph } from '@/features/graph/components/Graph'
import { EventsCoordinatesProvider } from '@/features/graph/providers/EventsCoordinateProvider'
import { GraphDndProvider } from '@/features/graph/providers/GraphDndProvider'
import { GraphProvider } from '@/features/graph/providers/GraphProvider'
import { PreviewDrawer } from '@/features/preview/components/PreviewDrawer'
import { ValidationErrorsDrawer } from '@/features/preview/components/ValidationErrorsDrawer'
import { VariablesDrawer } from '@/features/preview/components/VariablesDrawer'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { useToast } from '@/hooks/useToast'
import { Flex, Spinner, useColorModeValue } from '@chakra-ui/react'
import { PublicTypebotV6, TypebotV6 } from '@typebot.io/schemas'
import { useTranslate } from '@tolgee/react'
import { useEffect, useState } from 'react'
import {
  EditorProvider,
  RightPanel as RightPanelEnum,
  useEditor,
} from '../providers/EditorProvider'
import { useTypebot } from '../providers/TypebotProvider'
import { BlocksSideBar } from './BlocksSideBar'
import { BoardMenuButton } from './BoardMenuButton'
import { GettingStartedModal } from './GettingStartedModal'
import { SuspectedTypebotBanner } from './SuspectedTypebotBanner'
import { TypebotHeader } from './TypebotHeader'
import { TypebotNotFoundPage } from './TypebotNotFoundPage'

export const EditorPage = () => {
  const { typebot, currentUserMode, is404 } = useTypebot()
  const { workspace } = useWorkspace()
  const backgroundImage = useColorModeValue(
    'radial-gradient(#c6d0e1 1px, transparent 0)',
    'radial-gradient(#2f2f39 1px, transparent 0)'
  )
  const bgColor = useColorModeValue('#f4f5f8', 'gray.850')

  const isSuspicious = typebot?.riskLevel === 100 && !workspace?.isVerified

  if (is404) return <TypebotNotFoundPage />
  return (
    <EditorProvider>
      <Seo title={typebot?.name ? `${typebot.name} | Editor` : 'Editor'} />
      <Flex overflow="clip" h="100vh" flexDir="column" id="editor-container">
        <GettingStartedModal />
        {isSuspicious && <SuspectedTypebotBanner typebotId={typebot.id} />}
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
            <GraphProviderWithEditor
              typebot={typebot}
              currentUserMode={currentUserMode}
              isSuspicious={isSuspicious}
            />
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
    case RightPanelEnum.VALIDATION_ERRORS:
      return <ValidationErrorsDrawer onClose={() => setRightPanel(undefined)} />
    case undefined:
      return null
  }
}

const GraphProviderWithEditor = ({
  typebot,
  currentUserMode,
  isSuspicious,
}: {
  typebot: TypebotV6 | PublicTypebotV6
  currentUserMode: string
  isSuspicious: boolean
}) => {
  const { showToast } = useToast()
  const { isUserEditing } = useEditor()
  const { t } = useTranslate()
  const selectedUserMode = isUserEditing ? currentUserMode : 'guest'

  const [, setPreviousIsUserEditing] = useState<boolean>(isUserEditing)

  useEffect(() => {
    setPreviousIsUserEditing((prev) => {
      if (isUserEditing && !prev) {
        showToast({
          title: t('editor.user.editingNowToast'),
          status: 'info',
        })
      }
      return isUserEditing
    })
  }, [isUserEditing, showToast])

  return (
    <GraphDndProvider>
      {selectedUserMode === 'write' && <BlocksSideBar />}
      <GraphProvider
        isReadOnly={selectedUserMode === 'read' || selectedUserMode === 'guest'}
      >
        <EventsCoordinatesProvider events={typebot.events}>
          <Graph flex="1" typebot={typebot} key={typebot.id} />
          <BoardMenuButton
            pos="absolute"
            right="40px"
            top={`calc(20px + ${isSuspicious ? '70px' : '0px'})`}
          />
          <RightPanel />
        </EventsCoordinatesProvider>
      </GraphProvider>
    </GraphDndProvider>
  )
}
