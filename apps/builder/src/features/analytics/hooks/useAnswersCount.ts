import { fetcher } from '@/utils/helpers'
import useSWR from 'swr'
import { AnswersCount } from '../types'

export const useAnswersCount = ({
  typebotId,
  onError,
}: {
  typebotId?: string
  onError: (error: Error) => void
}) => {
  const { data, error, mutate } = useSWR<
    { answersCounts: AnswersCount[] },
    Error
  >(
    typebotId ? `/api/typebots/${typebotId}/results/answers/count` : null,
    fetcher
  )
  if (error) onError(error)
  return {
    answersCounts: data?.answersCounts,
    isLoading: !error && !data,
    mutate,
  }
}
