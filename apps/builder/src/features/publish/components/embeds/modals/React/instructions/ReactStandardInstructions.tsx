import { ListItem, OrderedList, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { StandardSettings } from '../../../settings/StandardSettings'
import { InstallReactPackageSnippet } from '../InstallReactPackageSnippet'
import { ReactStandardSnippet } from '../ReactStandardSnippet'

export const ReactStandardInstructions = () => {
  const [inputValues, setInputValues] = useState<{
    widthLabel?: string
    heightLabel: string
  }>({
    heightLabel: '100%',
    widthLabel: '100%',
  })

  return (
    <OrderedList spacing={4} pl={5}>
      <ListItem>
        <Stack spacing={4}>
          <Text>Install the packages</Text>
          <InstallReactPackageSnippet />
        </Stack>
      </ListItem>
      <ListItem>
        <Stack spacing={4}>
          <StandardSettings
            onUpdateWindowSettings={(settings) =>
              setInputValues({ ...settings })
            }
          />
          <ReactStandardSnippet {...inputValues} />
        </Stack>
      </ListItem>
    </OrderedList>
  )
}
