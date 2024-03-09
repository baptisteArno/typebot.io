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
  Button,
  Tag,
  TagLabel,
} from '@chakra-ui/react'
import { Plan } from '@typebot.io/prisma'
import { isDefined, isNotDefined } from '@typebot.io/lib'
import { isPublicDomainAvailableQuery } from '../queries/isPublicDomainAvailableQuery'
import { EditableUrl } from './EditableUrl'
import { integrationsList } from './embeds/EmbedButton'
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
import { useEffect, useState } from 'react'
import { PasswordInput } from './PasswordInput'
import { LockedIcon, UnlockedIcon } from '@/components/icons'
import { TypebotV6 } from '@typebot.io/schemas/features/typebot'

export const SharePage = () => {
  const { t } = useTranslate()
  const { workspace } = useWorkspace()
  const { typebot, updateTypebot, publishedTypebot, is404 } = useTypebot()
  const { showToast } = useToast()
  const [isPasswordProtected, setIsPasswordProtected] = useState(false)

  useEffect(() => {
    if (typebot) {
      setIsPasswordProtected(!!typebot.settings.security?.password)
    }
  }, [typebot])

  const handlePublicIdChange = async (publicId: string) => {
    updateTypebot({ updates: { publicId }, save: true })
  }

  const publicId = typebot
    ? typebot?.publicId ?? parseDefaultPublicId(typebot.name, typebot.id)
    : ''
  const isPublished = isDefined(publishedTypebot)

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

  const togglePasswordProtection = (state: boolean) => {
    setIsPasswordProtected(state)
    if (state === false) deletePassword()
  }

  const updatePassword = (
    updatedPassword: string
  ): Promise<TypebotV6 | undefined> => {
    return updateTypebot({
      updates: { settings: { security: { password: updatedPassword } } },
      save: true,
    })
  }

  const deletePassword = () => {
    updateTypebot({
      updates: { settings: { security: { password: '' } } },
      save: true,
    })
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
              {t('share.page.link')}
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

            <Stack mt="3">
              <HStack spacing={3} mb={3}>
                <Heading fontSize="2xl" as="h1">
                  {t('share.page.password')}
                </Heading>
                <Tag size="sm" colorScheme="purple" borderRadius="full">
                  <TagLabel>Beta</TagLabel>
                </Tag>
              </HStack>

              {isPublished ? (
                <>
                  {isPasswordProtected ? (
                    <Stack>
                      <Button
                        onClick={() => togglePasswordProtection(false)}
                        w="fit-content"
                        colorScheme="red"
                      >
                        <UnlockedIcon mr="3" />
                        {t('share.page.password.disable')}
                      </Button>
                      <PasswordInput
                        updatePassword={updatePassword}
                        existingPassword={
                          typebot?.settings.security?.password
                            ? typebot?.settings.security?.password
                            : undefined
                        }
                      />
                    </Stack>
                  ) : (
                    <Button
                      onClick={() => togglePasswordProtection(true)}
                      w="fit-content"
                    >
                      <LockedIcon mr="3" />
                      {t('share.page.password.enable')}
                    </Button>
                  )}
                </>
              ) : (
                <div>{t('share.page.password.publishBeforeEnable')}</div>
              )}
            </Stack>
          </Stack>

          <Stack spacing={4}>
            <Heading fontSize="2xl" as="h1">
              {t('share.page.embed')}
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
