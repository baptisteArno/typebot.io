import {
  HStack,
  Tooltip,
  EditablePreview,
  EditableInput,
  Text,
  Editable,
  Button,
  ButtonProps,
  useEditableControls,
} from '@chakra-ui/react'
import { EditIcon } from '@/components/icons'
import { CopyButton } from '@/components/CopyButton'
import { useToast } from '@/hooks/useToast'
import React, { useState } from 'react'

type EditableUrlProps = {
  hostname: string
  pathname?: string
  onPathnameChange: (pathname: string) => void
}

export const EditableUrl = ({
  hostname,
  pathname,
  onPathnameChange,
}: EditableUrlProps) => {
  const { showToast } = useToast()
  const [value, setValue] = useState(pathname)

  const handleSubmit = (newPathname: string) => {
    if (/^[a-z0-9-]*$/.test(newPathname)) return onPathnameChange(newPathname)
    setValue(pathname)
    showToast({
      title: 'Invalid ID',
      description: 'Should contain only contain letters, numbers and dashes.',
    })
  }

  return (
    <Editable
      as={HStack}
      spacing={3}
      value={value}
      onChange={setValue}
      onSubmit={handleSubmit}
    >
      <HStack spacing={1}>
        <Text>{hostname}/</Text>
        <Tooltip label="Edit">
          <EditablePreview
            mx={1}
            borderWidth="1px"
            px={3}
            rounded="md"
            cursor="text"
            display="flex"
            fontWeight="semibold"
          />
        </Tooltip>
        <EditableInput px={2} />
      </HStack>

      <HStack>
        <EditButton size="xs" />
        <CopyButton size="xs" textToCopy={`${hostname}/${value ?? ''}`} />
      </HStack>
    </Editable>
  )
}

const EditButton = (props: ButtonProps) => {
  const { isEditing, getEditButtonProps } = useEditableControls()

  return isEditing ? null : (
    <Button leftIcon={<EditIcon />} {...props} {...getEditButtonProps()}>
      Edit
    </Button>
  )
}
