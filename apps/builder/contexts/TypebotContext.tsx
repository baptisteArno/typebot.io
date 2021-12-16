import { useToast } from '@chakra-ui/react'
import { Typebot } from 'bot-engine'
import { useRouter } from 'next/router'
import { createContext, ReactNode, useContext, useEffect } from 'react'
import { fetcher } from 'services/utils'
import useSWR from 'swr'

const typebotContext = createContext<{
  typebot?: Typebot
}>({})

export const TypebotContext = ({
  children,
  typebotId,
}: {
  children: ReactNode
  typebotId?: string
}) => {
  const router = useRouter()
  const toast = useToast({
    position: 'top-right',
    status: 'error',
  })
  const { typebot, isLoading } = useFetchedTypebot({
    typebotId,
    onError: (error) =>
      toast({
        title: 'Error while fetching typebot',
        description: error.message,
      }),
  })

  useEffect(() => {
    if (isLoading) return
    if (!typebot) {
      toast({ status: 'info', description: "Couldn't find typebot" })
      router.replace('/typebots')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading])

  return (
    <typebotContext.Provider
      value={{
        typebot,
      }}
    >
      {children}
    </typebotContext.Provider>
  )
}

export const useTypebot = () => useContext(typebotContext)

export const useFetchedTypebot = ({
  typebotId,
  onError,
}: {
  typebotId?: string
  onError: (error: Error) => void
}) => {
  const { data, error, mutate } = useSWR<{ typebot: Typebot }, Error>(
    typebotId ? `/api/typebots/${typebotId}` : null,
    fetcher
  )
  if (error) onError(error)
  return {
    typebot: data?.typebot,
    isLoading: !error && !data,
    mutate,
  }
}
