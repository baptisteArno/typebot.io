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
  Text,
  Wrap,
} from '@chakra-ui/react'
import { Plan } from '@typebot.io/prisma'
import { isNotDefined } from '@typebot.io/lib'
import { isPublicDomainAvailableQuery } from '../queries/isPublicDomainAvailableQuery'
import { EditableUrl } from './EditableUrl'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { LockTag } from '@/features/billing/components/LockTag'
import { UpgradeButton } from '@/features/billing/components/UpgradeButton'
import { hasProPerks } from '@/features/billing/helpers/hasProPerks'
import { CustomDomainsDropdown } from '@/features/customDomains/components/CustomDomainsDropdown'
import { TypebotHeader } from '@/features/editor/components/TypebotHeader'
import { parseDefaultPublicId } from '../helpers/parseDefaultPublicId'
import { useTranslate } from '@tolgee/react'
import { env } from '@typebot.io/env'
import DomainStatusIcon from '@/features/customDomains/components/DomainStatusIcon'
import { TypebotNotFoundPage } from '@/features/editor/components/TypebotNotFoundPage'
import { integrationsList } from './embeds/EmbedButton'
import { isPublished as isPublishedHelper } from '../helpers/isPublished'
import { trpc } from '@/lib/trpc'
import { useEffect } from 'react'

export const SharePage = () => {
  const { t } = useTranslate()
  const { workspace } = useWorkspace()
  const { typebot, updateTypebot, is404, publishedTypebot } = useTypebot()
  const { showToast } = useToast()

  const isPublished =
    typebot && publishedTypebot
      ? isPublishedHelper(typebot, publishedTypebot)
      : false

  // Auto-unpublish mutation
  const { mutate: unpublishTypebotMutate } =
    trpc.typebot.unpublishTypebot.useMutation({
      onError: (error) => {
        showToast({
          title: 'Auto-unpublish failed',
          description: error.message,
        })
      },
      onSuccess: () => {
        showToast({
          title: 'Typebot Auto-Unpublished',
          description:
            'Typebot has been automatically unpublished due to exceeding group limits.',
        })
        // Refresh the page to reflect the unpublished state
        window.location.reload()
      },
    })

  // Function to check group limits and auto-unpublish if needed
  const checkAndAutoUnpublish = async () => {
    if (!typebot || !workspace || !typebot.publicId) return

    try {
      const { shouldUnpublishTypebot } = await import('@typebot.io/lib')
      const shouldUnpublish = await shouldUnpublishTypebot(
        workspace.id,
        typebot.groups.length
      )

      if (shouldUnpublish) {
        console.log(
          `Auto-unpublishing typebot ${typebot.id} due to group limit exceeded`
        )
        unpublishTypebotMutate({ typebotId: typebot.id })
      }
    } catch (error) {
      console.error('Failed to check group limits for auto-unpublish:', error)
    }
  }

  // Check group limits when component mounts or when typebot/workspace changes
  useEffect(() => {
    if (typebot && workspace && typebot.publicId) {
      checkAndAutoUnpublish()
    }
  }, [typebot, workspace])

  // Continuous monitoring for group limit changes
  useEffect(() => {
    if (!typebot || !workspace || !typebot.publicId) return

    const checkInterval = setInterval(() => {
      checkAndAutoUnpublish()
    }, 30000) // Check every 30 seconds

    return () => clearInterval(checkInterval)
  }, [typebot, workspace])

  const handlePublicIdChange = async (publicId: string) => {
    updateTypebot({ updates: { publicId }, save: true })
  }

  const publicId = typebot
    ? typebot?.publicId ?? parseDefaultPublicId(typebot.name, typebot.id)
    : ''

  const handlePathnameChange = (pathname: string) => {
    if (!typebot?.customDomain) return
    const existingHost = typebot.customDomain?.split('/')[0]
    const newDomain =
      pathname === '' ? existingHost : existingHost + '/' + pathname
    handleCustomDomainChange(newDomain)
  }

  const handleCustomDomainChange = (customDomain: string | null) =>
    updateTypebot({ updates: { customDomain }, save: true })

  const checkIfPathnameIsValid = (pathname: string) => {
    const isCorrectlyFormatted =
      /^([a-z0-9]+-[a-z0-9]*)*$/.test(pathname) || /^[a-z0-9]*$/.test(pathname)

    if (!isCorrectlyFormatted) {
      showToast({
        description: 'Can only contain lowercase letters, numbers and dashes.',
      })
      return false
    }
    return true
  }

  const checkIfPublicIdIsValid = async (publicId: string) => {
    const isLongerThanAllowed = publicId.length >= 4
    if (!isLongerThanAllowed && isCloudProdInstance()) {
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

  if (is404) return <TypebotNotFoundPage />
  return (
    <Flex flexDir="column" pb="40">
      <Seo title={typebot?.name ? `${typebot.name} | Share` : 'Share'} />
      <TypebotHeader />
      <Flex h="full" w="full" justifyContent="center" align="flex-start">
        <Stack maxW="1000px" w="full" pt="10" spacing={10}>
          <Stack spacing={4} align="flex-start">
            <Heading fontSize="2xl" as="h1">
              Your typebot link
            </Heading>
            {typebot && (
              <EditableUrl
                hostname={env.NEXT_PUBLIC_VIEWER_URL[0]}
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
                  aria-label="Remove custom URL"
                  size="xs"
                  onClick={() => handleCustomDomainChange(null)}
                />
                {workspace?.id && (
                  <DomainStatusIcon
                    domain={typebot.customDomain.split('/')[0]}
                    workspaceId={workspace.id}
                  />
                )}
              </HStack>
            )}
            {isNotDefined(typebot?.customDomain) &&
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
                    <Text mr="2">Add my domain</Text>{' '}
                    <LockTag plan={Plan.PRO} />
                  </UpgradeButton>
                )}
              </>
            ) : null}
          </Stack>

          <Stack spacing={6} align="flex-start">
            <Heading fontSize="2xl" as="h2">
              Integrations
            </Heading>
            <Text color="gray.500">
              Choose your platform to get specific embedding instructions
            </Text>
            <Wrap spacing={4}>
              {integrationsList.map((IntegrationComponent, index) => (
                <IntegrationComponent
                  key={index}
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
