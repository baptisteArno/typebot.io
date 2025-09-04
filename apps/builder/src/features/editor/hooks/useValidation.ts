import { useState, useCallback } from 'react'
import { trpc } from '@/lib/trpc'

export type ValidationError = {
  isValid: boolean
  outgoingEdgeIds: (string | null)[]
  invalidGroups: string[]
  brokenLinks: Array<{ groupName: string; typebotName: string }>
  invalidTextBeforeClaudia: string[]
}

export const useValidation = () => {
  const [validationErrors, setValidationErrors] =
    useState<ValidationError | null>(null)

  const utils = trpc.useContext()

  console.log('Validation errors', validationErrors)

  const validateTypebot = useCallback(
    async (typebotId: string): Promise<ValidationError | null> => {
      try {
        const validation = await utils.typebot.getTypebotValidation.fetch({
          typebotId,
        })
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
