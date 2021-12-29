import { Button, useToast } from '@chakra-ui/react'
import { useUser } from 'contexts/UserContext'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { createTypebot } from 'services/typebots'

export const TemplatesContent = () => {
  const { user } = useUser()
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)

  const toast = useToast({
    position: 'top-right',
    status: 'error',
    title: 'An error occured',
  })

  const handleCreateSubmit = async () => {
    if (!user) return
    setIsLoading(true)
    const { error, data } = await createTypebot({
      folderId: router.query.folderId?.toString() ?? null,
    })
    if (error) toast({ description: error.message })
    if (data) router.push(`/typebots/${data.id}/edit`)
    setIsLoading(false)
  }

  return (
    <Button ml={4} onClick={handleCreateSubmit} isLoading={isLoading}>
      Start from scratch
    </Button>
  )
}
