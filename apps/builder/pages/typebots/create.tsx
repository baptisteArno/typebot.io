import React, { useState } from 'react'
import { Button, Stack, useToast } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { Seo } from 'components/Seo'
import { DashboardHeader } from 'components/dashboard/DashboardHeader'
import { createTypebot } from 'services/typebots'
import { UserContext, useUser } from 'contexts/UserContext'

const TemplatesPage = () => {
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
    <UserContext>
      <Seo title="Templates" />
      <Stack>
        <DashboardHeader />
        <Button
          ml={4}
          onClick={() => handleCreateSubmit()}
          isLoading={isLoading}
        >
          Start from scratch
        </Button>
      </Stack>
    </UserContext>
  )
}

export default TemplatesPage
