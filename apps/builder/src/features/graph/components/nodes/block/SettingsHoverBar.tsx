import { BuoyIcon, ExpandIcon } from '@/components/icons'
import {
  Button,
  HStack,
  IconButton,
  Link,
  useColorModeValue,
} from '@chakra-ui/react'
import { BlockWithOptions } from '@typebot.io/schemas'
import { getHelpDocUrl } from '@/features/graph/helpers/getHelpDocUrl'
import { useTranslate } from '@tolgee/react'
import { VideoOnboardingPopover } from '@/features/onboarding/components/VideoOnboardingPopover'
import { forgedBlocks } from '@typebot.io/forge-repository/definitions'

type Props = {
  blockType: BlockWithOptions['type']
  blockDef?: (typeof forgedBlocks)[keyof typeof forgedBlocks]
  isVideoOnboardingItemDisplayed: boolean
  onExpandClick: () => void
  onVideoOnboardingClick: () => void
}

export const SettingsHoverBar = ({
  blockType,
  blockDef,
  isVideoOnboardingItemDisplayed,
  onExpandClick,
  onVideoOnboardingClick,
}: Props) => {
  const { t } = useTranslate()
  const helpDocUrl = getHelpDocUrl(blockType, blockDef)
  return (
    <HStack
      rounded="md"
      spacing={0}
      borderWidth="1px"
      bgColor={useColorModeValue('white', 'gray.800')}
      shadow="md"
    >
      <IconButton
        icon={<ExpandIcon />}
        borderRightWidth="1px"
        borderRightRadius="none"
        borderLeftRadius="none"
        aria-label={'Duplicate group'}
        variant="ghost"
        onClick={onExpandClick}
        size="xs"
      />
      {helpDocUrl && (
        <Button
          as={Link}
          leftIcon={<BuoyIcon />}
          borderLeftRadius="none"
          borderRightRadius={
            isVideoOnboardingItemDisplayed ? 'none' : undefined
          }
          borderRightWidth={isVideoOnboardingItemDisplayed ? '1px' : undefined}
          size="xs"
          variant="ghost"
          href={helpDocUrl}
          isExternal
        >
          {t('help')}
        </Button>
      )}
      {isVideoOnboardingItemDisplayed && (
        <VideoOnboardingPopover.TriggerIconButton
          onClick={onVideoOnboardingClick}
          size="xs"
          borderLeftRadius="none"
        />
      )}
    </HStack>
  )
}
