import {
  Avatar,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Tag,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import { CollaborationType } from '@typebot.io/prisma'
import React from 'react'
import { convertCollaborationTypeEnumToReadable } from './CollaborationList'

type Props = {
  image?: string
  name?: string
  email: string
  type: CollaborationType
  isGuest?: boolean
  isOwner: boolean
  onDeleteClick: () => void
  onChangeCollaborationType: (type: CollaborationType) => void
}

export const CollaboratorItem = ({
  email,
  name,
  image,
  type,
  isGuest = false,
  isOwner,
  onDeleteClick,
  onChangeCollaborationType,
}: Props) => {
  const hoverBgColor = useColorModeValue('gray.100', 'gray.700')
  const handleEditClick = () =>
    onChangeCollaborationType(CollaborationType.WRITE)
  const handleViewClick = () =>
    onChangeCollaborationType(CollaborationType.READ)
  return (
    <Menu placement="bottom-end">
      <MenuButton _hover={{ backgroundColor: hoverBgColor }} borderRadius="md">
        <CollaboratorIdentityContent
          email={email}
          name={name}
          image={image}
          isGuest={isGuest}
          tag={convertCollaborationTypeEnumToReadable(type)}
        />
      </MenuButton>
      {isOwner && (
        <MenuList shadow="lg">
          <MenuItem onClick={handleEditClick}>
            {convertCollaborationTypeEnumToReadable(CollaborationType.WRITE)}
          </MenuItem>
          <MenuItem onClick={handleViewClick}>
            {convertCollaborationTypeEnumToReadable(CollaborationType.READ)}
          </MenuItem>
          <MenuItem color="red.500" onClick={onDeleteClick}>
            Remove
          </MenuItem>
        </MenuList>
      )}
    </Menu>
  )
}

export const CollaboratorIdentityContent = ({
  name,
  tag,
  isGuest = false,
  image,
  email,
}: {
  name?: string
  tag?: string
  image?: string
  isGuest?: boolean
  email: string
}) => (
  <HStack justifyContent="space-between" maxW="full" py="2" px="4">
    <HStack minW={0} spacing={3}>
      <Avatar name={name} src={image} size="sm" />
      <Stack spacing={0} minW="0">
        {name && (
          <Text textAlign="left" fontSize="15px">
            {name}
          </Text>
        )}
        <Text
          color="gray.500"
          fontSize={name ? '14px' : 'inherit'}
          noOfLines={1}
        >
          {email}
        </Text>
      </Stack>
    </HStack>
    <HStack flexShrink={0}>
      {isGuest && <Tag color="gray.400">Pending</Tag>}
      <Tag>{tag}</Tag>
    </HStack>
  </HStack>
)
