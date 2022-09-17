import { useToast as useChakraToast, UseToastOptions } from '@chakra-ui/react'

export const useToast = () => {
  const toast = useChakraToast()

  const showToast = ({
    title,
    description,
    status = 'error',
    ...props
  }: UseToastOptions) => {
    toast({
      position: 'bottom-right',
      description,
      title,
      status,
      ...props,
    })
  }

  return { showToast }
}
