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
} from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { WorkspaceRole } from "@typebot.io/prisma/enum";
import React from "react";
import { convertWorkspaceRoleToReadable } from "./AddMemberForm";

type Props = {
  image?: string;
  name?: string;
  email: string;
  role: WorkspaceRole;
  isGuest?: boolean;
  isMe?: boolean;
  canEdit: boolean;
  onDeleteClick: () => void;
  onSelectNewRole: (role: WorkspaceRole) => void;
};

export const MemberItem = ({
  email,
  name,
  image,
  role,
  isGuest = false,
  isMe = false,
  canEdit,
  onDeleteClick,
  onSelectNewRole,
}: Props) => {
  const { t } = useTranslate();
  const handleAdminClick = () => onSelectNewRole(WorkspaceRole.ADMIN);
  const handleMemberClick = () => onSelectNewRole(WorkspaceRole.MEMBER);

  return (
    <Menu placement="bottom-end" isLazy>
      <MenuButton
        _hover={{
          bg: useColorModeValue("gray.100", "gray.700"),
        }}
        borderRadius="md"
      >
        <MemberIdentityContent
          email={email}
          name={name}
          image={image}
          isGuest={isGuest}
          tag={convertWorkspaceRoleToReadable(role)}
        />
      </MenuButton>
      {!isMe && canEdit && (
        <MenuList shadow="lg">
          <MenuItem onClick={handleAdminClick}>
            {convertWorkspaceRoleToReadable(WorkspaceRole.ADMIN)}
          </MenuItem>
          <MenuItem onClick={handleMemberClick}>
            {convertWorkspaceRoleToReadable(WorkspaceRole.MEMBER)}
          </MenuItem>
          <MenuItem color="red.500" onClick={onDeleteClick}>
            {t("remove")}
          </MenuItem>
        </MenuList>
      )}
    </Menu>
  );
};

export const MemberIdentityContent = ({
  name,
  tag,
  isGuest = false,
  image,
  email,
}: {
  name?: string;
  tag?: string;
  image?: string;
  isGuest?: boolean;
  email: string;
}) => {
  const { t } = useTranslate();

  return (
    <HStack justifyContent="space-between" maxW="full" p="2">
      <HStack minW={0} spacing="4">
        <Avatar name={name} src={image} size="sm" />
        <Stack spacing={0} minW="0">
          {name && (
            <Text textAlign="left" fontSize="15px">
              {name}
            </Text>
          )}
          <Text
            color="gray.500"
            fontSize={name ? "14px" : "inherit"}
            noOfLines={1}
          >
            {email}
          </Text>
        </Stack>
      </HStack>
      <HStack flexShrink={0}>
        {isGuest && (
          <Tag color="gray.400" data-testid="tag">
            {t("pending")}
          </Tag>
        )}
        <Tag data-testid="tag">{tag}</Tag>
      </HStack>
    </HStack>
  );
};
