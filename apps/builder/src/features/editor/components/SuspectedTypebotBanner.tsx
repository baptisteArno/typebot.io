import { TextLink } from '@/components/TextLink'
import { useUser } from '@/features/account/hooks/useUser'
import { HStack, Text } from '@chakra-ui/react'

type Props = {
  typebotId: string
}
export const SuspectedTypebotBanner = ({ typebotId }: Props) => {
  const { user } = useUser()

  if (!user?.email) return null

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
      </Text>
    </HStack>
  )
}
