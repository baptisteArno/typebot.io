import { fetcher } from '@/helpers/fetcher'
import { Invitation } from '@sniper.io/prisma'
import useSWR from 'swr'
import { env } from '@sniper.io/env'

export const useInvitations = ({
  sniperId,
  onError,
}: {
  sniperId?: string
  onError: (error: Error) => void
}) => {
  const { data, error, mutate } = useSWR<{ invitations: Invitation[] }, Error>(
    sniperId ? `/api/snipers/${sniperId}/invitations` : null,
    fetcher,
    {
      dedupingInterval: env.NEXT_PUBLIC_E2E_TEST ? 0 : undefined,
    }
  )
  if (error) onError(error)
  return {
    invitations: data?.invitations,
    isLoading: !error && !data,
    mutate,
  }
}
