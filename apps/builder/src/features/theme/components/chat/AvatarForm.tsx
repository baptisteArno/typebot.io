import React from 'react'
import { AvatarProps } from '@typebot.io/schemas'
import {
  Heading,
  HStack,
  Popover,
  PopoverContent,
  Stack,
  Switch,
  Image,
  Flex,
  Box,
  Portal,
  PopoverAnchor,
  useDisclosure,
} from '@chakra-ui/react'
import { ImageUploadContent } from '@/components/ImageUploadContent'
import { DefaultAvatar } from '../DefaultAvatar'
import { useOutsideClick } from '@/hooks/useOutsideClick'

type Props = {
  uploadFilePath: string
  title: string
  avatarProps?: AvatarProps
  isDefaultCheck?: boolean
  onAvatarChange: (avatarProps: AvatarProps) => void
}

export const AvatarForm = ({
  uploadFilePath,
  title,
  avatarProps,
  isDefaultCheck = false,
  onAvatarChange,
}: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const isChecked = avatarProps ? avatarProps.isEnabled : isDefaultCheck
  const handleOnCheck = () =>
    onAvatarChange({ ...avatarProps, isEnabled: !isChecked })
  const handleImageUrl = (url: string) =>
    onAvatarChange({ isEnabled: isChecked, url })
  const popoverContainerRef = React.useRef<HTMLDivElement>(null)

  useOutsideClick({
    ref: popoverContainerRef,
    handler: onClose,
    isEnabled: isOpen,
  })

  const isDefaultAvatar = !avatarProps?.url || avatarProps.url.includes('{{')
  return (
    <Stack borderWidth={1} rounded="md" p="4" spacing={4}>
      <Flex justifyContent="space-between">
        <HStack>
          <Heading as="label" fontSize="lg" htmlFor={title} mb="1">
            {title}
          </Heading>
          <Switch isChecked={isChecked} id={title} onChange={handleOnCheck} />
        </HStack>
        {isChecked && (
          <Flex ref={popoverContainerRef}>
            <Popover isLazy isOpen={isOpen}>
              <PopoverAnchor>
                {isDefaultAvatar ? (
                  <Box onClick={onOpen}>
                    <DefaultAvatar
                      cursor="pointer"
                      _hover={{ filter: 'brightness(.9)' }}
                    />
                  </Box>
                ) : (
                  <Image
                    onClick={onOpen}
                    src={avatarProps.url}
                    alt="Website image"
                    cursor="pointer"
                    _hover={{ filter: 'brightness(.9)' }}
                    transition="filter 200ms"
                    rounded="full"
                    boxSize="40px"
                    objectFit="cover"
                  />
                )}
              </PopoverAnchor>
              <Portal>
                <PopoverContent
                  p="4"
                  onMouseDown={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <ImageUploadContent
                    filePath={uploadFilePath}
                    defaultUrl={avatarProps?.url}
                    imageSize="thumb"
                    onSubmit={handleImageUrl}
                  />
                </PopoverContent>
              </Portal>
            </Popover>
          </Flex>
        )}
      </Flex>
    </Stack>
  )
}
