import {
  Flex,
  FlexProps,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import assert from 'assert'
import {
  BookIcon,
  DownloadIcon,
  MoreVerticalIcon,
  SettingsIcon,
} from '@/components/icons'
import { useTypebot } from '../providers/TypebotProvider'
import { useUser } from '@/features/account/hooks/useUser'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { EditorSettingsModal } from './EditorSettingsModal'
import { parseDefaultPublicId } from '@/features/publish/helpers/parseDefaultPublicId'

export const BoardMenuButton = (props: FlexProps) => {
  const { query } = useRouter()
  const { typebot } = useTypebot()
  const { user } = useUser()
  const [isDownloading, setIsDownloading] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    if (user && !user.graphNavigation && !query.isFirstBot) onOpen()
  }, [onOpen, query.isFirstBot, user, user?.graphNavigation])

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
    window.open('https://docs.typebot.io/get-started/overview', '_blank')

  return (
    <Flex
      bgColor={useColorModeValue('white', 'gray.900')}
      rounded="md"
      {...props}
    >
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
            Documentation
          </MenuItem>
          <MenuItem icon={<SettingsIcon />} onClick={onOpen}>
            Editor settings
          </MenuItem>
          <MenuItem icon={<DownloadIcon />} onClick={downloadFlow}>
            Export flow
          </MenuItem>
        </MenuList>
        <EditorSettingsModal isOpen={isOpen} onClose={onClose} />
      </Menu>
    </Flex>
  )
}
