import {
  Flex,
  Heading,
  HStack,
  IconButton,
  Stack,
  Tag,
  useToast,
  Wrap,
  Text,
} from '@chakra-ui/react'
import { TrashIcon } from 'assets/icons'
import { UpgradeButton } from 'components/shared/buttons/UpgradeButton'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'
import { useUser } from 'contexts/UserContext'
import React from 'react'
import { parseDefaultPublicId } from 'services/typebots'
import { isFreePlan } from 'services/user'
import { isDefined, isNotDefined } from 'utils'
import { CustomDomainsDropdown } from './customDomain/CustomDomainsDropdown'
import { EditableUrl } from './EditableUrl'
import { integrationsList } from './integrations/EmbedButton'

export const ShareContent = () => {
  const { user } = useUser()
  const { typebot, updateOnBothTypebots } = useTypebot()
  const toast = useToast({
    position: 'top-right',
    status: 'error',
  })

  const handlePublicIdChange = (publicId: string) => {
    if (publicId === typebot?.publicId) return
    if (publicId.length < 4)
      return toast({ description: 'ID must be longer than 4 characters' })
    updateOnBothTypebots({ publicId })
  }

  const publicId = typebot
    ? typebot?.publicId ?? parseDefaultPublicId(typebot.name, typebot.id)
    : ''
  const isPublished = isDefined(typebot?.publishedTypebotId)

  const handlePathnameChange = (pathname: string) => {
    if (!typebot?.customDomain) return
    const existingHost = typebot.customDomain?.split('/')[0]
    const newDomain =
      pathname === '' ? existingHost : existingHost + '/' + pathname
    handleCustomDomainChange(newDomain)
  }

  const handleCustomDomainChange = (customDomain: string | null) =>
    updateOnBothTypebots({ customDomain })

  return (
    <Flex h="full" w="full" justifyContent="center" align="flex-start">
      <Stack maxW="1000px" w="full" pt="10" spacing={10}>
        <Stack spacing={4} align="flex-start">
          <Heading fontSize="2xl" as="h1">
            Your typebot link
          </Heading>
          {typebot && (
            <EditableUrl
              hostname={
                process.env.NEXT_PUBLIC_VIEWER_URL ?? 'https://typebot.io'
              }
              pathname={publicId}
              onPathnameChange={handlePublicIdChange}
            />
          )}
          {typebot?.customDomain && (
            <HStack>
              <EditableUrl
                hostname={'https://' + typebot.customDomain.split('/')[0]}
                pathname={typebot.customDomain.split('/')[1]}
                onPathnameChange={handlePathnameChange}
              />
              <IconButton
                icon={<TrashIcon />}
                aria-label="Remove custom domain"
                size="xs"
                onClick={() => handleCustomDomainChange(null)}
              />
            </HStack>
          )}
          {isFreePlan(user) ? (
            <UpgradeButton colorScheme="gray">
              <Text mr="2">Add my domain</Text>{' '}
              <Tag colorScheme="orange">Pro</Tag>
            </UpgradeButton>
          ) : (
            <>
              {isNotDefined(typebot?.customDomain) && (
                <CustomDomainsDropdown
                  onCustomDomainSelect={handleCustomDomainChange}
                />
              )}
            </>
          )}
        </Stack>

        <Stack spacing={4}>
          <Heading fontSize="2xl" as="h1">
            Embed your typebot
          </Heading>
          <Wrap spacing={7}>
            {integrationsList.map((IntegrationButton, idx) => (
              <IntegrationButton
                key={idx}
                publicId={publicId}
                isPublished={isPublished}
              />
            ))}
          </Wrap>
        </Stack>
      </Stack>
    </Flex>
  )
}
