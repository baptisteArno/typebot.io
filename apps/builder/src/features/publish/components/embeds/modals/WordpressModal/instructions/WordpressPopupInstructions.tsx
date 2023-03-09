import { CodeEditor } from '@/components/inputs/CodeEditor'
import { ExternalLinkIcon } from '@/components/icons'
import {
  OrderedList,
  ListItem,
  useColorModeValue,
  Link,
  Stack,
  Text,
} from '@chakra-ui/react'
import { useState } from 'react'
import { PopupSettings } from '../../../settings/PopupSettings'
import { parseInitPopupCode } from '../../../snippetParsers/popup'
import { isCloudProdInstance } from '@/utils/helpers'
import { env, getViewerUrl } from 'utils'

type Props = {
  publicId: string
}
export const WordpressPopupInstructions = ({ publicId }: Props) => {
  const [autoShowDelay, setAutoShowDelay] = useState<number>()

  const initCode = parseInitPopupCode({
    typebot: publicId,
    apiHost: isCloudProdInstance
      ? undefined
      : env('VIEWER_INTERNAL_URL') ?? getViewerUrl(),
    autoShowDelay,
  })

  return (
    <OrderedList spacing={4} pl={5}>
      <ListItem>
        Install{' '}
        <Link
          href="https://wordpress.org/plugins/typebot/"
          isExternal
          color={useColorModeValue('blue.500', 'blue.300')}
        >
          the official Typebot WordPress plugin
          <ExternalLinkIcon mx="2px" />
        </Link>
      </ListItem>
      <ListItem>
        <Stack spacing={4}>
          <PopupSettings
            onUpdateSettings={(settings) =>
              setAutoShowDelay(settings.autoShowDelay)
            }
          />
          <Text>
            You can now place the following code snippet in the Typebot panel in
            your WordPress admin:
          </Text>
          <CodeEditor value={initCode} lang="javascript" isReadOnly />
        </Stack>
      </ListItem>
    </OrderedList>
  )
}
