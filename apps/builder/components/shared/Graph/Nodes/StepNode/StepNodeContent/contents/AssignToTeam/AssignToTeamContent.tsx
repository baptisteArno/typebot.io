import React from 'react'
import { chakra, Text, Stack } from '@chakra-ui/react'
import { AssignToTeamOptions, Assign, AssignToTeamStep } from 'models'
import { SourceEndpoint } from '../../../../../Endpoints'
import { TableListOcta } from 'components/shared/TableListOcta'
import { OctaDivider } from 'assets/OctaDivider'
import { ASSIGN_TO } from 'enums/assign-to'
import { useTypebot } from 'contexts/TypebotContext'

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {
  step: AssignToTeamStep
}

export const AssignToTeamContent = ({
  step,
}: Props) => {
  const { octaAgents } = useTypebot();

  const resolveAssignTo = (assignTo: string) => {
    const value = octaAgents.find(s => s.id === assignTo)
    return value?.name
  }

  const resolveAssignType = (assignType: string, subType: string) => {
    if (assignType === ASSIGN_TO.group) return 'grupo'
    else if (assignType === ASSIGN_TO.agent) {
      if (subType === 'RESPONSIBLE_CONTACT') return 'responsável'
      else return 'agente'
    }
    else return 'time'
  }

  return (
    <Stack>
      <Text noOfLines={0}>
        {(!step.options.messages?.firstMessage?.content?.plainText || (!step.options.assignTo && step.options.assignType !== ASSIGN_TO.noOne)) && <span>Clique para editar...</span>}
        {step.options.messages?.firstMessage?.content?.plainText && (step.options.assignTo || step.options.assignType === ASSIGN_TO.noOne) && step.options.messages?.firstMessage?.content?.plainText}
      </Text>
      <OctaDivider />
      <Text>
        <span>Atribuir conversa para {resolveAssignType(step.options.assignType, step.options.subType)}</span>
      </Text>
      {step.options.assignTo &&
        <Stack>
          <chakra.span
            w={"100%"}
            gap={"8px"}
            bgColor="orange.400"
            color="white"
            rounded="md"
            py="0.5"
            px="1"
          >
            {resolveAssignTo(step.options.assignTo)}
          </chakra.span>
        </Stack>
      }
      <OctaDivider />
      <Text fontSize={"13px"} align={"center"} color={"blue"}>
        <span>Clique para mais configurações</span>
      </Text>

    </Stack>
  )
}
