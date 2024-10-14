import { BlockIndices, ChoiceInputBlock } from '@typebot.io/schemas'
import React from 'react'
import {
  Box,
  Divider,
  Heading,
  Image,
  Link,
  Stack,
  Tag,
  Text,
  Wrap,
} from '@chakra-ui/react'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { SetVariableLabel } from '@/components/SetVariableLabel'
import { ItemNodesList } from '@/features/graph/components/nodes/item/ItemNodesList'
import { useTranslate } from '@tolgee/react'
import { ExternalLinkIcon, ListIcon } from '../../../../../components/icons'
import {
  headerType,
  interactiveButtonType,
} from '@typebot.io/schemas/features/blocks/inputs/choice/constants'

type Props = {
  block: ChoiceInputBlock
  indices: BlockIndices
}

const InteractiveBlock = ({ block }: Props) => {
  const containsVariables = (value: string): boolean => {
    return value.includes('{{') && value.includes('}}')
  }
  return (
    <Box p={1} maxW="sm" borderWidth="1px" borderRadius="lg" overflow="hidden">
      {block.options?.interactiveData?.header ? (
        <>
          {block.options?.interactiveData?.headerType === headerType.TEXT && (
            <Heading size="xs">
              {block.options?.interactiveData?.header}
            </Heading>
          )}
          {block.options?.interactiveData?.headerType === headerType.IMAGE && (
            <Image
              pointerEvents="none"
              src={
                containsVariables(block.options?.interactiveData?.header)
                  ? '/images/dynamic-image.png'
                  : block.options?.interactiveData?.header
              }
              alt="Header image"
              rounded="md"
              objectFit="cover"
            />
          )}
          {block.options?.interactiveData?.headerType === headerType.VIDEO && (
            <>
              {containsVariables(block.options?.interactiveData?.header) ? (
                <Image
                  src="/images/dynamic-image.png"
                  alt="Dynamic video thumbnail"
                  rounded="md"
                />
              ) : (
                <video
                  key={block.options?.interactiveData?.header}
                  controls={true}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '10px',
                  }}
                >
                  <source src={block.options?.interactiveData?.header} />
                </video>
              )}
            </>
          )}
          {block.options?.interactiveData?.headerType ===
            headerType.DOCUMENT && (
            <Link href={block.options?.interactiveData?.header} isExternal>
              View header <ExternalLinkIcon mx="2px" />
            </Link>
          )}
        </>
      ) : null}

      {block.options?.interactiveData?.body && (
        <Text>{block.options?.interactiveData?.body}</Text>
      )}

      {block.options?.interactiveData?.footer && (
        <Text fontSize="xs" color="gray.400">
          {block.options?.interactiveData?.footer}
        </Text>
      )}

      {block.options?.interactiveButtonType === interactiveButtonType.LIST &&
        block.options?.interactiveData?.menuTitle && (
          <>
            <Divider />
            <Text display="flex" justifyContent="center" alignItems="center">
              <ListIcon mr="2px" />
              {block.options?.interactiveData?.menuTitle}
            </Text>
          </>
        )}
    </Box>
  )
}

export const ButtonsBlockNode = ({ block, indices }: Props) => {
  const { typebot } = useTypebot()
  const { t } = useTranslate()
  const dynamicVariableName = typebot?.variables.find(
    (variable) => variable.id === block.options?.dynamicVariableId
  )?.name

  return (
    <Stack w="full">
      {block.options?.isInteractive ? (
        <InteractiveBlock block={block} indices={indices} />
      ) : null}
      {block.options?.dynamicVariableId ? (
        <Wrap spacing={1}>
          <Text>{t('blocks.inputs.button.variables.display.label')}</Text>
          <Tag bg="orange.400" color="white">
            {dynamicVariableName}
          </Tag>
          <Text>{t('blocks.inputs.button.variables.buttons.label')}</Text>
        </Wrap>
      ) : (
        <ItemNodesList block={block} indices={indices} />
      )}
      {block.options?.variableId ? (
        <SetVariableLabel
          variableId={block.options.variableId}
          variables={typebot?.variables}
        />
      ) : null}
    </Stack>
  )
}
