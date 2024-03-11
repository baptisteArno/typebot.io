import { Checkbox, HStack, Stack, Text } from '@chakra-ui/react'
import { OctaDivider } from 'components/octaComponents/OctaDivider/OctaDivider'
import { WOZAssignOptions, WOZAssignStep } from 'models'
import React, { useState } from 'react'

type Props = {
  options: WOZAssignOptions
  onOptionsChange: (options: WOZAssignOptions) => void
}

export const WOZAssignSettingBody = ({ options, onOptionsChange }: Props) => {
  const [viewMoreInfo, setViewMoreInfo] = useState('')
  const handleIntroduceChange = (a: any) => {
    onOptionsChange({
      ...options,
      introduceAsIA: a.target.checked,
    })
  }

  const handleConfirmContextChange = (a: any) => {
    onOptionsChange({
      ...options,
      confirmContext: a.target.checked,
    })
  }

  const changeViewMoreInfo = (infoToShow: string) => {
    setViewMoreInfo(infoToShow === viewMoreInfo ? '' : infoToShow)
  }

  const isIntroduce = () => {
    return viewMoreInfo === 'introduceAsIA'
  }

  const isConfirmContext = () => {
    return viewMoreInfo === 'confirmContext'
  }

  const isRedirectionInfo = () => {
    return viewMoreInfo === 'redirection'
  }

  return (
    <Stack spacing={4}>
      <Stack>
        <HStack justify="space-between">
          <Checkbox isChecked={options.introduceAsIA} onChange={handleIntroduceChange}>
            Devo me apresentar como uma IA para o cliente?
          </Checkbox>
          <Text cursor={'pointer'} onClick={() => changeViewMoreInfo('introduceAsIA')} fontSize={"13px"} align={"center"} color={"blue"}>
            <span>Ver {isIntroduce() ? "menos" : "mais"}</span>
          </Text>
        </HStack>
        {isIntroduce() &&
          <Stack justify="space-between">
            <Text color="gray.400" fontSize="sm">
              Aqui estão alguns benefícios dessa abordagem:
            </Text>
            <OctaDivider width='100%' />
            <Text color="gray.400" fontSize="sm" fontWeight="bold">
              Transparência e Confiança:
            </Text>
            <Text color="gray.400" fontSize="sm">
              Ao comunicar claramente que estão interagindo com uma IA, os usuários percebem um maior nível de transparência por parte da nossa empresa. Isso constrói confiança, mostrando que somos honestos sobre o funcionamento do nosso serviço.
            </Text>
            <OctaDivider width='100%' />
            <Text color="gray.400" fontSize="sm" fontWeight="bold">
              Gestão de Expectativas:
            </Text>
            <Text color="gray.400" fontSize="sm">
              Informar aos usuários que estão lidando com uma IA ajuda a estabelecer expectativas realistas sobre a natureza da interação. Isso reduz a frustração potencial se o chatbot não puder fornecer uma resposta precisa ou personalizada.
            </Text>
            <OctaDivider width='100%' />
            <Text color="gray.400" fontSize="sm" fontWeight="bold">
              Melhoria da Experiência do Usuário:
            </Text>
            <Text color="gray.400" fontSize="sm">
              Consciência sobre a presença de uma IA pode encorajar os usuários a interagirem de forma mais eficaz e produtiva. Eles podem ajustar suas expectativas e utilizar o chatbot de maneira mais adequada, resultando em uma experiência geral mais positiva.
            </Text>
            <OctaDivider width='100%' />
            <Text color="gray.400" fontSize="sm" fontWeight="bold">
              Ética e Privacidade:
            </Text>
            <Text color="gray.400" fontSize="sm">
              Em situações onde lidamos com informações sensíveis ou confidenciais, é essencial que os usuários saibam que estão interagindo com uma IA. Isso ajuda a garantir que entendam como suas informações estão sendo utilizadas e protegidas.
            </Text>
            <Text color="gray.400" fontSize="sm">
              Adotar essa prática não apenas fortalecerá a relação com nossos usuários, mas também nos alinhará com padrões éticos e de transparência cada vez mais valorizados pelos consumidores. Recomendamos fortemente que implementemos essa medida em nossa estratégia de comunicação com os usuários do chatbot.
            </Text>
          </Stack>
        }
        <OctaDivider width='100%' />
        <HStack justify="space-between">
          <Checkbox isChecked={options.confirmContext} onChange={handleConfirmContextChange}>
            Confirmar contexto antes de seguir árvore?
          </Checkbox>
          <Text cursor={'pointer'} onClick={() => changeViewMoreInfo('confirmContext')} fontSize={"13px"} align={"center"} color={"blue"}>
            <span>Ver {isConfirmContext() ? "menos" : "mais"}</span>
          </Text>
        </HStack>
        {isConfirmContext() &&
          <Stack justify="space-between">
            <Text color="gray.400" fontSize="sm">
              Aqui estão alguns benefícios dessa abordagem:
            </Text>
            <OctaDivider width='100%' />
            <Text color="gray.400" fontSize="sm" fontWeight="bold">
              Proporcionar uma experiência mais personalizada e transparente.
            </Text>
            <Text color="gray.400" fontSize="sm">
              Ao confirmar a disposição de seu cliente em avançar, garantimos que ele esteja plenamente engajado e ciente das opções disponíveis.
            </Text>
            <OctaDivider width='100%' />
            <Text color="gray.400" fontSize="sm" fontWeight="bold">
              Evita mal entendidos:
            </Text>
            <Text color="gray.400" fontSize="sm">
              Não permite que o cliente seja direcionado para qualquer direção da árvore sem confirmação do próprio.
            </Text>
            <Text color="gray.400" fontSize="sm">
              Acreditamos que essa opção só deva ser desligada caso as decisões do bot estejam sendo muito fieis aos desejos do seu cliente.
            </Text>
          </Stack>
        }
        <OctaDivider width='100%' />
        <HStack justify="space-between">
          <Text>
            Redirecionamento baseado no assunto da conversa:
          </Text>
          <Text cursor={'pointer'} onClick={() => changeViewMoreInfo('redirection')} fontSize={"13px"} align={"center"} color={"blue"}>
            <span>Ver {isRedirectionInfo() ? "menos" : "mais"}</span>
          </Text>
        </HStack>
        {isRedirectionInfo() &&
          <Stack justify="space-between">
            <Text color="gray.400" fontSize="sm">
              Aqui você pode listar quais assuntos o WOZ deverá passar a conversa para outros componentes da árvore de decisão.
            </Text>
            <OctaDivider width='100%' />
            <Text color="gray.400" fontSize="sm" fontWeight="bold">
              Contextos que sempre estarão disponíveis:
            </Text>
            <Text color="gray.400" fontSize="sm">
              Falar com Humano: Garante que o WOZ saberá que seu usuário quer falar com algum atendente, permitindo que você o direcione o time de atendimento.
            </Text>
            <Text color="gray.400" fontSize="sm">
              Encerrar a conversa: O Woz irá indicar que o cliente quer encerrar a conversa, permitindo que a árvore seja montada para isso.
            </Text>
            <OctaDivider width='100%' />
            <Text color="gray.400" fontSize="sm" fontWeight="bold">
              Configure contextos.
            </Text>
            <Text color="gray.400" fontSize="sm">
              Você poderá adicionar outros assuntos que seu cliente pode querer conversar direcionando para outros componentes do bot, permitindo assim que você faça atualizações cadastrais usando o Conecte a outro sistema, busque dados em sua API para responder perguntas específicas, etc...
            </Text>
          </Stack>
        }
        <OctaDivider width='100%' />
      </Stack>
    </Stack >
  )
}