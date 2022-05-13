import { Editable, EditablePreview, EditableInput } from '@chakra-ui/editable'
import { Tooltip } from '@chakra-ui/tooltip'
import React, { useEffect, useState } from 'react'

type EditableProps = {
  name: string
  onNewName: (newName: string) => void
}
export const EditableTypebotName = ({ name, onNewName }: EditableProps) => {
  const [localName, setLocalName] = useState(name)

  useEffect(() => {
    if (name !== localName) setLocalName(name)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name])

  return (
    <Tooltip label="Rename">
      <Editable value={localName} onChange={setLocalName} onSubmit={onNewName}>
        <EditablePreview
          noOfLines={0}
          cursor="pointer"
          maxW="200px"
          overflow="hidden"
          display="flex"
          alignItems="center"
        />
        <EditableInput />
      </Editable>
    </Tooltip>
  )
}
