import { CollaboratorsOnTypebots } from 'db'
import { fetcher } from 'services/utils'
import useSWR from 'swr'
import { sendRequest } from 'utils'

export type Collaborator = CollaboratorsOnTypebots & {
  user: {
    name: string | null
    image: string | null
    email: string | null
  }
}

export const useCollaborators = ({
  typebotId,
  onError,
}: {
  typebotId?: string
  onError: (error: Error) => void
}) => {
  const { data, error, mutate } = useSWR<
    { collaborators: Collaborator[] },
    Error
  >(typebotId ? `/api/typebots/${typebotId}/collaborators` : null, fetcher)
  if (error) onError(error)
  return {
    collaborators: data?.collaborators,
    isLoading: !error && !data,
    mutate,
  }
}

export const updateCollaborator = (
  typebotId: string,
  userId: string,
  updates: Partial<CollaboratorsOnTypebots>
) =>
  sendRequest({
    method: 'PUT',
    url: `/api/typebots/${typebotId}/collaborators/${userId}`,
    body: updates,
  })

export const deleteCollaborator = (typebotId: string, userId: string) =>
  sendRequest({
    method: 'DELETE',
    url: `/api/typebots/${typebotId}/collaborators/${userId}`,
  })
