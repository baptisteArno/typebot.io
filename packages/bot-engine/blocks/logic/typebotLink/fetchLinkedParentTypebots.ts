import { fetchLinkedTypebots } from './fetchLinkedTypebots'

type Props = {
  parentTypebotIds: string[]
  userId: string | undefined
  isPreview?: boolean
}

export const fetchLinkedParentTypebots = ({
  parentTypebotIds,
  isPreview,
  userId,
}: Props) =>
  parentTypebotIds.length > 0
    ? fetchLinkedTypebots({
        typebotIds: parentTypebotIds,
        isPreview,
        userId,
      })
    : []
