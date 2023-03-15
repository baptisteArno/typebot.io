import {
  HStack,
  Input,
  Button,
  Menu,
  MenuButton,
  MenuList,
  Stack,
  MenuItem,
} from '@chakra-ui/react'
import { ChevronLeftIcon } from '@/components/icons'
import { WorkspaceInvitation, WorkspaceRole } from '@typebot.io/prisma'
import { FormEvent, useState } from 'react'
import { Member } from '../types'
import { sendInvitationQuery } from '../queries/sendInvitationQuery'

type Props = {
  workspaceId: string
  onNewMember: (member: Member) => void
  onNewInvitation: (invitation: WorkspaceInvitation) => void
  isLoading: boolean
  isLocked: boolean
}
export const AddMemberForm = ({
  workspaceId,
  onNewMember,
  onNewInvitation,
  isLoading,
  isLocked,
}: Props) => {
  const [invitationEmail, setInvitationEmail] = useState('')
  const [invitationRole, setInvitationRole] = useState<WorkspaceRole>(
    WorkspaceRole.MEMBER
  )

  const [isSendingInvitation, setIsSendingInvitation] = useState(false)

  const handleInvitationSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSendingInvitation(true)
    const { data } = await sendInvitationQuery({
      email: invitationEmail,
      type: invitationRole,
      workspaceId,
    })
    if (data?.member) onNewMember(data.member)
    if (data?.invitation) onNewInvitation(data.invitation)
    setInvitationEmail('')
    setIsSendingInvitation(false)
  }

  return (
    <HStack as="form" onSubmit={handleInvitationSubmit}>
      <Input
        placeholder="colleague@company.com"
        name="inviteEmail"
        value={invitationEmail}
        onChange={(e) => setInvitationEmail(e.target.value)}
        rounded="md"
        isDisabled={isLocked}
      />

      {!isLocked && (
        <WorkspaceRoleMenuButton
          role={invitationRole}
          onChange={setInvitationRole}
        />
      )}
      <Button
        colorScheme={'blue'}
        isLoading={isSendingInvitation}
        flexShrink={0}
        type="submit"
        isDisabled={isLoading || isLocked}
      >
        Invite
      </Button>
    </HStack>
  )
}

const WorkspaceRoleMenuButton = ({
  role,
  onChange,
}: {
  role: WorkspaceRole
  onChange: (role: WorkspaceRole) => void
}) => {
  return (
    <Menu placement="bottom-end" isLazy matchWidth>
      <MenuButton
        flexShrink={0}
        as={Button}
        rightIcon={<ChevronLeftIcon transform={'rotate(-90deg)'} />}
      >
        {convertWorkspaceRoleToReadable(role)}
      </MenuButton>
      <MenuList minW={0}>
        <Stack maxH={'35vh'} overflowY="scroll" spacing="0">
          <MenuItem onClick={() => onChange(WorkspaceRole.ADMIN)}>
            {convertWorkspaceRoleToReadable(WorkspaceRole.ADMIN)}
          </MenuItem>
          <MenuItem onClick={() => onChange(WorkspaceRole.MEMBER)}>
            {convertWorkspaceRoleToReadable(WorkspaceRole.MEMBER)}
          </MenuItem>
        </Stack>
      </MenuList>
    </Menu>
  )
}

export const convertWorkspaceRoleToReadable = (role: WorkspaceRole): string => {
  switch (role) {
    case WorkspaceRole.ADMIN:
      return 'Admin'
    case WorkspaceRole.MEMBER:
      return 'Member'
    case WorkspaceRole.GUEST:
      return 'Guest'
  }
}
