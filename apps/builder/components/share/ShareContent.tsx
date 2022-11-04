import {
  Flex,
  Heading,
  HStack,
  IconButton,
  Stack,
  Wrap,
  Text,
} from '@chakra-ui/react'
import { TrashIcon } from 'assets/icons'
import { UpgradeButton } from 'components/shared/buttons/UpgradeButton'
import { useToast } from 'components/shared/hooks/useToast'
import { LockTag } from 'components/shared/LockTag'
import { LimitReached } from 'components/shared/modals/ChangePlanModal'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'
import { useWorkspace } from 'contexts/WorkspaceContext'
import { Plan } from 'db'
import React from 'react'
import { parseDefaultPublicId } from 'services/typebots'
import { isWorkspaceProPlan } from 'services/workspace'
import { getViewerUrl, isDefined, isNotDefined } from 'utils'
import { CustomDomainsDropdown } from './customDomain/CustomDomainsDropdown'
import { EditableUrl } from './EditableUrl'
import { integrationsList } from './integrations/EmbedButton'
import { isPublicDomainAvailableQuery } from './queries/isPublicDomainAvailableQuery'

export const ShareContent = () => {
  const { workspace } = useWorkspace()
  const { typebot, updateTypebot } = useTypebot()
  const { showToast } = useToast()

  const handlePublicIdChange = async (publicId: string) => {
    if (publicId === typebot?.publicId) return
    if (publicId.length < 4)
      return showToast({ description: 'ID must be longer than 4 characters' })

    const { data } = await isPublicDomainAvailableQuery(publicId)
    if (!data?.isAvailable)
      return showToast({ description: 'ID is already taken' })

    updateTypebot({ publicId })
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

  const handleCustomDomainChange = (customDomain: string | undefined) =>
    updateTypebot({ customDomain })

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
                getViewerUrl({ isBuilder: true }) ?? 'https://typebot.io'
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
                onClick={() => handleCustomDomainChange(undefined)}
              />
            </HStack>
          )}
          {isNotDefined(typebot?.customDomain) ? (
            <>
              {isWorkspaceProPlan(workspace) ? (
                <CustomDomainsDropdown
                  onCustomDomainSelect={handleCustomDomainChange}
                />
              ) : (
                <UpgradeButton
                  colorScheme="gray"
                  limitReachedType={LimitReached.CUSTOM_DOMAIN}
                >
                  <Text mr="2">Add my domain</Text> <LockTag plan={Plan.PRO} />
                </UpgradeButton>
              )}
            </>
          ) : null}
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
