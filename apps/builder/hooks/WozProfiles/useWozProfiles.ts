import { useEffect } from 'react'
import useSWR from 'swr'
import { useToast } from '@chakra-ui/react'
import { fetchWOZProfiles } from './services'

const useWozProfiles = () => {
  const { data, error } = useSWR(`wozProfiles`, fetchWOZProfiles, {
    dedupingInterval: 60000 * 60 * 24,
  })
  const toast = useToast({
    position: 'top-right',
    status: 'error',
  })

  useEffect(() => {
    if (!error?.message) return
    toast({
      title: 'Algo deu errado para carregar os perfis WOZ',
      description: error.message,
    })
  }, [error?.message])

  return { wozProfiles: data }
}

export default useWozProfiles
