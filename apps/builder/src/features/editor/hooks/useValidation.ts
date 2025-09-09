import { useState, useCallback } from 'react'
import { trpc } from '@/lib/trpc'
import { ValidationError } from '../../typebot/constants/errorTypes'
import { Typebot } from '@typebot.io/schemas'

export type { ValidationError }

export const useValidation = () => {
  const [validationErrors, setValidationErrors] =
    useState<ValidationError | null>(null)

  const utils = trpc.useContext()

  const validateTypebot = useCallback(
    async (typebot: Typebot): Promise<ValidationError | null> => {
      try {
        const validation = await utils.typebot.getTypebotValidation.fetch({
          typebot,
        })
        console.log('Validation result:', validation)
        setValidationErrors(validation)
        return validation
      } catch (error) {
        console.error('Validation error:', error)
        setValidationErrors(null)
        return null
      }
    },
    [utils]
  )

  const clearValidationErrors = useCallback(() => {
    setValidationErrors(null)
  }, [])

  return {
    validationErrors,
    setValidationErrors,
    validateTypebot,
    clearValidationErrors,
  }
}
