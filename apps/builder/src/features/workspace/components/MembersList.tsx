import {
  Heading,
  HStack,
  SkeletonCircle,
  SkeletonText,
  Stack,
} from '@chakra-ui/react'
import { UnlockPlanAlertInfo } from '@/components/UnlockPlanAlertInfo'
import { WorkspaceInvitation, WorkspaceRole } from '@typebot.io/prisma'
import React from 'react'
import { getSeatsLimit, isSeatsLimitReached } from '@typebot.io/lib/pricing'
import { AddMemberForm } from './AddMemberForm'
import { MemberItem } from './MemberItem'
import { isDefined } from '@typebot.io/lib'
import { useUser } from '@/features/account/hooks/useUser'
import { useMembers } from '../hooks/useMembers'
import { deleteInvitationQuery } from '../queries/deleteInvitationQuery'
import { deleteMemberQuery } from '../queries/deleteMemberQuery'
import { updateInvitationQuery } from '../queries/updateInvitationQuery'
import { updateMemberQuery } from '../queries/updateMemberQuery'
import { Member } from '../types'
import { useWorkspace } from '../WorkspaceProvider'

export const MembersList = () => {
  const { user } = useUser()
  const { workspace, currentRole } = useWorkspace()
  const { members, invitations, isLoading, mutate } = useMembers({
    workspaceId: workspace?.id,
  })

  const canEdit = currentRole === WorkspaceRole.ADMIN

  const handleDeleteMemberClick = (memberId: string) => async () => {
    if (!workspace) return
    await deleteMemberQuery(workspace.id, memberId)
    mutate({
      members: members.filter((m) => m.userId !== memberId),
      invitations,
    })
  }

  const handleSelectNewRole =
    (memberId: string) => async (role: WorkspaceRole) => {
      if (!workspace) return
      await updateMemberQuery(workspace.id, { userId: memberId, role })
      mutate({
        members: members.map((m) =>
          m.userId === memberId ? { ...m, role } : m
        ),
        invitations,
      })
    }

  const handleDeleteInvitationClick = (id: string) => async () => {
    if (!workspace) return
    await deleteInvitationQuery({ workspaceId: workspace.id, id })
    mutate({
      invitations: invitations.filter((i) => i.id !== id),
      members,
    })
  }

  const handleSelectNewInvitationRole =
    (id: string) => async (type: WorkspaceRole) => {
      if (!workspace) return
      await updateInvitationQuery({ workspaceId: workspace.id, id, type })
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

  const currentMembersCount =
    members.filter((member) => member.role !== WorkspaceRole.GUEST).length +
    invitations.length

  const seatsLimit = workspace ? getSeatsLimit(workspace) : undefined

  const canInviteNewMember =
    workspace &&
    !isSeatsLimitReached({
      plan: workspace?.plan,
      customSeatsLimit: workspace?.customSeatsLimit,
      existingMembersCount: currentMembersCount,
      existingInvitationsCount: invitations.length,
    })

  return (
    <Stack w="full" spacing={3}>
      {!canInviteNewMember && (
        <UnlockPlanAlertInfo
          contentLabel={`
          Upgrade your plan to work with more team members, and unlock awesome
          power features 🚀
        `}
        />
      )}
      {isDefined(seatsLimit) && (
        <Heading fontSize="2xl">
          Members{' '}
          {seatsLimit === -1 ? '' : `(${currentMembersCount}/${seatsLimit})`}
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
