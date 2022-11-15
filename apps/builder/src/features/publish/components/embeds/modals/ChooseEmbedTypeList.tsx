import { HStack, Button, Text, Stack } from '@chakra-ui/react'

type ChooseEmbedTypeListProps = {
  onSelectEmbedType: (type: 'standard' | 'popup' | 'bubble') => void
  disabledTypes?: ('standard' | 'popup' | 'bubble')[]
}

export const ChooseEmbedTypeList = ({
  onSelectEmbedType,
  disabledTypes = [],
}: ChooseEmbedTypeListProps) => {
  return (
    <HStack mx="auto">
      <Stack
        as={Button}
        fontWeight="normal"
        alignItems="center"
        variant="outline"
        colorScheme="gray"
        style={{ width: '225px', height: '270px' }}
        onClick={() => onSelectEmbedType('standard')}
        whiteSpace={'normal'}
        spacing="6"
        isDisabled={disabledTypes.includes('standard')}
      >
        <StandardEmbedSvg />
        <Stack>
          <Text fontSize="lg" fontWeight="semibold">
            Standard
          </Text>
          <Text textColor="gray.500">Embed in a container on your site</Text>
        </Stack>
      </Stack>
      <Stack
        as={Button}
        fontWeight="normal"
        alignItems="center"
        variant="outline"
        colorScheme="gray"
        style={{ width: '225px', height: '270px' }}
        onClick={() => onSelectEmbedType('popup')}
        whiteSpace={'normal'}
        spacing="6"
        isDisabled={disabledTypes.includes('popup')}
      >
        <PopupEmbedSvg />
        <Stack>
          <Text fontSize="lg" fontWeight="semibold">
            Popup
          </Text>
          <Text textColor="gray.500">
            Embed in a popup window on top of your website
          </Text>
        </Stack>
      </Stack>
      <Stack
        as={Button}
        fontWeight="normal"
        alignItems="center"
        variant="outline"
        colorScheme="gray"
        style={{ width: '225px', height: '270px' }}
        onClick={() => onSelectEmbedType('bubble')}
        whiteSpace={'normal'}
        spacing="6"
        isDisabled={disabledTypes.includes('bubble')}
      >
        <BubbleEmbedSvg />
        <Stack>
          <Text fontSize="lg" fontWeight="semibold">
            Bubble
          </Text>
          <Text textColor="gray.500">
            Embed in a chat bubble on the corner of your site
          </Text>
        </Stack>
      </Stack>
    </HStack>
  )
}

const StandardEmbedSvg = () => (
  <svg
    width="100"
    height="100"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="100" height="100" rx="5" fill="#0042DA" />
    <rect x="10" y="28" width="80" height="42" rx="6" fill="#FF8E20" />
    <circle cx="18" cy="37" r="5" fill="white" />
    <rect x="24" y="33" width="45" height="8" rx="4" fill="white" />
    <circle cx="18" cy="61" r="5" fill="white" />
    <rect x="24" y="57" width="45" height="8" rx="4" fill="white" />
    <rect x="31" y="45" width="45" height="8" rx="4" fill="white" />
    <circle cx="82" cy="49" r="5" fill="white" />
    <rect x="10" y="9" width="80" height="1" rx="0.5" fill="white" />
    <rect x="10" y="14" width="80" height="1" rx="0.5" fill="white" />
    <rect x="10" y="19" width="80" height="1" rx="0.5" fill="white" />
    <rect x="10" y="80" width="80" height="1" rx="0.5" fill="white" />
    <rect x="10" y="85" width="80" height="1" rx="0.5" fill="white" />
    <rect x="10" y="90" width="80" height="1" rx="0.5" fill="white" />
  </svg>
)

const PopupEmbedSvg = () => (
  <svg
    width="100"
    height="100"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="100" height="100" rx="5" fill="#0042DA" />
    <rect x="19" y="20" width="63" height="63" rx="6" fill="#FF8E20" />
    <circle cx="25.7719" cy="33.7719" r="3.77193" fill="white" />
    <rect x="31" y="30" width="27" height="8" rx="4" fill="white" />
    <circle
      r="3.77193"
      transform="matrix(-1 0 0 1 75.2281 43.7719)"
      fill="white"
    />
    <rect
      width="22"
      height="8"
      rx="4"
      transform="matrix(-1 0 0 1 70 40)"
      fill="white"
    />
    <rect
      x="31.0527"
      y="52"
      width="26.9473"
      height="7.54386"
      rx="3.77193"
      fill="white"
    />
    <circle cx="25.7719" cy="67.7719" r="3.77193" fill="white" />
    <rect x="31" y="64" width="27" height="8" rx="4" fill="white" />
  </svg>
)

const BubbleEmbedSvg = () => (
  <svg
    width="100"
    height="100"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="100" height="100" rx="5" fill="#0042DA" />
    <circle cx="85.5" cy="85.5" r="7.5" fill="#FF8E20" />
  </svg>
)
