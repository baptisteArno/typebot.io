import { HStack, SkeletonCircle, SkeletonText, Stack } from '@chakra-ui/react'
import { UnlockPlanInfo } from 'components/shared/Info'
import { useUser } from 'contexts/UserContext'
import { useWorkspace } from 'contexts/WorkspaceContext'
import { Plan, WorkspaceInvitation, WorkspaceRole } from 'model'
import React from 'react'
import {
  deleteInvitation,
  deleteMember,
  Member,
  updateInvitation,
  updateMember,
  useMembers,
} from 'services/workspace'
import { AddMemberForm } from './AddMemberForm'
import { MemberItem } from './MemberItem'

export const MembersList = () => {
  const { user } = useUser()
  const { workspace, canEdit } = useWorkspace()
  const { members, invitations, isLoading, mutate } = useMembers({
    workspaceId: workspace?.id,
  })

  const handleDeleteMemberClick = (memberId: string) => async () => {
    if (!workspace || !members || !invitations) return
    await deleteMember(workspace.id, memberId)
    mutate({
      members: members.filter((m) => m.userId !== memberId),
      invitations,
    })
  }

  const handleSelectNewRole =
    (memberId: string) => async (role: WorkspaceRole) => {
      if (!workspace || !members || !invitations) return
      await updateMember(workspace.id, { userId: memberId, role })
      mutate({
        members: members.map((m) =>
          m.userId === memberId ? { ...m, role } : m
        ),
        invitations,
      })
    }

  const handleDeleteInvitationClick = (id: string) => async () => {
    if (!workspace || !members || !invitations) return
    await deleteInvitation({ workspaceId: workspace.id, id })
    mutate({
      invitations: invitations.filter((i) => i.id !== id),
      members,
    })
  }

  const handleSelectNewInvitationRole =
    (id: string) => async (type: WorkspaceRole) => {
      if (!workspace || !members || !invitations) return
      await updateInvitation({ workspaceId: workspace.id, id, type })
      mutate({
        invitations: invitations.map((i) => (i.id === id ? { ...i, type } : i)),
        members,
      })
    }

  const handleNewInvitation = (invitation: WorkspaceInvitation) => {
    if (!members || !invitations) return
    mutate({
      members,
      invitations: [...invitations, invitation],
    })
  }

  const handleNewMember = (member: Member) => {
    if (!members || !invitations) return
    mutate({
      members: [...members, member],
      invitations,
    })
  }

  return (
    <Stack w="full">
      {workspace?.plan !== Plan.TEAM && (
        <UnlockPlanInfo
          contentLabel={
            'Upgrade to team plan for a collaborative workspace, unlimited team members, and advanced permissions.'
          }
          plan={Plan.TEAM}
        />
      )}
      {workspace?.id && canEdit && (
        <AddMemberForm
          workspaceId={workspace.id}
          onNewInvitation={handleNewInvitation}
          onNewMember={handleNewMember}
          isLoading={isLoading}
          isLocked={workspace.plan !== Plan.TEAM}
        />
      )}
      {members?.map((member) => (
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
      {invitations?.map((invitation) => (
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
