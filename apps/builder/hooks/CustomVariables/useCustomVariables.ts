import { useEffect, useMemo } from 'react'
import useSWR from 'swr'
import { fetchVariables } from './service'
import { useToast } from '@chakra-ui/react'

const useCustomVariables = () => {
  const { data, error } = useSWR(`variables`, fetchVariables, {
    dedupingInterval: 60000 * 60 * 24,
  })
  const toast = useToast({
    position: 'top-right',
    status: 'error',
  })

  useEffect(() => {
    if (!error?.message) return
    toast({
      title: 'Algo deu errado para carregar suas variáveis',
      description: error.message,
    })
  }, [error?.message])

  const mapedVariables = useMemo(() => {
    if (!data) return []

    return data.map((v) => ({
      id: v.id,
      dateCreation: v.dateCreation,
      default: v.default,
      idCompany: v.idCompany,
      isEnabled: v.isEnabled,
      name: v.name,
    }))
  }, [data])

  return { customVariables: mapedVariables }
}

export default useCustomVariables
