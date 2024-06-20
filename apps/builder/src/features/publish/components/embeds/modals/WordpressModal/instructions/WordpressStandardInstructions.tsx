import { CodeEditor } from '@/components/inputs/CodeEditor'
import { ExternalLinkIcon } from '@/components/icons'
import {
  OrderedList,
  ListItem,
  useColorModeValue,
  Link,
  Stack,
  Text,
  Code,
} from '@chakra-ui/react'
import { useState } from 'react'
import { StandardSettings } from '../../../settings/StandardSettings'
import { isCloudProdInstance } from '@/helpers/isCloudProdInstance'
import { env } from '@sniper.io/env'
import packageJson from '../../../../../../../../../../packages/embeds/js/package.json'

type Props = {
  publicId: string
}

export const WordpressStandardInstructions = ({ publicId }: Props) => {
  const [windowSizes, setWindowSizes] = useState<{
    width?: string
    height: string
  }>({
    height: '100%',
    width: '100%',
  })

  const elementCode = parseWordpressShortcode({ ...windowSizes, publicId })

  return (
    <OrderedList spacing={4} pl={5}>
      <ListItem>
        Install{' '}
        <Link
          href="https://wordpress.org/plugins/sniper/"
          isExternal
          color={useColorModeValue('blue.500', 'blue.300')}
        >
          the official Sniper WordPress plugin
          <ExternalLinkIcon mx="2px" />
        </Link>
      </ListItem>
      <ListItem>
        <Stack spacing={4}>
          <StandardSettings
            onUpdateWindowSettings={(sizes) =>
              setWindowSizes({
                height: sizes.heightLabel,
                width: sizes.widthLabel,
              })
            }
          />
          <Text>
            You can now place the following shortcode anywhere on your site:
          </Text>
          <CodeEditor value={elementCode} lang="shell" isReadOnly />
          <Text>
            Note: Your page templating system probably has a{' '}
            <Code>Shortcode</Code> element (if not, use a text element).
          </Text>
        </Stack>
      </ListItem>
    </OrderedList>
  )
}

const parseWordpressShortcode = ({
  width,
  height,
  publicId,
}: {
  width?: string
  height?: string
  publicId: string
}) => {
  return `[sniper sniper="${publicId}"${
    isCloudProdInstance()
      ? ''
      : ` host="${env.NEXT_PUBLIC_VIEWER_URL[0]}" lib_version="${packageJson.version}"`
  }${width ? ` width="${width}"` : ''}${height ? ` height="${height}"` : ''}]
`
}
