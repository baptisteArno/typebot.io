import { ImageUploadContent } from '@/components/ImageUploadContent'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import {
  Flex,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Text,
  Image,
  Button,
  Portal,
} from '@chakra-ui/react'
import { isNotEmpty } from '@typebot.io/lib'
import { Background } from '@typebot.io/schemas'
import React from 'react'
import { ColorPicker } from '../../../../components/ColorPicker'
import {
  BackgroundType,
  defaultTheme,
} from '@typebot.io/schemas/features/typebot/theme/constants'
import { useTranslate } from '@tolgee/react'

type BackgroundContentProps = {
  background?: Background
  onBackgroundContentChange: (content: string) => void
}

export const BackgroundContent = ({
  background,
  onBackgroundContentChange,
}: BackgroundContentProps) => {
  const { t } = useTranslate()
  const { typebot } = useTypebot()
  const handleContentChange = (content: string) =>
    onBackgroundContentChange(content)

  switch (background?.type) {
    case BackgroundType.COLOR:
      return (
        <Flex justify="space-between" align="center">
          <Text>{t('theme.sideMenu.global.background.color')}</Text>
          <ColorPicker
            value={
              background.content ?? defaultTheme.general.background.content
            }
            onColorChange={handleContentChange}
          />
        </Flex>
      )
    case BackgroundType.IMAGE:
      if (!typebot) return null
      return (
        <Popover isLazy placement="top">
          <PopoverTrigger>
            {isNotEmpty(background.content) ? (
              <Image
                src={background.content}
                alt={t('theme.sideMenu.global.background.image.alt')}
                cursor="pointer"
                _hover={{ filter: 'brightness(.9)' }}
                transition="filter 200ms"
                rounded="md"
                maxH="200px"
                objectFit="cover"
              />
            ) : (
              <Button>
                {t('theme.sideMenu.global.background.image.button')}
              </Button>
            )}
          </PopoverTrigger>
          <Portal>
            <PopoverContent p="4" w="500px">
              <ImageUploadContent
                uploadFileProps={{
                  workspaceId: typebot.workspaceId,
                  typebotId: typebot.id,
                  fileName: 'background',
                }}
                defaultUrl={background.content}
                onSubmit={handleContentChange}
                excludedTabs={['giphy', 'icon']}
              />
            </PopoverContent>
          </Portal>
        </Popover>
      )
  }
}
