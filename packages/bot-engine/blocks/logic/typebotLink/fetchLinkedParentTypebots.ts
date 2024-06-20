import { fetchLinkedSnipers } from './fetchLinkedSnipers'

type Props = {
  parentSniperIds: string[]
  userId: string | undefined
  isPreview?: boolean
}

export const fetchLinkedParentSnipers = ({
  parentSniperIds,
  isPreview,
  userId,
}: Props) =>
  parentSniperIds.length > 0
    ? fetchLinkedSnipers({
        sniperIds: parentSniperIds,
        isPreview,
        userId,
      })
    : []
