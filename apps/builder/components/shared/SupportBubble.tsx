import { useTypebot } from 'contexts/TypebotContext'
import { useUser } from 'contexts/UserContext'
import { Plan } from 'db'
import React, { useEffect } from 'react'
import { initBubble } from 'typebot-js'

export const SupportBubble = () => {
  const { typebot } = useTypebot()
  const { user } = useUser()

  useEffect(() => {
    initBubble({
      publishId: 'typebot-support',
      viewerHost: process.env.NEXT_PUBLIC_VIEWER_HOST,
      backgroundColor: '#ffffff',
      button: { color: '#0042DA' },
      hiddenVariables: {
        'User ID': user?.id,
        Name: user?.name ?? undefined,
        Email: user?.email ?? undefined,
        'Typebot ID': typebot?.id,
        'Avatar URL': user?.image ?? undefined,
        Plan: planToReadable(user?.plan),
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, typebot])

  return <></>
}

const planToReadable = (plan?: Plan) => {
  if (!plan) return
  switch (plan) {
    case 'FREE':
      return 'Free'
    case 'LIFETIME':
      return 'Lifetime'
    case 'OFFERED':
      return 'Offered'
    case 'PRO':
      return 'Pro'
  }
}
