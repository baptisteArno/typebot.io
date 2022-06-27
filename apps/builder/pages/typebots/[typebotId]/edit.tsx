import { Flex } from '@chakra-ui/layout'
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
import { StepsSideBar } from 'components/editor/StepsSideBar'
import { Graph } from 'components/shared/Graph'
import { GraphProvider } from 'contexts/GraphContext'
import { GraphDndContext } from 'contexts/GraphDndContext'
import { useTypebot } from 'contexts/TypebotContext'
import { GettingStartedModal } from 'components/editor/GettingStartedModal'

import Storage from '@octadesk-tech/storage'

function TypebotEditPage({ userToken }: { userToken: string }) {
  const { typebot, isReadOnly } = useTypebot()

  console.log('token: ' + userToken)

  return (
    <EditorContext>
      <Seo title="Editor" />
      <KBar />
      <Flex overflow="clip" h="100vh" flexDir="column" id="editor-container">
        <GettingStartedModal />
        {/* <TypebotHeader /> */}
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
            <GraphProvider
              blocks={typebot?.blocks ?? []}
              isReadOnly={isReadOnly}
            >
              {typebot && <Graph flex="1" typebot={typebot} />}
              <BoardMenuButton pos="absolute" right="40px" top="20px" />
              <RightPanel />
            </GraphProvider>
          </GraphDndContext>
        </Flex>
      </Flex>
    </EditorContext>
  )
}

const RightPanel = () => {
  const { rightPanel } = useEditor()
  return rightPanel === RightPanelEnum.PREVIEW ? <PreviewDrawer /> : <></>
}

export async function getServerSideProps() {
  const userToken = Storage.getItem('userToken')
  console.log('token1: ' + userToken)
  console.log('getServerSideProps edit.tsx')

  return { props: { userToken, test: 'cordeiro' } }
}

export default TypebotEditPage
