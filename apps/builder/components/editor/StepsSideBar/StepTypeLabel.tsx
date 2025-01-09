import { Text, Tooltip } from '@chakra-ui/react'
import {
  BubbleStepType,
  InputStepType,
  IntegrationStepType,
  LogicStepType,
  OctaBubbleStepType,
  OctaStepType,
  OctaWabaStepType,
  StepType,
  WOZStepType,
} from 'models'

type Props = { type: StepType }

export const StepTypeLabel = ({ type }: Props) => {
  switch (type) {
    case BubbleStepType.TEXT:
      return <Text>Envie uma mensagem de texto</Text>
    case WOZStepType.MESSAGE:
      return <Text>Envie uma sugestão WOZ</Text>
    case WOZStepType.ASSIGN:
      return <Text>Direcione a conversa para o WOZ</Text>
    case InputStepType.TEXT:
      return <Text>Pergunte qualquer coisa</Text>
    case BubbleStepType.MEDIA:
      return <Text>Envie um arquivo</Text>
    case BubbleStepType.VIDEO:
      return <Text>Vídeo</Text>
    case BubbleStepType.EMBED:
      return (
        <Tooltip label="Anexe um pdf, um iframe, um site...">
          <Text>Arquivo</Text>
        </Tooltip>
      )
    case InputStepType.EMAIL:
      return <Text>Pergunte o email</Text>
    case InputStepType.CPF:
      return <Text>Pergunte o CPF</Text>
    // case InputStepType.URL:
    //   return <Text>Website</Text>
    case InputStepType.DATE:
      return <Text>Data</Text>
    case InputStepType.PHONE:
      return <Text>Pergunte o telefone</Text>
    case InputStepType.CHOICE:
      return <Text>Pergunta de múltipla escolha</Text>
    // case InputStepType.PAYMENT:
    //   return <Text>Payment</Text>
    case InputStepType.ASK_NAME:
      return <Text>Pergunte o nome</Text>
    // case LogicStepType.SET_VARIABLE:
    //   return <Text>Set variable</Text>
    case LogicStepType.CONDITION:
      return <Text>Valide uma informação</Text>
    // case LogicStepType.REDIRECT:
    //   return <Text>Redirect</Text>
    // case LogicStepType.CODE:
    //   return (
    //     <Tooltip label="Run Javascript code">
    //       <Text>Code</Text>
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
      return <Text>Conecte a outro sistema</Text>
    case IntegrationStepType.EXTERNAL_EVENT:
      return <Text>Aguardar Evento Externo</Text>
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
    case OctaStepType.ASSIGN_TO_TEAM:
      return <Text>Direcionar conversa</Text>
    case OctaStepType.CALL_OTHER_BOT:
      return <Text>Chamar outro Bot</Text>
    case OctaBubbleStepType.END_CONVERSATION:
      return <Text>Encerrar conversa</Text>
    case OctaWabaStepType.WHATSAPP_OPTIONS_LIST:
      return <Text>Pergunta com lista de opções</Text>
    case OctaWabaStepType.WHATSAPP_BUTTONS_LIST:
      return <Text>Pergunta com lista de botões</Text>
    case OctaWabaStepType.COMMERCE:
      return <Text>Enviar um catálogo</Text>
    case OctaStepType.PRE_RESERVE:
      return <Text>Reservar conversa para um grupo</Text>
    case OctaStepType.CONVERSATION_TAG:
      return <Text>Tagear conversa</Text>
    case "start":
      return <Text>Início</Text>
    default:
      return <></>
  }
}
