import { useSniper } from '@/features/editor/providers/SniperProvider'
import { trpc } from '@/lib/trpc'
import {
  Button,
  DarkMode,
  Flex,
  HStack,
  SlideFade,
  Stack,
  Text,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { PackageIcon } from './icons'

export const NewVersionPopup = () => {
  const { sniper, save } = useSniper()
  const [isReloading, setIsReloading] = useState(false)
  const { data } = trpc.getAppVersionProcedure.useQuery()
  const [currentVersion, setCurrentVersion] = useState<string>()
  const [isNewVersionAvailable, setIsNewVersionAvailable] = useState(false)

  useEffect(() => {
    if (!data?.commitSha) return
    if (currentVersion === data.commitSha) return
    setCurrentVersion(data.commitSha)
    if (currentVersion === undefined) return
    setIsNewVersionAvailable(true)
  }, [data, currentVersion])

  const saveAndReload = async () => {
    if (isReloading) return
    setIsReloading(true)
    if (save) await save()
    window.location.reload()
  }

  return (
    <DarkMode>
      <SlideFade
        in={isNewVersionAvailable}
        offsetY="20px"
        style={{
          position: 'fixed',
          bottom: '18px',
          left: '18px',
          zIndex: 42,
        }}
        unmountOnExit
      >
        <Stack
          bgColor="blue.400"
          p="4"
          px="4"
          rounded="lg"
          shadow="lg"
          borderWidth="1px"
          borderColor="blue.300"
          maxW="320px"
        >
          <HStack spacing={3}>
            <Stack spacing={4} color="white">
              <Stack spacing={1}>
                <HStack>
                  <PackageIcon />{' '}
                  <Text fontWeight="bold">New version available!</Text>
                </HStack>

                <Text fontSize="sm" color="gray.100">
                  An improved version of Sniper is available. Please reload now
                  to upgrade.
                </Text>
              </Stack>
              <Flex justifyContent="flex-end">
                <Button size="sm" onClick={saveAndReload}>
                  {sniper?.id ? 'Save and reload' : 'Reload'}
                </Button>
              </Flex>
            </Stack>
          </HStack>
        </Stack>
      </SlideFade>
    </DarkMode>
  )
}
