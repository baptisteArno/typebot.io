import { Flex } from '@chakra-ui/layout'
import { Seo } from 'components/Seo'
import {
  EditorContext,
  RightPanel as RightPanelEnum,
  useEditor,
} from 'contexts/EditorContext'
import { useEffect } from 'react'
import { BoardMenuButton } from 'components/editor/BoardMenuButton'
import { PreviewDrawer } from 'components/editor/preview/PreviewDrawer'
import { ToDoList } from 'components/editor/todoList'
import { StepsSideBar } from 'components/editor/StepsSideBar'
import { Graph } from 'components/shared/Graph'
import { GraphProvider } from 'contexts/GraphContext'
import { GraphDndContext } from 'contexts/GraphDndContext'
import { useTypebot } from 'contexts/TypebotContext'
import { GettingStartedModal } from 'components/editor/GettingStartedModal'
import { dequal } from 'dequal'

function TypebotEditPage() {
  const { typebot, isReadOnly, save, currentTypebot, emptyFields } =
    useTypebot()

  useEffect(() => {
    window.addEventListener('message', handleEventListeners)

    return () => window.removeEventListener('message', handleEventListeners)
  }, [typebot])

  useEffect(() => {
    window.parent.postMessage({ name: 'iFrameHasLoaded' }, '*')
  }, [])

  useEffect(() => {
    if (!dequal(typebot?.blocks, currentTypebot?.blocks)) {
      window.parent.postMessage({ name: 'hasUnsavedChanges' }, '*')
    }

    const groupsWithoutConnection = typebot?.blocks?.filter(
      (block) => !block.hasConnection
    )

    const hasGroupsWithoutConnection = !!groupsWithoutConnection?.length

    window.parent.postMessage(
      {
        name: 'groupsWithoutConnection',
        hasGroupsWithoutConnection,
        quantity: groupsWithoutConnection?.length,
      },
      '*'
    )
  }, [typebot?.blocks])

  useEffect(() => {
    window.parent.postMessage(
      {
        name: 'emptyFields',
        fields: emptyFields,
      },
      '*'
    )
  }, [emptyFields])

  const handleEventListeners = (e: any): void => {
    if (e.data === 'backOrExitClick') {
      const hasUnsavedChanges = dequal(typebot?.blocks, currentTypebot?.blocks)

      if (!hasUnsavedChanges) {
        const botEditedMessage = Object.assign({
          name: 'botEditedCannotSave',
        })

        window.parent.postMessage(botEditedMessage, '*')
      } else {
        const canGoBack = Object.assign({
          name: 'canGoBack',
        })

        window.parent.postMessage(canGoBack, '*')
      }
    }

    if (e.data.name === 'saveClick') {
      save(e.data.personaName, e.data.personaThumbUrl).then((res) => {
        if (res.saved) {
          const data = Object.assign({
            name: 'successSave',
          })

          window.parent.postMessage(data, '*')
        } else {
          const data = Object.assign({
            name: 'failedToSave',
          })

          window.parent.postMessage(data, '*')
        }
      })
    }
  }

  return !typebot ? (
    <></>
  ) : (
    <>
      <EditorContext>
        <Seo title="Editor" />
        <Flex overflow="clip" h="100vh" flexDir="column" id="editor-container">
          <GettingStartedModal />

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
    </>
  )
}

const RightPanel = () => {
  const { rightPanel, setRightPanel } = useEditor()

  const { typebot } = useTypebot()

  useEffect(() => {
    window.addEventListener('message', handleEventListeners)

    return () => window.removeEventListener('message', handleEventListeners)
  }, [typebot])

  const handleEventListeners = (e: any): void => {
    if (e.data === 'openToDoList') {
      setRightPanel(RightPanelEnum.TODOLIST)
    }
  }

  if (rightPanel === RightPanelEnum.PREVIEW) {
    return <PreviewDrawer />
  }

  if (rightPanel === RightPanelEnum.TODOLIST) {
    return <ToDoList />
  }

  return <></>
}

export default TypebotEditPage
