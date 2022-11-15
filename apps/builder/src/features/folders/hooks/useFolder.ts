import { fetcher } from '@/utils/helpers'
import { DashboardFolder } from 'db'
import useSWR from 'swr'

export const useFolder = ({
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
