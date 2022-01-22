import { Flex, Stack, HStack, Tag, Text } from '@chakra-ui/react'
import { useTypebot } from 'contexts/TypebotContext'
import { ConditionStep } from 'models'
import { SourceEndpoint } from '../SourceEndpoint'

export const ConditionNodeContent = ({ step }: { step: ConditionStep }) => {
  const { typebot } = useTypebot()
  return (
    <Flex>
      <Stack color={'gray.500'}>
        {step.options?.comparisons.allIds.map((comparisonId, idx) => {
          const comparison = step.options?.comparisons.byId[comparisonId]
          const variable = typebot?.variables.byId[comparison?.variableId ?? '']
          return (
            <HStack key={comparisonId} spacing={1}>
              {idx > 0 && <Text>{step.options?.logicalOperator ?? ''}</Text>}
              {variable?.name && (
                <Tag bgColor="orange.400">{variable.name}</Tag>
              )}
              {comparison.comparisonOperator && (
                <Text>{comparison?.comparisonOperator}</Text>
              )}
              {comparison?.value && (
                <Tag bgColor={'green.400'}>{comparison.value}</Tag>
              )}
            </HStack>
          )
        })}
      </Stack>
      <SourceEndpoint
        source={{
          blockId: step.blockId,
          stepId: step.id,
          conditionType: 'true',
        }}
        pos="absolute"
        top="7px"
        right="15px"
      />
      <SourceEndpoint
        source={{
          blockId: step.blockId,
          stepId: step.id,
          conditionType: 'false',
        }}
        pos="absolute"
        bottom="7px"
        right="15px"
      />
    </Flex>
  )
}
