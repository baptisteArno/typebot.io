import { IconButton, Text, Tooltip } from '@chakra-ui/react'
import { CheckIcon, SaveIcon } from 'assets/icons'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'
import React from 'react'

export const SaveButton = () => {
  const { save, isSavingLoading, hasUnsavedChanges } = useTypebot()

  const handleSaveClick = async () => {
    await save()
  }

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
          onClick={handleSaveClick}
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
