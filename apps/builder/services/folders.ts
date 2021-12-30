import { DashboardFolder } from '.prisma/client'
import useSWR from 'swr'
import { fetcher, sendRequest } from './utils'
import { stringify } from 'qs'

export const useFolders = ({
  parentId,
  onError,
}: {
  parentId?: string
  onError: (error: Error) => void
}) => {
  const params = stringify({ parentId })
  const { data, error, mutate } = useSWR<{ folders: DashboardFolder[] }, Error>(
    `/api/folders?${params}`,
    fetcher
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
  folder: Pick<DashboardFolder, 'parentFolderId'>
) =>
  sendRequest<DashboardFolder>({
    url: `/api/folders`,
    method: 'POST',
    body: folder,
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
