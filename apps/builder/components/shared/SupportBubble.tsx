import { useTypebot } from 'contexts/TypebotContext'
import { useUser } from 'contexts/UserContext'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { initBubble } from 'typebot-js'

export const SupportBubble = () => {
  const { typebot } = useTypebot()
  const { user } = useUser()
  const router = useRouter()

  useEffect(() => {
    initBubble({
      publishId: 'typebot-support',
      viewerHost: process.env.NEXT_PUBLIC_VIEWER_HOST,
      backgroundColor: '#ffffff',
      button: { color: '#0042DA' },
      hiddenVariables: {
        'Current URL': window.location.href,
        'User ID': user?.id,
        Email: user?.email ?? undefined,
        'Typebot ID': typebot?.id,
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  return <></>
}
