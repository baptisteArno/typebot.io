import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { initBubble } from 'typebot-js'

export const SupportBubble = () => {
  const router = useRouter()

  useEffect(() => {
    initBubble({
      publishId: 'typebot-support',
      viewerHost: process.env.NEXT_PUBLIC_VIEWER_HOST,
      backgroundColor: '#ffffff',
      button: { color: '#0042DA' },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  return <></>
}
