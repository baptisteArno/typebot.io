import { Stack, Tag, Text, Flex, Wrap } from '@chakra-ui/react'
import { useTypebot } from 'contexts/TypebotContext'
import { Comparison, ConditionItem, ComparisonOperators, OfficeHoursItem } from 'models'
import React from 'react'
import { Container, SelectedCalendar } from './OfficeHours.style'

type Props = {
  item: OfficeHoursItem
}

export const OfficeHoursNodeContent = ({ item }: Props) => {
  const { typebot } = useTypebot()

  console.log("Item => ", typebot);
  

  return (
    <Container>
      {item.content.values.map((value) => (
        <>
        {value === "@OFFICE_HOURS_TRUE" && "Durante o horário de expediente"}
        {value === "@OFFICE_HOURS_FALSE" && "Fora do horário de expediente"}
        </>
      ))}
    </Container>
    // <Flex px={2} py={2}>
    //   Teste
    //   {/* {item.content.comparisons.length === 0 ||
    //   comparisonIsEmpty(item.content.comparisons[0]) ? (
    //     <Text color={'gray.500'}>Configuração...</Text>
    //   ) : (
    //     <Stack maxW="170px">
    //       {
    //         (<>teste</>)
    //       // item.content.comparisons.map((comparison, idx) => {
    //       //   const variable = typebot?.variables.find(
    //       //     byId(comparison.variableId)
    //       //   )
    //       //   return (
    //       //     <Wrap key={comparison.id} spacing={1} noOfLines={0}>
    //       //       {idx > 0 && <Text>{item.content.logicalOperator ?? ''}</Text>}
    //       //       {variable?.name && (
    //       //         <Tag bgColor="orange.400" color="white">
    //       //           {variable.name}
    //       //         </Tag>
    //       //       )}
    //       //       {comparison.comparisonOperator && (
    //       //         <Text>
    //       //           {parseComparisonOperatorSymbol(
    //       //             comparison.comparisonOperator
    //       //           )}
    //       //         </Text>
    //       //       )}
    //       //       {comparison?.value && (
    //       //         <Tag bgColor={'gray.200'}>
    //       //           <Text noOfLines={0}>{comparison.value}</Text>
    //       //         </Tag>
    //       //       )}
    //       //     </Wrap>
    //       //   )
    //       // })
    //       }
    //     </Stack>
    //   )} */}
    // </Flex>
  )
}
