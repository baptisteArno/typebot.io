import { useState, useCallback } from 'react'
import { trpc } from '@/lib/trpc'
import {
  BrokenLinksError,
  ValidationErrorItem,
  ValidationError,
  InvalidGroupsError,
  OutgoingEdgeIdsError,
  InvalidTextBeforeClaudiaError,
} from '../../typebot/constants/errorTypes'

export type { ValidationError }

export const useValidation = () => {
  const [validationErrors, setValidationErrors] =
    useState<ValidationError | null>(null)

  const utils = trpc.useContext()
  const validateTypebot = useCallback(
    async (typebotId: string): Promise<ValidationError | null> => {
      try {
        const validation = await utils.typebot.getTypebotValidation.fetch({
          typebotId,
        })
        console.log('Validation result:', validation)
        const brokenLinks = validation.brokenLinks.map(
          (b) =>
            new BrokenLinksError(
              `Broken link in group '${b.groupName}' to typebot '${b.typebotName}'`,
              b.groupName,
              b.typebotName
            )
        )

        const invalidGroupErrors = validation.invalidGroups.map(
          (g) =>
            new InvalidGroupsError(
              `Condition block without outgoing edge in group '${g}'`
            )
        )

        const claudiaErrors = validation.invalidTextBeforeClaudia.map(
          (g) =>
            new InvalidTextBeforeClaudiaError(
              `Missing text block before Claudia in group '${g}'`
            )
        )

        const missingOutgoingEdges = validation.outgoingEdgeIds.filter(
          (id) => id === null
        ).length
        const outgoingEdgeErrors: ValidationErrorItem[] =
          missingOutgoingEdges > 0
            ? [
                new OutgoingEdgeIdsError(
                  `${missingOutgoingEdges} condition block(s) missing outgoing edge(s).`
                ),
              ]
            : []

        const mergedErrors: ValidationErrorItem[] = [
          ...brokenLinks,
          ...invalidGroupErrors,
          ...claudiaErrors,
          ...outgoingEdgeErrors,
        ]

        const mapped: ValidationError = {
          isValid: validation.isValid,
          errors: mergedErrors,
        }
        setValidationErrors(mapped)
        return mapped
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
