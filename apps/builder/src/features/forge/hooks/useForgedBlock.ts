import { useMemo } from 'react'
import { forgedBlockSchemas, forgedBlocks } from '@typebot.io/forge-schemas'
import { enabledBlocks } from '@typebot.io/forge-repository'
import { BlockWithOptions } from '@typebot.io/schemas'

export const useForgedBlock = (
  blockType: BlockWithOptions['type'],
  action?: string
) =>
  useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((enabledBlocks as any).includes(blockType) === false) return {}
    const blockDef = forgedBlocks.find(
      (b) => enabledBlocks.includes(b.id) && b.id === blockType
    )
    return {
      blockDef,
      blockSchema: forgedBlockSchemas.find(
        (b) =>
          enabledBlocks.includes(b.shape.type.value) &&
          b.shape.type.value === blockType
      ),
      actionDef: action
        ? blockDef?.actions.find((a) => a.name === action)
        : undefined,
    }
  }, [action, blockType])
