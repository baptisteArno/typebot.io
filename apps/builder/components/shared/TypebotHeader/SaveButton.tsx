import { IconButton, Text, Tooltip } from '@chakra-ui/react'
import { CheckIcon, SaveIcon } from 'assets/icons'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'
import React from 'react'

export const SaveButton = () => {
  const { save, isSavingLoading, hasUnsavedChanges } = useTypebot()

  return (
    <>
      {hasUnsavedChanges && (
        <Text fontSize="sm" color="gray.500">
          Unsaved changes
        </Text>
      )}
      <Tooltip label="Save changes">
        <IconButton
          isDisabled={!hasUnsavedChanges}
          onClick={save}
          isLoading={isSavingLoading}
          icon={
            hasUnsavedChanges ? <SaveIcon /> : <CheckIcon color="green.400" />
          }
          aria-label={hasUnsavedChanges ? 'Save' : 'Saved'}
        />
      </Tooltip>
    </>
  )
}
