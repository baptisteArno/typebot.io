import React from 'react'
import { AvatarProps } from 'models'
import {
  Heading,
  HStack,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Stack,
  Switch,
  Image,
  Flex,
  Box,
  Portal,
} from '@chakra-ui/react'
import { ImageUploadContent } from '@/components/ImageUploadContent'
import { DefaultAvatar } from '../DefaultAvatar'

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
  const isChecked = avatarProps ? avatarProps.isEnabled : isDefaultCheck
  const handleOnCheck = () =>
    onAvatarChange({ ...avatarProps, isEnabled: !isChecked })
  const handleImageUrl = (url: string) =>
    onAvatarChange({ isEnabled: isChecked, url })

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
          <Popover isLazy>
            <PopoverTrigger>
              {isDefaultAvatar ? (
                <Box>
                  <DefaultAvatar
                    cursor="pointer"
                    _hover={{ filter: 'brightness(.9)' }}
                  />
                </Box>
              ) : (
                <Image
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
            </PopoverTrigger>
            <Portal>
              <PopoverContent p="4">
                <ImageUploadContent
                  filePath={uploadFilePath}
                  defaultUrl={avatarProps?.url}
                  onSubmit={handleImageUrl}
                />
              </PopoverContent>
            </Portal>
          </Popover>
        )}
      </Flex>
    </Stack>
  )
}
