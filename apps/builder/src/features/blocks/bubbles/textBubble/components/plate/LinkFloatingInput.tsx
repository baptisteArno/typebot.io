import React, { useRef } from 'react'
import {
  flip,
  offset,
  UseVirtualFloatingOptions,
} from '@udecode/plate-floating'
import {
  LinkFloatingToolbarState,
  useFloatingLinkEdit,
  useFloatingLinkEditState,
  useFloatingLinkInsert,
  useFloatingLinkInsertState,
  useFloatingLinkUrlInput,
} from '@udecode/plate-link'
import { LinkIcon, UnlinkIcon } from '@/components/icons'
import {
  Button,
  Divider,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  useColorModeValue,
} from '@chakra-ui/react'
import { TextInputIcon } from '@/features/blocks/inputs/textInput/components/TextInputIcon'

const floatingOptions: UseVirtualFloatingOptions = {
  placement: 'bottom-start',
  middleware: [
    offset(12),
    flip({
      padding: 12,
      fallbackPlacements: ['bottom-end', 'top-start', 'top-end'],
    }),
  ],
}

export interface LinkFloatingToolbarProps {
  state?: LinkFloatingToolbarState
}

export function LinkFloatingToolbar({ state }: LinkFloatingToolbarProps) {
  const bgColor = useColorModeValue('white', 'gray.800')
  const urlInputRef = useRef<HTMLInputElement>(null)
  const insertState = useFloatingLinkInsertState({
    ...state,
    floatingOptions: {
      ...floatingOptions,
      ...state?.floatingOptions,
    },
  })
  const {
    props: insertProps,
    ref: insertRef,
    hidden,
    textInputProps,
  } = useFloatingLinkInsert(insertState)

  const { props } = useFloatingLinkUrlInput({
    ref: urlInputRef,
  })

  const editState = useFloatingLinkEditState({
    ...state,
    floatingOptions: {
      ...floatingOptions,
      ...state?.floatingOptions,
    },
  })
  const {
    props: editProps,
    ref: editRef,
    editButtonProps,
    unlinkButtonProps,
  } = useFloatingLinkEdit(editState)

  if (hidden) return null

  const input = (
    <Stack
      w="330px"
      px="4"
      py="2"
      rounded="md"
      borderWidth={1}
      shadow="md"
      bgColor={bgColor}
    >
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <LinkIcon color="gray.300" />
        </InputLeftElement>
        <Input
          ref={urlInputRef}
          placeholder="Paste link"
          defaultValue={props.defaultValue}
          onChange={props.onChange}
        />
      </InputGroup>

      <Divider />

      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <TextInputIcon color="gray.300" />
        </InputLeftElement>
        <Input placeholder="Text to display" {...textInputProps} />
      </InputGroup>
    </Stack>
  )

  const editContent = editState.isEditing ? (
    input
  ) : (
    <HStack
      bgColor="white"
      p="2"
      rounded="md"
      borderWidth={1}
      shadow="md"
      align="center"
    >
      <Button {...editButtonProps} size="sm">
        Edit link
      </Button>

      <Divider orientation="vertical" h="20px" />

      <IconButton
        icon={<UnlinkIcon />}
        aria-label="Unlink"
        size="sm"
        {...unlinkButtonProps}
      />
    </HStack>
  )

  return (
    <>
      <div ref={insertRef} {...insertProps}>
        {input}
      </div>

      <div ref={editRef} {...editProps}>
        {editContent}
      </div>
    </>
  )
}
