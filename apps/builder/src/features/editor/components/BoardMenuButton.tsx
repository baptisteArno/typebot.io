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
  DownloadIcon,
  MoreVerticalIcon,
  SettingsIcon,
} from '@/components/icons'
import { useTypebot } from '../providers/TypebotProvider'
import { useUser } from '@/features/account/hooks/useUser'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { isNotDefined } from '@typebot.io/lib'
import { EditorSettingsModal } from './EditorSettingsModal'
import { parseDefaultPublicId } from '@/features/publish/helpers/parseDefaultPublicId'

export const BoardMenuButton = (props: FlexProps) => {
  const { query } = useRouter()
  const { typebot } = useTypebot()
  const { user } = useUser()
  const [isDownloading, setIsDownloading] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    if (
      user &&
      isNotDefined(user.graphNavigation) &&
      isNotDefined(query.isFirstBot)
    )
      onOpen()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
