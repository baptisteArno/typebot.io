import { useEditor } from '@/features/editor/providers/EditorProvider'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { useGraph } from '@/features/graph/providers/GraphProvider'
import { useToast } from '@/hooks/useToast'
import { UseToastOptions } from '@chakra-ui/react'
import { Standard } from '@typebot.io/react'
import { ChatReply } from '@typebot.io/schemas'

export const WebPreview = () => {
  const { typebot } = useTypebot()
  const { startPreviewAtGroup } = useEditor()
  const { setPreviewingBlock } = useGraph()

  const { showToast } = useToast()

  const handleNewLogs = (logs: ChatReply['logs']) => {
    logs?.forEach((log) => {
      showToast(log as UseToastOptions)
      console.error(log)
    })
  }

  if (!typebot) return null

  return (
    <Standard
      key={`web-preview${startPreviewAtGroup ?? ''}`}
      typebot={typebot}
      startGroupId={startPreviewAtGroup}
      onNewInputBlock={setPreviewingBlock}
      onNewLogs={handleNewLogs}
      style={{
        borderWidth: '1px',
        borderRadius: '0.25rem',
      }}
    />
  )
}
