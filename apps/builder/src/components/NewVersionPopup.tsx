import { useTypebot } from '@/features/editor'
import { HStack, Stack, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { sendRequest } from 'utils'
import { PackageIcon } from './icons'
import { MotionStack } from './MotionStack'

const intervalDuration = 1000 * 30 // 30 seconds

export const NewVersionPopup = () => {
  const { save } = useTypebot()
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
    <MotionStack
      pos="fixed"
      bottom="20px"
      left="20px"
      bgColor="blue.400"
      color="white"
      cursor="pointer"
      p="4"
      px="4"
      rounded="xl"
      shadow="lg"
      onClick={saveAndReload}
      zIndex={10}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      borderWidth="2px"
      borderColor="blue.300"
    >
      <HStack spacing={3}>
        <PackageIcon boxSize="32px" />
        <Stack spacing={0}>
          <Text fontWeight="bold">Typebot is ready to update!</Text>
          <Text fontSize="sm" color="gray.200">
            Click to restart
          </Text>
        </Stack>
      </HStack>
    </MotionStack>
  )
}
