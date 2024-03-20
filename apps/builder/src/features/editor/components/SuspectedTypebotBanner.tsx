import { TextLink } from '@/components/TextLink'
import { useUser } from '@/features/account/hooks/useUser'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { HStack, Text } from '@chakra-ui/react'
import { Plan } from '@typebot.io/prisma'

type Props = {
  typebotId: string
}
export const SuspectedTypebotBanner = ({ typebotId }: Props) => {
  const { user } = useUser()
  const { workspace } = useWorkspace()

  if (!user?.email || !workspace) return null

  return (
    <HStack
      bgColor="red.500"
      w="full"
      zIndex={1000}
      color="white"
      justifyContent="center"
      fontSize="sm"
      textAlign="center"
      py="2"
    >
      <Text fontWeight="bold">
        Our anti-scam system flagged your typebot. It is currently being
        reviewed manually.
        {workspace?.plan !== Plan.FREE ? (
          <>
            <br />
            If you think that&apos;s a mistake,{' '}
            <TextLink
              href={`https://typebot.co/claim-non-scam?Email=${encodeURIComponent(
                user.email
              )}&typebotId=${typebotId}`}
            >
              contact us
            </TextLink>
            .
          </>
        ) : null}
      </Text>
    </HStack>
  )
}
