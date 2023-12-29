import { T } from '@tolgee/react'
import { CollaborationType } from '@typebot.io/prisma'

type Props = { type: CollaborationType }
export const ReadableCollaborationType = ({ type }: Props) => {
  switch (type) {
    case CollaborationType.READ:
      return <T keyName="collaboration.roles.view.label" />
    case CollaborationType.WRITE:
      return <T keyName="collaboration.roles.edit.label" />
    case CollaborationType.FULL_ACCESS:
      return <T keyName="collaboration.roles.full.label" />
  }
}
