import {
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  StackProps,
  useColorModeValue,
  useDisclosure,
  Box,
  Badge,
} from '@chakra-ui/react'
import assert from 'assert'
import {
  AlertIcon,
  BookIcon,
  BracesIcon,
  DownloadIcon,
  MoreVerticalIcon,
  SettingsIcon,
} from '@/components/icons'
import { useTypebot } from '../providers/TypebotProvider'
import React, { useEffect, useState, useRef } from 'react'
import { EditorSettingsModal } from './EditorSettingsModal'
import { parseDefaultPublicId } from '@/features/publish/helpers/parseDefaultPublicId'
import { useTranslate } from '@tolgee/react'
import { useUser } from '@/features/account/hooks/useUser'
import { useRouter } from 'next/router'
import { RightPanel, useEditor } from '../providers/EditorProvider'

export const BoardMenuButton = (props: StackProps) => {
  const { query } = useRouter()
  const { typebot, currentUserMode } = useTypebot()
  const { user } = useUser()
  const [isDownloading, setIsDownloading] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { t } = useTranslate()
  const { setRightPanel } = useEditor()
  const isEmbedded = query.embedded === 'true'

  useEffect(() => {
    if (user && !user.graphNavigation && !query.isFirstBot && !isEmbedded)
      onOpen()
  }, [onOpen, query.isFirstBot, user, user?.graphNavigation, isEmbedded])

  const downloadFlow = () => {
    assert(typebot)
    setIsDownloading(true)
    const data =
      'data:application/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(typebot))
    const fileName = `typebot-export-${parseDefaultPublicId(
      typebot.name,
      typebot.id
    )}.json`
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', data)
    linkElement.setAttribute('download', fileName)
    linkElement.click()
    setIsDownloading(false)
  }

  const redirectToDocumentation = () =>
    window.open('https://docs.typebot.io/editor/graph', '_blank')

  return (
    <HStack rounded="md" spacing="4" {...props}>
      <IconButton
        icon={<BracesIcon />}
        aria-label="Open variables drawer"
        size="sm"
        shadow="lg"
        bgColor={useColorModeValue('white', undefined)}
        onClick={() => setRightPanel(RightPanel.VARIABLES)}
      />
      <ValidationErrorsButton />
      <Menu>
        <MenuButton
          as={IconButton}
          icon={<MoreVerticalIcon transform={'rotate(90deg)'} />}
          isLoading={isDownloading}
          size="sm"
          shadow="lg"
          bgColor={useColorModeValue('white', undefined)}
        />
        <MenuList>
          <MenuItem icon={<BookIcon />} onClick={redirectToDocumentation}>
            {t('editor.graph.menu.documentationItem.label')}
          </MenuItem>
          {!isEmbedded && (
            <MenuItem icon={<SettingsIcon />} onClick={onOpen}>
              {t('editor.graph.menu.editorSettingsItem.label')}
            </MenuItem>
          )}
          {currentUserMode !== 'guest' ? (
            <MenuItem icon={<DownloadIcon />} onClick={downloadFlow}>
              {t('editor.graph.menu.exportFlowItem.label')}
            </MenuItem>
          ) : null}
        </MenuList>
        {!isEmbedded && (
          <EditorSettingsModal isOpen={isOpen} onClose={onClose} />
        )}
      </Menu>
    </HStack>
  )
}

const ValidationErrorsButton = () => {
  const { setRightPanel, validationErrors, isValidating } = useEditor()
  const [showSpinner, setShowSpinner] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    clearTimeout(timeoutRef.current)

    if (isValidating) {
      setShowSpinner(true)
    } else {
      timeoutRef.current = setTimeout(() => setShowSpinner(false), 150)
    }

    return () => clearTimeout(timeoutRef.current)
  }, [isValidating])

  const getTotalErrorCount = () => {
    if (!validationErrors) return 0
    return validationErrors.errors.length
  }

  const totalErrors = getTotalErrorCount()
  const hasErrors = validationErrors && !validationErrors.isValid

  return (
    <Box position="relative">
      <IconButton
        icon={<AlertIcon />}
        aria-label="Open validation errors drawer"
        size="sm"
        shadow="lg"
        bgColor={useColorModeValue('white', undefined)}
        colorScheme={hasErrors ? 'red' : 'gray'}
        isLoading={showSpinner}
        onClick={() => setRightPanel(RightPanel.VALIDATION_ERRORS)}
      />
      {hasErrors && totalErrors > 0 && !showSpinner && (
        <Badge
          colorScheme="red"
          variant={'solid'}
          borderRadius="full"
          fontSize="xs"
          position="absolute"
          top="-2"
          right="-2"
          minW="5"
          h="5"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {totalErrors}
        </Badge>
      )}
    </Box>
  )
}
