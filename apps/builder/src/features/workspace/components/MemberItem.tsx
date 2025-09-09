import { Avatar, HStack, Stack, Tag, Text } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { WorkspaceRole } from "@typebot.io/prisma/enum";
import { Menu } from "@typebot.io/ui/components/Menu";
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
    <Menu.Root>
      <Menu.Trigger className="hover:bg-gray-2 rounded-md transition-colors">
        <MemberIdentityContent
          email={email}
          name={name}
          image={image}
          isGuest={isGuest}
          tag={convertWorkspaceRoleToReadable(role)}
        />
      </Menu.Trigger>
      {!isMe && canEdit && (
        <Menu.Popup>
          <Menu.Item onClick={handleAdminClick}>
            {convertWorkspaceRoleToReadable(WorkspaceRole.ADMIN)}
          </Menu.Item>
          <Menu.Item onClick={handleMemberClick}>
            {convertWorkspaceRoleToReadable(WorkspaceRole.MEMBER)}
          </Menu.Item>
          <Menu.Item className="text-red-10" onClick={onDeleteClick}>
            {t("remove")}
          </Menu.Item>
        </Menu.Popup>
      )}
    </Menu.Root>
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
