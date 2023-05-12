import { Text, Tooltip } from '@chakra-ui/react'
import {
  BubbleStepType,
  OctaStepType,
  OctaBubbleStepType,
  InputStepType,
  IntegrationStepType,
  LogicStepType,
  StepType,
  WabaStepType
} from 'models'
import React from 'react'

type Props = { type: StepType }

export const StepTypeLabel = ({ type }: Props) => {
  switch (type) {
    case BubbleStepType.TEXT:
    case InputStepType.TEXT:
      return <Text>Texto</Text>
    case BubbleStepType.MEDIA:
      return <Text>Arquivo</Text>
    case BubbleStepType.VIDEO:
      return <Text>Vídeo</Text>
    case BubbleStepType.EMBED:
      return (
        <Tooltip label="Anexe um pdf, um iframe, um site...">
          <Text>Arquivo</Text>
        </Tooltip>
      )
    case InputStepType.NUMBER:
      return <Text>Número</Text>
    case InputStepType.EMAIL:
      return <Text>Email</Text>
    case InputStepType.CPF:
      return <Text>CPF</Text>
      // case InputStepType.URL:
    //   return <Text>Website</Text>
    case InputStepType.DATE:
      return <Text>Data</Text>
    case InputStepType.PHONE:
      return <Text>Telefone</Text>
    case InputStepType.CHOICE:
      return <Text>Botão</Text>
    // case InputStepType.PAYMENT:
    //   return <Text>Payment</Text>
    case InputStepType.ASK_NAME:
      return <Text>Nome</Text>
    // case LogicStepType.SET_VARIABLE:
    //   return <Text>Set variable</Text>
    case LogicStepType.CONDITION:
      return <Text>Condição</Text>
    // case LogicStepType.REDIRECT:
    //   return <Text>Redirect</Text>
    // case LogicStepType.CODE:
    //   return (
    //     <Tooltip label="Run Javascript code">
    //       <Text>Code</Text>
    //     </Tooltip>
    //   )
    // case LogicStepType.TYPEBOT_LINK:
    //   return (
    //     <Tooltip label="Link to another of your typebots">
    //       <Text>Typebot</Text>
    //     </Tooltip>
    //   )
    // case IntegrationStepType.GOOGLE_SHEETS:
    //   return (
    //     <Tooltip label="Google Sheets">
    //       <Text>Sheets</Text>
    //     </Tooltip>
    //   )
    // case IntegrationStepType.GOOGLE_ANALYTICS:
    //   return (
    //     <Tooltip label="Google Analytics">
    //       <Text>Analytics</Text>
    //     </Tooltip>
    //   )
    case IntegrationStepType.WEBHOOK:
      return <Text>Webhook</Text>
    // case IntegrationStepType.ZAPIER:
    //   return <Text>Zapier</Text>
    // case IntegrationStepType.MAKE_COM:
    //   return <Text>Make.com</Text>
    // case IntegrationStepType.PABBLY_CONNECT:
    //   return <Text>Pabbly</Text>
    // case IntegrationStepType.EMAIL:
    //   return <Text>Email</Text>
    case OctaStepType.OFFICE_HOURS:
      return <Text>Definir horário de atendimento</Text>
    case WabaStepType.COMMERCE:
     return <Text>Enviar um catálogo</Text>
    case OctaStepType.ASSIGN_TO_TEAM:
      return <Text>Direcionar conversa</Text>
    case OctaBubbleStepType.END_CONVERSATION:
      return <Text>Encerrar conversa</Text>
    case WabaStepType.BUTTONS:
      return <Text>Pergunta com botões interativos</Text>
      case WabaStepType.OPTIONS:
        return <Text>Pergunta com lista de opções</Text>
    default:
      return <></>
  }
}
