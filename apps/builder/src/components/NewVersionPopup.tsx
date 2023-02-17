import { useTypebot } from '@/features/editor'
import { Button, Flex, HStack, Stack, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { sendRequest } from 'utils'
import { PackageIcon } from './icons'

const intervalDuration = 1000 * 60 // 30 seconds

export const NewVersionPopup = () => {
  const { typebot, save } = useTypebot()
  const [currentVersion, setCurrentVersion] = useState<string>()
  const [isNewVersionAvailable, setIsNewVersionAvailable] = useState(false)
  const [isReloading, setIsReloading] = useState(false)

  useEffect(() => {
    if (isNewVersionAvailable) return
    let cancelRequest = false
    const interval = setInterval(async () => {
      const { data } = await sendRequest<{
        commitSha: string | undefined
      }>('/api/version')
      if (!data || cancelRequest) return
      if (!currentVersion) {
        setCurrentVersion(data.commitSha)
        return
      }
      if (currentVersion !== data.commitSha) {
        setIsNewVersionAvailable(true)
      }
    }, intervalDuration)

    return () => {
      cancelRequest = true
      clearInterval(interval)
    }
  }, [currentVersion, isNewVersionAvailable])

  const saveAndReload = async () => {
    if (isReloading) return
    setIsReloading(true)
    if (save) await save()
    window.location.reload()
  }

  if (!isNewVersionAvailable) return null

  return (
    <Stack
      pos="fixed"
      bottom="18px"
      left="18px"
      bgColor="blue.400"
      p="4"
      px="4"
      rounded="lg"
      shadow="lg"
      zIndex={10}
      borderWidth="1px"
      borderColor="blue.300"
      maxW="320px"
    >
      <HStack spacing={3}>
        <Stack spacing={4}>
          <Stack spacing={1} color="white">
            <HStack>
              <PackageIcon />{' '}
              <Text fontWeight="bold">New version available!</Text>
            </HStack>

            <Text fontSize="sm" color="gray.100">
              An improved version of Typebot is available. Please reload now to
              upgrade.
            </Text>
          </Stack>
          <Flex justifyContent="flex-end">
            <Button size="sm" onClick={saveAndReload}>
              {typebot?.id ? 'Save and reload' : 'Reload'}
            </Button>
          </Flex>
        </Stack>
      </HStack>
    </Stack>
  )
}
