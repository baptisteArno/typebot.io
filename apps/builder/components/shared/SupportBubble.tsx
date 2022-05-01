import { useTypebot } from 'contexts/TypebotContext'
import { useUser } from 'contexts/UserContext'
import { Plan } from 'db'
import React, { useEffect, useState } from 'react'
import { isCloudProdInstance } from 'services/utils'
import { initBubble } from 'typebot-js'

export const SupportBubble = () => {
  const { typebot } = useTypebot()
  const { user } = useUser()
  const [localTypebotId, setLocalTypebotId] = useState(typebot?.id)
  const [localUserId, setLocalUserId] = useState(user?.id)

  useEffect(() => {
    if (
      isCloudProdInstance() &&
      (localTypebotId !== typebot?.id || localUserId !== user?.id)
    ) {
      setLocalTypebotId(typebot?.id)
      setLocalUserId(user?.id)
      initBubble({
        url: `${
          process.env.NEXT_PUBLIC_VIEWER_INTERNAL_URL ??
          process.env.NEXT_PUBLIC_VIEWER_URL
        }/typebot-support`,
        backgroundColor: '#ffffff',
        button: {
          color: '#0042DA',
        },
        hiddenVariables: {
          'User ID': user?.id,
          'First name': user?.name?.split(' ')[0] ?? undefined,
          Email: user?.email ?? undefined,
          'Typebot ID': typebot?.id,
          'Avatar URL': user?.image ?? undefined,
          Plan: planToReadable(user?.plan),
        },
      })
    }
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
