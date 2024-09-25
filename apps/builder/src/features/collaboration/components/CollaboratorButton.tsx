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
import { CollaborationType } from "@typebot.io/prisma/enum";
import React from "react";
import { ReadableCollaborationType } from "./ReadableCollaborationType";

type Props = {
  image?: string;
  name?: string;
  email: string;
  type: CollaborationType;
  isGuest?: boolean;
  isOwner: boolean;
  onDeleteClick: () => void;
  onChangeCollaborationType: (type: CollaborationType) => void;
};

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
  const { t } = useTranslate();
  const hoverBgColor = useColorModeValue("gray.100", "gray.700");
  const handleEditClick = () =>
    onChangeCollaborationType(CollaborationType.WRITE);
  const handleViewClick = () =>
    onChangeCollaborationType(CollaborationType.READ);
  return (
    <Menu placement="bottom-end">
      <MenuButton _hover={{ backgroundColor: hoverBgColor }} borderRadius="md">
        <CollaboratorIdentityContent
          email={email}
          name={name}
          image={image}
          isGuest={isGuest}
          type={type}
        />
      </MenuButton>
      {isOwner && (
        <MenuList shadow="lg">
          <MenuItem onClick={handleEditClick}>
            <ReadableCollaborationType type={CollaborationType.WRITE} />
          </MenuItem>
          <MenuItem onClick={handleViewClick}>
            <ReadableCollaborationType type={CollaborationType.READ} />
          </MenuItem>
          <MenuItem color="red.500" onClick={onDeleteClick}>
            {t("remove")}
          </MenuItem>
        </MenuList>
      )}
    </Menu>
  );
};

export const CollaboratorIdentityContent = ({
  name,
  type,
  isGuest = false,
  image,
  email,
}: {
  name?: string;
  type: CollaborationType;
  image?: string;
  isGuest?: boolean;
  email: string;
}) => {
  const { t } = useTranslate();

  return (
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
            fontSize={name ? "14px" : "inherit"}
            noOfLines={1}
          >
            {email}
          </Text>
        </Stack>
      </HStack>
      <HStack flexShrink={0}>
        {isGuest && <Tag color="gray.400">{t("pending")}</Tag>}
        <Tag>
          <ReadableCollaborationType type={type} />
        </Tag>
      </HStack>
    </HStack>
  );
};
