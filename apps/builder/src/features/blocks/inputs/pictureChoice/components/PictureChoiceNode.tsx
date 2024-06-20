import { BlockIndices } from '@sniper.io/schemas'
import React from 'react'
import { Stack, Tag, Wrap, Text } from '@chakra-ui/react'
import { useSniper } from '@/features/editor/providers/SniperProvider'
import { SetVariableLabel } from '@/components/SetVariableLabel'
import { ItemNodesList } from '@/features/graph/components/nodes/item/ItemNodesList'
import { PictureChoiceBlock } from '@sniper.io/schemas/features/blocks/inputs/pictureChoice'
import { useTranslate } from '@tolgee/react'

type Props = {
  block: PictureChoiceBlock
  indices: BlockIndices
}

export const PictureChoiceNode = ({ block, indices }: Props) => {
  const { t } = useTranslate()
  const { sniper } = useSniper()
  const dynamicVariableName = sniper?.variables.find(
    (variable) =>
      variable.id === block.options?.dynamicItems?.pictureSrcsVariableId
  )?.name

  return (
    <Stack w="full">
      {block.options?.dynamicItems?.isEnabled && dynamicVariableName ? (
        <Wrap spacing={1}>
          <Text>
            {t('blocks.inputs.picture.settings.dynamicVariables.display.label')}
          </Text>
          <Tag bg="orange.400" color="white">
            {dynamicVariableName}
          </Tag>
          <Text>
            {t(
              'blocks.inputs.picture.settings.dynamicVariables.pictures.label'
            )}
          </Text>
        </Wrap>
      ) : (
        <ItemNodesList block={block} indices={indices} />
      )}
      {block.options?.variableId ? (
        <SetVariableLabel
          variableId={block.options.variableId}
          variables={sniper?.variables}
        />
      ) : null}
    </Stack>
  )
}
