import { EmojiOrImageIcon } from '@/components/EmojiOrImageIcon'
import { useSniper } from '@/features/editor/providers/SniperProvider'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { trpc } from '@/lib/trpc'
import { Text, HStack, Button, Stack } from '@chakra-ui/react'
// import { PlanTag } from '@/features/billing/components/PlanTag'
import { HardDriveIcon } from '@/components/icons'
import { useRouter } from 'next/router'
import { RadioButtons } from '@/components/inputs/RadioButtons'
import { useState } from 'react'

const Page = () => {
  const { push } = useRouter()
  const { sniper } = useSniper()
  const { workspaces } = useWorkspace()
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>()
  const { mutate, isLoading } = trpc.sniper.importSniper.useMutation({
    onSuccess: (data) => {
      push(`/snipers/${data.sniper.id}/edit`)
    },
  })

  const duplicateSniper = (workspaceId: string) => {
    mutate({ workspaceId, sniper })
  }

  const updateSelectedWorkspaceId = (workspaceId: string) => {
    setSelectedWorkspaceId(workspaceId)
  }

  return (
    <Stack
      w="full"
      justifyContent="center"
      pt="10"
      h="100vh"
      maxW="350px"
      mx="auto"
      spacing={4}
    >
      <Text>
        Choose a workspace to duplicate <strong>{sniper?.name}</strong> in:
      </Text>
      <RadioButtons
        direction="column"
        options={workspaces?.map((workspace) => ({
          value: workspace.id,
          label: (
            <HStack w="full">
              <EmojiOrImageIcon
                icon={workspace.icon}
                boxSize="16px"
                defaultIcon={HardDriveIcon}
              />
              <Text>{workspace.name}</Text>
              {/* <PlanTag plan={workspace.plan} /> */}
            </HStack>
          ),
        }))}
        value={selectedWorkspaceId}
        onSelect={updateSelectedWorkspaceId}
      />
      <Button
        isDisabled={!selectedWorkspaceId}
        onClick={() => duplicateSniper(selectedWorkspaceId as string)}
        isLoading={isLoading}
        colorScheme="blue"
        size="sm"
      >
        Duplicate
      </Button>
    </Stack>
  )
}

export default Page
