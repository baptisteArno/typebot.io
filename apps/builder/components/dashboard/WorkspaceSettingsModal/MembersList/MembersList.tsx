import {
  Heading,
  HStack,
  SkeletonCircle,
  SkeletonText,
  Stack,
} from '@chakra-ui/react'
import { UnlockPlanInfo } from 'components/shared/Info'
import { useUser } from 'contexts/UserContext'
import { useWorkspace } from 'contexts/WorkspaceContext'
import { WorkspaceInvitation, WorkspaceRole } from 'db'
import React from 'react'
import {
  deleteInvitation,
  deleteMember,
  Member,
  updateInvitation,
  updateMember,
  useMembers,
} from 'services/workspace'
import { getSeatsLimit } from 'utils'
import { AddMemberForm } from './AddMemberForm'
import { checkCanInviteMember } from './helpers'
import { MemberItem } from './MemberItem'

export const MembersList = () => {
  const { user } = useUser()
  const { workspace, canEdit } = useWorkspace()
  const { members, invitations, isLoading, mutate } = useMembers({
    workspaceId: workspace?.id,
  })

  const handleDeleteMemberClick = (memberId: string) => async () => {
    if (!workspace) return
    await deleteMember(workspace.id, memberId)
    mutate({
      members: members.filter((m) => m.userId !== memberId),
      invitations,
    })
  }

  const handleSelectNewRole =
    (memberId: string) => async (role: WorkspaceRole) => {
      if (!workspace) return
      await updateMember(workspace.id, { userId: memberId, role })
      mutate({
        members: members.map((m) =>
          m.userId === memberId ? { ...m, role } : m
        ),
        invitations,
      })
    }

  const handleDeleteInvitationClick = (id: string) => async () => {
    if (!workspace) return
    await deleteInvitation({ workspaceId: workspace.id, id })
    mutate({
      invitations: invitations.filter((i) => i.id !== id),
      members,
    })
  }

  const handleSelectNewInvitationRole =
    (id: string) => async (type: WorkspaceRole) => {
      if (!workspace) return
      await updateInvitation({ workspaceId: workspace.id, id, type })
      mutate({
        invitations: invitations.map((i) => (i.id === id ? { ...i, type } : i)),
        members,
      })
    }

  const handleNewInvitation = async (invitation: WorkspaceInvitation) => {
    await mutate({
      members,
      invitations: [...invitations, invitation],
    })
  }

  const handleNewMember = async (member: Member) => {
    await mutate({
      members: [...members, member],
      invitations,
    })
  }

  const currentMembersCount = members.length + invitations.length

  const canInviteNewMember = checkCanInviteMember({
    plan: workspace?.plan,
    customSeatsLimit: workspace?.customSeatsLimit,
    currentMembersCount,
  })

  return (
    <Stack w="full" spacing={3}>
      {!canInviteNewMember && (
        <UnlockPlanInfo
          contentLabel={`
          Upgrade your plan to work with more team members, and unlock awesome
          power features 🚀
        `}
        />
      )}
      {workspace && (
        <Heading fontSize="2xl">
          Members ({currentMembersCount}/{getSeatsLimit(workspace)})
        </Heading>
      )}
      {workspace?.id && canEdit && (
        <AddMemberForm
          workspaceId={workspace.id}
          onNewInvitation={handleNewInvitation}
          onNewMember={handleNewMember}
          isLoading={isLoading}
          isLocked={!canInviteNewMember}
        />
      )}
      {members.map((member) => (
        <MemberItem
          key={member.userId}
          email={member.email ?? ''}
          image={member.image ?? undefined}
          name={member.name ?? undefined}
          role={member.role}
          isMe={member.userId === user?.id}
          onDeleteClick={handleDeleteMemberClick(member.userId)}
          onSelectNewRole={handleSelectNewRole(member.userId)}
          canEdit={canEdit}
        />
      ))}
      {invitations.map((invitation) => (
        <MemberItem
          key={invitation.email}
          email={invitation.email ?? ''}
          role={invitation.type}
          onDeleteClick={handleDeleteInvitationClick(invitation.id)}
          onSelectNewRole={handleSelectNewInvitationRole(invitation.id)}
          isGuest
          canEdit={canEdit}
        />
      ))}
      {isLoading && (
        <HStack py="4">
          <SkeletonCircle boxSize="32px" />
          <SkeletonText width="200px" noOfLines={2} />
        </HStack>
      )}
    </Stack>
  )
}
