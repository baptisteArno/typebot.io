import { Stack, useDisclosure } from '@chakra-ui/react'
import { BlockOptions } from '@typebot.io/schemas'
import { ForgedCredentialsDropdown } from './credentials/ForgedCredentialsDropdown'
import { ForgedCredentialsModal } from './credentials/ForgedCredentialsModal'
import { ZodObjectLayout } from './zodLayouts/ZodObjectLayout'
import { ZodActionDiscriminatedUnion } from './zodLayouts/ZodActionDiscriminatedUnion'
import { useForgedBlock } from '../hooks/useForgedBlock'
import { ForgedBlock } from '@typebot.io/forge-schemas'

type Props = {
  block: ForgedBlock
  onOptionsChange: (options: BlockOptions) => void
}
export const ForgedBlockSettings = ({ block, onOptionsChange }: Props) => {
  const { blockDef, blockSchema, actionDef } = useForgedBlock(
    block.type,
    block.options?.action
  )
  const { isOpen, onOpen, onClose } = useDisclosure()

  const updateCredentialsId = (credentialsId?: string) => {
    onOptionsChange({
      ...block.options,
      credentialsId,
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resetOptionsAction = (updates: any) => {
    if (!actionDef) return
    const actionOptionsKeys = Object.keys(actionDef.options?.shape ?? [])
    const actionOptions = actionOptionsKeys.reduce(
      (acc, key) => ({
        ...acc,
        [key]: undefined,
      }),
      {}
    )
    onOptionsChange({
      ...updates,
      ...actionOptions,
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateOptions = (updates: any) => {
    const isChangingAction =
      actionDef && updates?.action && updates.action !== block.options.action
    if (isChangingAction) {
      resetOptionsAction(updates)
      return
    }
    onOptionsChange(updates)
  }

  if (!blockDef || !blockSchema) return null
  return (
    <Stack spacing={4}>
      {blockDef.auth && (
        <>
          <ForgedCredentialsModal
            blockDef={blockDef}
            isOpen={isOpen}
            onClose={onClose}
            onNewCredentials={updateCredentialsId}
          />
          <ForgedCredentialsDropdown
            key={block.options?.credentialsId ?? 'none'}
            blockDef={blockDef}
            currentCredentialsId={block.options?.credentialsId}
            onCredentialsSelect={updateCredentialsId}
            onAddClick={onOpen}
          />
        </>
      )}
      {(block.options !== undefined || blockDef.auth === undefined) && (
        <>
          {blockDef.options && (
            <ZodObjectLayout
              schema={blockDef.options}
              data={block.options}
              blockOptions={block.options}
              blockDef={blockDef}
              onDataChange={onOptionsChange}
            />
          )}
          <ZodActionDiscriminatedUnion
            schema={blockSchema.shape.options}
            blockDef={blockDef}
            blockOptions={block.options}
            onDataChange={updateOptions}
          />
        </>
      )}
    </Stack>
  )
}
