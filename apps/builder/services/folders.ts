import { DashboardFolder } from 'model'
import useSWR from 'swr'
import { fetcher } from './utils'
import { stringify } from 'qs'
import { isNotEmpty, sendRequest } from 'utils'

export const useFolders = ({
  parentId,
  workspaceId,
  onError,
}: {
  workspaceId?: string
  parentId?: string
  onError: (error: Error) => void
}) => {
  const params = stringify({ parentId, workspaceId })
  const { data, error, mutate } = useSWR<{ folders: DashboardFolder[] }, Error>(
    workspaceId ? `/api/folders?${params}` : null,
    fetcher,
    {
      dedupingInterval: isNotEmpty(process.env.NEXT_PUBLIC_E2E_TEST)
        ? 0
        : undefined,
    }
  )
  if (error) onError(error)
  return {
    folders: data?.folders,
    isLoading: !error && !data,
    mutate,
  }
}

export const useFolderContent = ({
  folderId,
  onError,
}: {
  folderId?: string
  onError: (error: Error) => void
}) => {
  const { data, error, mutate } = useSWR<{ folder: DashboardFolder }, Error>(
    `/api/folders/${folderId}`,
    fetcher
  )
  if (error) onError(error)
  return {
    folder: data?.folder,
    isLoading: !error && !data,
    mutate,
  }
}

export const createFolder = async (
  workspaceId: string,
  folder: Pick<DashboardFolder, 'parentFolderId'>
) =>
  sendRequest<DashboardFolder>({
    url: `/api/folders`,
    method: 'POST',
    body: { ...folder, workspaceId },
  })

export const deleteFolder = async (id: string) =>
  sendRequest({
    url: `/api/folders/${id}`,
    method: 'DELETE',
  })

export const updateFolder = async (
  id: string,
  folder: Partial<DashboardFolder>
) =>
  sendRequest({
    url: `/api/folders/${id}`,
    method: 'PATCH',
    body: folder,
  })
