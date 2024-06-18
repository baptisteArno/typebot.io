import { WebhookIcon } from '@/components/icons'
import { useUser } from '@/features/account/hooks/useUser'
import { useEditor } from '@/features/editor/providers/EditorProvider'
import { useSniper } from '@/features/editor/providers/SniperProvider'
import { useGraph } from '@/features/graph/providers/GraphProvider'
import { useToast } from '@/hooks/useToast'
import { Standard } from '@sniper.io/nextjs'
import { ContinueChatResponse } from '@sniper.io/schemas'

export const WebPreview = () => {
  const { user } = useUser()
  const { sniper } = useSniper()
  const { startPreviewAtGroup, startPreviewAtEvent } = useEditor()
  const { setPreviewingBlock } = useGraph()

  const { showToast } = useToast()

  const handleNewLogs = (logs: ContinueChatResponse['logs']) => {
    logs?.forEach((log) => {
      showToast({
        icon: <WebhookIcon />,
        status: log.status as 'success' | 'error' | 'info',
        title: log.status === 'error' ? 'An error occured' : undefined,
        description: log.description,
        details: log.details
          ? {
              lang: 'json',
              content:
                typeof log.details === 'string'
                  ? log.details
                  : JSON.stringify(log.details, null, 2),
            }
          : undefined,
      })
      if (log.status === 'error') console.error(log)
    })
  }

  if (!sniper) return null

  return (
    <Standard
      key={`web-preview${startPreviewAtGroup ?? ''}`}
      sniper={sniper}
      sessionId={user ? `${sniper.id}-${user.id}` : undefined}
      startFrom={
        startPreviewAtGroup
          ? { type: 'group', groupId: startPreviewAtGroup }
          : startPreviewAtEvent
          ? { type: 'event', eventId: startPreviewAtEvent }
          : undefined
      }
      onNewInputBlock={(block) =>
        setPreviewingBlock({
          id: block.id,
          groupId:
            sniper.groups.find((g) => g.blocks.some((b) => b.id === block.id))
              ?.id ?? '',
        })
      }
      onNewLogs={handleNewLogs}
      style={{
        borderWidth: '1px',
        borderRadius: '0.25rem',
      }}
    />
  )
}
