import { TrashIcon } from '@/components/icons'
import { Seo } from '@/components/Seo'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { useToast } from '@/hooks/useToast'
import { isCloudProdInstance } from '@/helpers/isCloudProdInstance'
import {
  Flex,
  Heading,
  HStack,
  IconButton,
  Stack,
  Wrap,
  Text,
} from '@chakra-ui/react'
import { Plan } from '@sniper.io/prisma'
import { isDefined, isNotDefined } from '@sniper.io/lib'
import { isPublicDomainAvailableQuery } from '../queries/isPublicDomainAvailableQuery'
import { EditableUrl } from './EditableUrl'
import { integrationsList } from './embeds/EmbedButton'
import { useSniper } from '@/features/editor/providers/SniperProvider'
import { LockTag } from '@/features/billing/components/LockTag'
import { UpgradeButton } from '@/features/billing/components/UpgradeButton'
import { hasProPerks } from '@/features/billing/helpers/hasProPerks'
import { CustomDomainsDropdown } from '@/features/customDomains/components/CustomDomainsDropdown'
import { SniperHeader } from '@/features/editor/components/SniperHeader'
import { parseDefaultPublicId } from '../helpers/parseDefaultPublicId'
import { useTranslate } from '@tolgee/react'
import { env } from '@sniper.io/env'
import DomainStatusIcon from '@/features/customDomains/components/DomainStatusIcon'
import { SniperNotFoundPage } from '@/features/editor/components/SniperNotFoundPage'
import { VideoEmbed } from '@/features/onboarding/components/VideoEmbed'

export const SharePage = () => {
  const { t } = useTranslate()
  const { workspace } = useWorkspace()
  const { sniper, updateSniper, publishedSniper, is404 } = useSniper()
  const { showToast } = useToast()

  const handlePublicIdChange = async (publicId: string) => {
    updateSniper({ updates: { publicId }, save: true })
  }

  const publicId = sniper
    ? sniper?.publicId ?? parseDefaultPublicId(sniper.name, sniper.id)
    : ''
  const isPublished = isDefined(publishedSniper)

  const handlePathnameChange = (pathname: string) => {
    if (!sniper?.customDomain) return
    const existingHost = sniper.customDomain?.split('/')[0]
    const newDomain =
      pathname === '' ? existingHost : existingHost + '/' + pathname
    handleCustomDomainChange(newDomain)
  }

  const handleCustomDomainChange = (customDomain: string | null) =>
    updateSniper({ updates: { customDomain }, save: true })

  const checkIfPathnameIsValid = (pathname: string) => {
    const isCorrectlyFormatted =
      /^([a-z0-9]+-[a-z0-9]*)*$/.test(pathname) || /^[a-z0-9]*$/.test(pathname)

    if (!isCorrectlyFormatted) {
      showToast({
        description: t('share.errors.invalidPathname'),
      })
      return false
    }
    return true
  }

  const checkIfPublicIdIsValid = async (publicId: string) => {
    const isLongerThanAllowed = publicId.length >= 4
    if (!isLongerThanAllowed && isCloudProdInstance()) {
      showToast({
        description: t('share.errors.invalidPublicId'),
      })
      return false
    }

    if (!checkIfPathnameIsValid(publicId)) return false

    const { data } = await isPublicDomainAvailableQuery(publicId)
    if (!data?.isAvailable) {
      showToast({ description: t('share.errors.domainTaken') })
      return false
    }

    return true
  }

  if (is404) return <SniperNotFoundPage />
  return (
    <Flex flexDir="column" pb="40">
      <Seo title={sniper?.name ? `${sniper.name} | Share` : 'Share'} />
      <SniperHeader />
      <Flex h="full" w="full" justifyContent="center" align="flex-start">
        <Stack maxW="1000px" w="full" pt="10" spacing={10}>
          <Stack spacing={4} align="flex-start">
            <Heading fontSize="2xl" as="h1">
              {t('share.heading.link')}
            </Heading>
            {sniper && (
              <EditableUrl
                hostname={env.NEXT_PUBLIC_VIEWER_URL[0]}
                pathname={publicId}
                isValid={checkIfPublicIdIsValid}
                onPathnameChange={handlePublicIdChange}
              />
            )}
            {sniper?.customDomain && (
              <HStack>
                <EditableUrl
                  hostname={'https://' + sniper.customDomain.split('/')[0]}
                  pathname={sniper.customDomain.split('/')[1]}
                  isValid={checkIfPathnameIsValid}
                  onPathnameChange={handlePathnameChange}
                />
                <IconButton
                  icon={<TrashIcon />}
                  aria-label={t('share.removeCustomDomain')}
                  size="xs"
                  onClick={() => handleCustomDomainChange(null)}
                />
                {workspace?.id && (
                  <DomainStatusIcon
                    domain={sniper.customDomain.split('/')[0]}
                    workspaceId={workspace.id}
                  />
                )}
              </HStack>
            )}
            {isNotDefined(sniper?.customDomain) &&
            env.NEXT_PUBLIC_VERCEL_VIEWER_PROJECT_NAME ? (
              <>
                {hasProPerks(workspace) ? (
                  <CustomDomainsDropdown
                    onCustomDomainSelect={handleCustomDomainChange}
                  />
                ) : (
                  <UpgradeButton
                    colorScheme="gray"
                    limitReachedType={t('billing.limitMessage.customDomain')}
                    excludedPlans={[Plan.STARTER]}
                  >
                    <Text mr="2">{t('share.heading.addCustomDomain')}</Text>{' '}
                    <LockTag plan={Plan.PRO} />
                  </UpgradeButton>
                )}
              </>
            ) : null}
          </Stack>
          <Stack spacing={4} align="flex-start">
            <Heading fontSize="2xl" as="h1">
              {t('share.heading.integration.qiplus')}
            </Heading>
            <Wrap spacing={7}>
              <VideoEmbed type="editor" />
            </Wrap>
          </Stack>
          <Stack spacing={4}>
            <Heading fontSize="2xl" as="h1">
              {t('share.heading.embed')}
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
