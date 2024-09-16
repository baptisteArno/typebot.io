import { ImageUploadContent } from '@/components/ImageUploadContent'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import {
  Flex,
  Popover,
  PopoverContent,
  Text,
  Image,
  Button,
  Portal,
  PopoverAnchor,
  useDisclosure,
} from '@chakra-ui/react'
import { isNotEmpty } from '@typebot.io/lib'
import { Background } from '@typebot.io/schemas'
import React from 'react'
import { ColorPicker } from '../../../../components/ColorPicker'
import {
  BackgroundType,
  defaultBackgroundColor,
  defaultBackgroundType,
} from '@typebot.io/schemas/features/typebot/theme/constants'
import { useTranslate } from '@tolgee/react'
import { useOutsideClick } from '@/hooks/useOutsideClick'

type BackgroundContentProps = {
  background?: Background
  onBackgroundContentChange: (content: string) => void
}

export const BackgroundContent = ({
  background,
  onBackgroundContentChange,
}: BackgroundContentProps) => {
  const { isOpen, onClose, onOpen } = useDisclosure()
  const { t } = useTranslate()
  const { typebot } = useTypebot()
  const handleContentChange = (content: string) =>
    onBackgroundContentChange(content)
  const popoverContainerRef = React.useRef<HTMLDivElement>(null)

  useOutsideClick({
    ref: popoverContainerRef,
    handler: onClose,
    isEnabled: isOpen,
  })

  if ((background?.type ?? defaultBackgroundType) === BackgroundType.IMAGE) {
    if (!typebot) return null
    return (
      <Flex ref={popoverContainerRef}>
        <Popover isLazy isOpen={isOpen} placement="top">
          <PopoverAnchor>
            {isNotEmpty(background?.content) ? (
              <Image
                src={background?.content}
                alt={t('theme.sideMenu.global.background.image.alt')}
                onClick={onOpen}
                cursor="pointer"
                _hover={{ filter: 'brightness(.9)' }}
                transition="filter 200ms"
                rounded="md"
                w="full"
                maxH="200px"
                objectFit="cover"
              />
            ) : (
              <Button onClick={onOpen} w="full">
                {t('theme.sideMenu.global.background.image.button')}
              </Button>
            )}
          </PopoverAnchor>
          <Portal>
            <PopoverContent
              p="4"
              w="500px"
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <ImageUploadContent
                uploadFileProps={{
                  workspaceId: typebot.workspaceId,
                  typebotId: typebot.id,
                  fileName: 'background',
                }}
                defaultUrl={background?.content}
                onSubmit={handleContentChange}
                excludedTabs={['giphy', 'icon']}
              />
            </PopoverContent>
          </Portal>
        </Popover>
      </Flex>
    )
  }
  if ((background?.type ?? defaultBackgroundType) === BackgroundType.COLOR) {
    return (
      <Flex justify="space-between" align="center">
        <Text>{t('theme.sideMenu.global.background.color')}</Text>
        <ColorPicker
          value={background?.content ?? defaultBackgroundColor}
          onColorChange={handleContentChange}
        />
      </Flex>
    )
  }
  return null
}
