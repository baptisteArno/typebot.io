import { useState, useCallback, useRef } from 'react'
import { trpc } from '@/lib/trpc'
import { ValidationError } from '../../typebot/constants/errorTypes'
import { Typebot } from '@typebot.io/schemas'

export type { ValidationError }

export const useValidation = () => {
  const [validationErrors, setValidationErrors] =
    useState<ValidationError | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  const mutation = trpc.typebot.postTypebotValidation.useMutation()
  const mutateAsyncRef = useRef(mutation.mutateAsync)
  mutateAsyncRef.current = mutation.mutateAsync

  const validateTypebot = useCallback(
    async (typebot: Typebot): Promise<ValidationError | null> => {
      setIsValidating(true)
      try {
        const validation = await mutateAsyncRef.current({
          typebotId: typebot.id,
          typebot,
        })
        setValidationErrors(validation)
        return validation
      } catch (error) {
        console.error('Validation error:', error)
        setValidationErrors(null)
        return null
      } finally {
        setIsValidating(false)
      }
    },
    []
  )

  const clearValidationErrors = useCallback(() => {
    setValidationErrors(null)
  }, [])

  return {
    validationErrors,
    setValidationErrors,
    validateTypebot,
    clearValidationErrors,
    isValidating,
  }
}
