import { Button, ButtonProps, Text, VStack } from '@chakra-ui/react'
import { PlusIcon } from '@/components/icons'
import { useRouter } from 'next/router'
import { stringify } from 'qs'
import React, { useState } from 'react'
import { useTranslate } from '@tolgee/react'
import {useWorkspace} from "@/features/workspace/WorkspaceProvider";
import {Typebot} from "@typebot.io/schemas";
import {useUser} from "@/features/account/hooks/useUser";
import {trpc} from "@/lib/trpc";
import {useToast} from "@/hooks/useToast";

export const CreateBotButton = ({
  folderId,
  isFirstBot,
  ...props
}: { folderId?: string; isFirstBot: boolean } & ButtonProps) => {
  const { t } = useTranslate()
  const router = useRouter()
  const { workspace } = useWorkspace()
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const { showToast } = useToast()

  const { mutate: createTypebot } = trpc.typebot.createTypebot.useMutation({
    onMutate: () => {
      setIsLoading(true)
    },
    onError: (error) => {
      showToast({
        title: 'Failed to create bot',
        description: error.message,
      })
    },
    onSuccess: (data) => {
      router.push({
        pathname: `/typebots/${data.typebot.id}/edit`,
        query:
            router.query.isFirstBot === 'true'
                ? {
                  isFirstBot: 'true',
                }
                : {},
      })
    },
    onSettled: () => {
      setIsLoading(false)
    },
  })

  const handleClick = () =>
    router.push(
      `/typebots/create?${stringify({
        isFirstBot: !isFirstBot ? undefined : isFirstBot,
        folderId,
      })}`
    )

  const handleCreateSubmit = async (typebot?: Typebot) => {
    if (!user || !workspace) return
    const folderId = router.query.folderId?.toString() ?? null
    console.log('piceee')

    createTypebot({
      workspaceId: workspace.id,
      typebot: {
        name: t('typebots.defaultName'),
        folderId,
      },
    })
  }

  return (
    <Button
      style={{ width: '225px', height: '270px' }}
      onClick={handleCreateSubmit}
      isLoading={isLoading}
      paddingX={6}
      whiteSpace={'normal'}
      colorScheme="blue"
      {...props}
    >
      <VStack spacing="6">
        <PlusIcon fontSize="40px" />
        <Text
          fontSize={18}
          fontWeight="medium"
          maxW={40}
          textAlign="center"
          mt="6"
        >
          {t('folders.createTypebotButton.label')}
        </Text>
      </VStack>
    </Button>
  )
}
