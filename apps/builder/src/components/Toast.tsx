import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Flex,
  HStack,
  IconButton,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import { AlertIcon, CloseIcon, InfoIcon, SmileIcon } from './icons'
import { CodeEditor } from './inputs/CodeEditor'
import { LanguageName } from '@uiw/codemirror-extensions-langs'

export type ToastProps = {
  title?: string
  description?: string
  details?: {
    content: string
    lang: LanguageName
  }
  status?: 'info' | 'error' | 'success'
  icon?: React.ReactNode
  primaryButton?: React.ReactNode
  secondaryButton?: React.ReactNode
  onClose: () => void
}

export const Toast = ({
  status = 'error',
  title,
  description,
  details,
  icon,
  primaryButton,
  secondaryButton,
  onClose,
}: ToastProps) => {
  const bgColor = useColorModeValue('white', 'gray.800')
  const detailsLabelColor = useColorModeValue('gray.600', 'gray.400')

  return (
    <Flex
      p={3}
      rounded="md"
      bgColor={bgColor}
      borderWidth="1px"
      shadow="sm"
      fontSize="sm"
      pos="relative"
      maxW={details ? '450px' : '300px'}
    >
      <HStack alignItems="flex-start" pr="7" spacing="3" w="full">
        <Icon customIcon={icon} status={status} />{' '}
        <Stack spacing={3} flex="1" justify="center" h="full">
          <Stack spacing={1}>
            {title && <Text fontWeight="semibold">{title}</Text>}
            {description && <Text>{description}</Text>}
          </Stack>

          {details && (
            <Accordion allowToggle>
              <AccordionItem>
                <AccordionButton
                  justifyContent="space-between"
                  fontSize="sm"
                  py="1"
                  color={detailsLabelColor}
                >
                  Details
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>
                  <CodeEditor
                    isReadOnly
                    value={details.content}
                    lang={details.lang}
                    minWidth="300px"
                    maxHeight="200px"
                    maxWidth="calc(450px - 100px)"
                  />
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          )}
          {(secondaryButton || primaryButton) && (
            <HStack>
              {secondaryButton}
              {primaryButton}
            </HStack>
          )}
        </Stack>
      </HStack>

      <IconButton
        aria-label="Close"
        icon={<CloseIcon />}
        size="sm"
        onClick={onClose}
        variant="ghost"
        pos="absolute"
        top={1}
        right={1}
      />
    </Flex>
  )
}

const Icon = ({
  customIcon,
  status,
}: {
  customIcon?: React.ReactNode
  status: ToastProps['status']
}) => {
  const accentColor = useColorModeValue('50', '0')
  const color = parseColor(status)
  const icon = parseIcon(status, customIcon)
  return (
    <Flex
      bgColor={`${color}.${accentColor}`}
      boxSize="40px"
      justifyContent="center"
      alignItems="center"
      rounded="full"
      flexShrink={0}
    >
      <Flex
        bgColor={`${color}.100`}
        boxSize="30px"
        justifyContent="center"
        alignItems="center"
        rounded="full"
        fontSize="18px"
        color={`${color}.600`}
      >
        {icon}
      </Flex>
    </Flex>
  )
}

const parseColor = (status: ToastProps['status']) => {
  if (!status) return 'red'
  switch (status) {
    case 'error':
      return 'red'
    case 'success':
      return 'green'
    case 'info':
      return 'blue'
  }
}

const parseIcon = (
  status: ToastProps['status'],
  customIcon?: React.ReactNode
) => {
  if (customIcon) return customIcon
  switch (status) {
    case 'error':
      return <AlertIcon />
    case 'success':
      return <SmileIcon />
    case 'info':
      return <InfoIcon />
  }
}
