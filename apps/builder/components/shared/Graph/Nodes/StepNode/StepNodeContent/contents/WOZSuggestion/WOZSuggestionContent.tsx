import { WOZSuggestionStep } from 'models'
import React from 'react'
import { chakra, Stack, Text } from '@chakra-ui/react'
import { WOZ_ANSWER_TYPE } from '../../../SettingsPopoverContent/bodies'

type Props = {
  step: WOZSuggestionStep
}

const WOZSuggestionContent = ({ step }: Props) => {

  // const resolveAnswer = () => {
  //   const answer = Object.entries(WOZ_ANSWER_TYPE).find(s => s[0] === step.options.preferredAnswer)
  //   return answer ? answer[1] : ''
  // }

  return (
    // <Stack>
    //   {!step.options?.preferredAnswer &&
    //     <Text noOfLines={0}>
    //       {'Clique para editar...'}
    //     </Text>
    //   }
    //   {step.options?.preferredAnswer &&
    //     <Stack>
    //       <Text>
    //         Enviar a sugestão:
    //       </Text>
    //       <chakra.span
    //         bgColor="orange.400"
    //         color="white"
    //         rounded="md"
    //         py="0.5"
    //         px="1"
    //       >
    //         {resolveAnswer()}
    //       </chakra.span>
    //     </Stack>
    //   }
    // </Stack>
    <Stack>
      <Text noOfLines={0}>
        Saiba Mais...
      </Text>
    </Stack>
  )
}

export default WOZSuggestionContent