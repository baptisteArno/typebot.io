import { useSniper } from '@/features/editor/providers/SniperProvider'
import { useUser } from '@/features/account/hooks/useUser'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import React, { useEffect, useState } from 'react'
import { Bubble, BubbleProps } from '@sniper.io/nextjs'
import { planToReadable } from '@/features/billing/helpers/planToReadable'
import { Plan } from '@sniper.io/prisma'

export const SupportBubble = (props: Omit<BubbleProps, 'sniper'>) => {
  const { sniper } = useSniper()
  const { user } = useUser()
  const { workspace } = useWorkspace()

  const [lastViewedSniperId, setLastViewedSniperId] = useState(sniper?.id)

  useEffect(() => {
    if (!sniper?.id) return
    if (lastViewedSniperId === sniper?.id) return
    setLastViewedSniperId(sniper?.id)
  }, [lastViewedSniperId, sniper?.id])

  if (!workspace?.plan || workspace.plan === Plan.FREE) return null

  return (
    <Bubble
      sniper="sniper-support"
      prefilledVariables={{
        'User ID': user?.id,
        'First name': user?.name?.split(' ')[0] ?? undefined,
        Email: user?.email ?? undefined,
        'Sniper ID': lastViewedSniperId,
        'Avatar URL': user?.image ?? undefined,
        Plan: planToReadable(workspace?.plan),
      }}
      theme={{
        chatWindow: {
          backgroundColor: '#fff',
        },
      }}
      {...props}
    />
  )
}
