import { Button, ButtonProps, Text, VStack } from '@chakra-ui/react'
import { PlusIcon } from '@/components/icons'
import { useRouter } from 'next/router'
import { stringify } from 'qs'
import React from 'react'
import { useTranslate } from '@tolgee/react'
import { useSniperDnd } from '../SniperDndProvider'
import { useSniperDnd } from '../SniperDndProvider'

export const CreateBotButton = ({
  folderId,
  ...props
}: { folderId?: string } & ButtonProps) => {
  const { t } = useTranslate()
  const router = useRouter()
  const { draggedSniper } = useSniperDnd()
  const { draggedSniper } = useSniperDnd()

  const handleClick = () =>
    router.push(
      `/snipers/create?${stringify({
        folderId,
      })}`
    )

  return (
    <Button
      style={{ width: '225px', height: '270px' }}
      onClick={handleClick}
      paddingX={6}
      whiteSpace={'normal'}
      colorScheme="blue"
      opacity={draggedSniper ? 0.3 : 1}
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
          {t('folders.createSniperButton.label')}
        </Text>
      </VStack>
    </Button>
  )
}
