import { TrashIcon } from '@/components/icons'
import { Seo } from '@/components/Seo'
import {
  isProPlan,
  LimitReached,
  LockTag,
  UpgradeButton,
} from '@/features/billing'
import { CustomDomainsDropdown } from '@/features/customDomains'
import { TypebotHeader, useTypebot } from '@/features/editor'
import { useWorkspace } from '@/features/workspace'
import { useToast } from '@/hooks/useToast'
import { isCloudProdInstance } from '@/utils/helpers'
import {
  Flex,
  Heading,
  HStack,
  IconButton,
  Stack,
  Wrap,
  Text,
} from '@chakra-ui/react'
import { Plan } from 'db'
import { isDefined, getViewerUrl, isNotDefined } from 'utils'
import { isPublicDomainAvailableQuery } from '../queries/isPublicDomainAvailableQuery'
import { parseDefaultPublicId } from '../utils'
import { EditableUrl } from './EditableUrl'
import { integrationsList } from './embeds/EmbedButton'

export const SharePage = () => {
  const { workspace } = useWorkspace()
  const { typebot, updateTypebot } = useTypebot()
  const { showToast } = useToast()

  const handlePublicIdChange = async (publicId: string) => {
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

  const checkIfPathnameIsValid = (pathname: string) => {
    const isCorrectlyFormatted =
      /^([a-z0-9]+-[a-z0-9]+)*$/.test(pathname) || /^[a-z0-9]*$/.test(pathname)

    if (!isCorrectlyFormatted) {
      showToast({
        description:
          'Should contain only contain letters, numbers. Words can be separated by dashes.',
      })
      return false
    }
    return true
  }

  const checkIfPublicIdIsValid = async (publicId: string) => {
    const isLongerThanAllowed = publicId.length >= 4
    if (!isLongerThanAllowed && isCloudProdInstance) {
      showToast({
        description: 'Should be longer than 4 characters',
      })
      return false
    }

    if (!checkIfPathnameIsValid(publicId)) return false

    const { data } = await isPublicDomainAvailableQuery(publicId)
    if (!data?.isAvailable) {
      showToast({ description: 'ID is already taken' })
      return false
    }

    return true
  }

  return (
    <Flex flexDir="column" pb="40">
      <Seo title="Share" />
      <TypebotHeader />
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
                isValid={checkIfPublicIdIsValid}
                onPathnameChange={handlePublicIdChange}
              />
            )}
            {typebot?.customDomain && (
              <HStack>
                <EditableUrl
                  hostname={'https://' + typebot.customDomain.split('/')[0]}
                  pathname={typebot.customDomain.split('/')[1]}
                  isValid={checkIfPathnameIsValid}
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
                {isProPlan(workspace) ? (
                  <CustomDomainsDropdown
                    onCustomDomainSelect={handleCustomDomainChange}
                  />
                ) : (
                  <UpgradeButton
                    colorScheme="gray"
                    limitReachedType={LimitReached.CUSTOM_DOMAIN}
                  >
                    <Text mr="2">Add my domain</Text>{' '}
                    <LockTag plan={Plan.PRO} />
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
    </Flex>
  )
}
