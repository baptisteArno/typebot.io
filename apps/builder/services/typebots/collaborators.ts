import { CollaboratorsOnTypebots } from 'model'
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
  >(typebotId ? `${process.env.BASE_PATH || ''}/api/typebots/${typebotId}/collaborators` : null, fetcher)
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
  collaborator: CollaboratorsOnTypebots
) =>
  sendRequest({
    method: 'PATCH',
    url: `${process.env.BASE_PATH || ''}/api/typebots/${typebotId}/collaborators/${userId}`,
    body: collaborator,
  })

export const deleteCollaborator = (typebotId: string, userId: string) =>
  sendRequest({
    method: 'DELETE',
    url: `${process.env.BASE_PATH || ''}/api/typebots/${typebotId}/collaborators/${userId}`,
  })
