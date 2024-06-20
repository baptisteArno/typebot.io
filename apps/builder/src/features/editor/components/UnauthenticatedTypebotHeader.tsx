import {
  Flex,
  HStack,
  Button,
  useColorModeValue,
  Divider,
  Text,
} from '@chakra-ui/react'
import { CopyIcon, PlayIcon } from '@/components/icons'
import { useRouter } from 'next/router'
import React from 'react'
import { isNotDefined } from '@sniper.io/lib'
import Link from 'next/link'
import { headerHeight } from '../constants'
import { RightPanel, useEditor } from '../providers/EditorProvider'
import { useSniper } from '../providers/SniperProvider'
import { useTranslate } from '@tolgee/react'
import { SniperLogo } from '@/components/SniperLogo'
import { EmojiOrImageIcon } from '@/components/EmojiOrImageIcon'
import { useUser } from '@/features/account/hooks/useUser'

export const GuestSniperHeader = () => {
  const { t } = useTranslate()
  const router = useRouter()
  const { user } = useUser()
  const { sniper, save } = useSniper()
  const {
    setRightPanel,
    rightPanel,
    setStartPreviewAtGroup,
    setStartPreviewAtEvent,
  } = useEditor()

  const handlePreviewClick = async () => {
    setStartPreviewAtGroup(undefined)
    setStartPreviewAtEvent(undefined)
    save().then()
    setRightPanel(RightPanel.PREVIEW)
  }

  return (
    <Flex
      w="full"
      borderBottomWidth="1px"
      justify="center"
      align="center"
      h={`${headerHeight}px`}
      zIndex={100}
      pos="relative"
      bgColor={useColorModeValue('white', 'gray.900')}
      flexShrink={0}
    >
      <HStack
        display={['none', 'flex']}
        pos={{ base: 'absolute', xl: 'static' }}
        right={{ base: 280, xl: 0 }}
      >
        <Button
          as={Link}
          href={`/snipers/${sniper?.id}/edit`}
          colorScheme={router.pathname.includes('/edit') ? 'blue' : 'gray'}
          variant={router.pathname.includes('/edit') ? 'outline' : 'ghost'}
          size="sm"
        >
          {t('editor.header.flowButton.label')}
        </Button>
        <Button
          as={Link}
          href={`/snipers/${sniper?.id}/theme`}
          colorScheme={router.pathname.endsWith('theme') ? 'blue' : 'gray'}
          variant={router.pathname.endsWith('theme') ? 'outline' : 'ghost'}
          size="sm"
        >
          {t('editor.header.themeButton.label')}
        </Button>
        <Button
          as={Link}
          href={`/snipers/${sniper?.id}/settings`}
          colorScheme={router.pathname.endsWith('settings') ? 'blue' : 'gray'}
          variant={router.pathname.endsWith('settings') ? 'outline' : 'ghost'}
          size="sm"
        >
          {t('editor.header.settingsButton.label')}
        </Button>
      </HStack>
      <HStack
        pos="absolute"
        left="1rem"
        justify="center"
        align="center"
        spacing="6"
      >
        <HStack alignItems="center" spacing={3}>
          {sniper && (
            <EmojiOrImageIcon icon={sniper.icon} emojiFontSize="2xl" />
          )}
          <Text
            noOfLines={2}
            maxW="150px"
            overflow="hidden"
            fontSize="14px"
            minW="30px"
            minH="20px"
          >
            {sniper?.name}
          </Text>
        </HStack>
      </HStack>

      <HStack
        right="1rem"
        pos="absolute"
        display={['none', 'flex']}
        spacing={4}
      >
        <HStack>
          {sniper?.id && (
            <Button
              as={Link}
              href={
                !user
                  ? {
                      pathname: `/register`,
                      query: {
                        redirectPath: `/snipers/${sniper.id}/duplicate`,
                      },
                    }
                  : `/snipers/${sniper.id}/duplicate`
              }
              leftIcon={<CopyIcon />}
              isLoading={isNotDefined(sniper)}
              size="sm"
            >
              Duplicate
            </Button>
          )}
          {router.pathname.includes('/edit') && isNotDefined(rightPanel) && (
            <Button
              colorScheme="blue"
              onClick={handlePreviewClick}
              isLoading={isNotDefined(sniper)}
              leftIcon={<PlayIcon />}
              size="sm"
            >
              Play bot
            </Button>
          )}
        </HStack>

        {!user && (
          <>
            <Divider orientation="vertical" h="25px" borderColor="gray.400" />
            <Button
              as={Link}
              href={`/register`}
              leftIcon={<SniperLogo width="20px" />}
              variant="outline"
              size="sm"
            >
              Try Sniper
            </Button>
          </>
        )}
      </HStack>
    </Flex>
  )
}
