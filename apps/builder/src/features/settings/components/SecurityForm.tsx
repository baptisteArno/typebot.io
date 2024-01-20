import { FormControl, FormLabel, Stack } from '@chakra-ui/react'
import { Settings } from '@typebot.io/schemas'
import React from 'react'
import { isDefined } from '@typebot.io/lib'
import { TextInput } from '@/components/inputs'
import { env } from '@typebot.io/env'
import { MoreInfoTooltip } from '@/components/MoreInfoTooltip'
import { PrimitiveList } from '@/components/PrimitiveList'

type Props = {
  security: Settings['security']
  onUpdate: (security: Settings['security']) => void
}

export const SecurityForm = ({ security, onUpdate }: Props) => {
  const updateItems = (items: string[]) => {
    if (items.length === 0) onUpdate(undefined)
    onUpdate({
      allowedOrigins: items.filter(isDefined),
    })
  }

  return (
    <Stack spacing={6}>
      <FormControl>
        <FormLabel display="flex" flexShrink={0} gap="1" mr="0" mb="4">
          Allowed origins
          <MoreInfoTooltip>
            Restrict the execution of your typebot to specific website origins.
            By default your bot can be executed on any website.
          </MoreInfoTooltip>
        </FormLabel>
        <PrimitiveList
          initialItems={security?.allowedOrigins}
          onItemsChange={updateItems}
          addLabel="Add URL"
        >
          {({ item, onItemChange }) => (
            <TextInput
              width="full"
              defaultValue={item}
              onChange={onItemChange}
              placeholder={env.NEXT_PUBLIC_VIEWER_URL[0]}
            />
          )}
        </PrimitiveList>
      </FormControl>
    </Stack>
  )
}
