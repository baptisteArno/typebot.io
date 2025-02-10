import { Checkbox, HStack, Stack, Text } from '@chakra-ui/react'
import { OctaDivider } from 'components/octaComponents/OctaDivider/OctaDivider'
import { WOZAssignOptions } from 'models'
import React, { useState } from 'react'
import { WozAssignSelect } from './WozAssignSelect'
import WozQtdAttemptsSelect from './WozQtdAttemptsSelect'

type Props = {
  options: WOZAssignOptions
  onOptionsChange: (options: WOZAssignOptions) => void
}

export const WOZAssignSettingBody = ({ options, onOptionsChange }: Props) => {
  const [viewMoreInfo, setViewMoreInfo] = useState('')

  const handleConfirmContextChange = (a: any) => {
    onOptionsChange({
      ...options,
      confirmContext: a.target.checked,
    })
  }

  const changeViewMoreInfo = (infoToShow: string) => {
    setViewMoreInfo(infoToShow === viewMoreInfo ? '' : infoToShow)
  }

  const isConfirmContext = () => {
    return viewMoreInfo === 'confirmContext'
  }

  const isRedirectionInfo = () => {
    return viewMoreInfo === 'redirection'
  }

  const handleWozAssignSelect = (e: any) => {
    onOptionsChange({
      ...options,
      virtualAgentId: e.profile,
    })
  }
  const handleChangeAttempts = (e: any) => {
    onOptionsChange({
      ...options,
      limitAnswerNoContent: e,
    })
  }

  return (
    <Stack spacing={4}>
      <Stack>
        <Text>Qual perfil deve ser chamado?</Text>
        <WozAssignSelect
          selectedProfile={options.virtualAgentId}
          onSelect={handleWozAssignSelect}
        />
      </Stack>
      <WozQtdAttemptsSelect
        selectedValue={options.limitAnswerNoContent}
        onChange={handleChangeAttempts}
      />
      <Stack>
        <OctaDivider width="100%" />
        <HStack justify="space-between">
          <Checkbox
            isChecked={options.confirmContext}
            onChange={handleConfirmContextChange}
          >
            Confirmar contexto antes de seguir árvore?
          </Checkbox>
          <Text
            cursor={'pointer'}
            onClick={() => changeViewMoreInfo('confirmContext')}
            fontSize={'13px'}
            align={'center'}
            color={'purple.400'}
          >
            <span>Ver {isConfirmContext() ? 'menos' : 'mais'}</span>
          </Text>
        </HStack>
        {isConfirmContext() && (
          <Stack justify="space-between">
            <Text color="gray.400" fontSize="sm">
              Aqui estão alguns benefícios dessa abordagem:
            </Text>
            <OctaDivider width="100%" />
            <Text color="gray.400" fontSize="sm" fontWeight="bold">
              Proporcionar uma experiência mais personalizada e transparente.
            </Text>
            <Text color="gray.400" fontSize="sm">
              Ao confirmar a disposição de seu cliente em avançar, garantimos
              que ele esteja plenamente engajado e ciente das opções
              disponíveis.
            </Text>
            <OctaDivider width="100%" />
            <Text color="gray.400" fontSize="sm" fontWeight="bold">
              Evita mal entendidos:
            </Text>
            <Text color="gray.400" fontSize="sm">
              Não permite que o cliente seja direcionado para qualquer direção
              da árvore sem confirmação do próprio.
            </Text>
            <Text color="gray.400" fontSize="sm">
              Acreditamos que essa opção só deva ser desligada caso as decisões
              do bot estejam sendo muito fieis aos desejos do seu cliente.
            </Text>
          </Stack>
        )}
        <OctaDivider width="100%" />
        <HStack justify="space-between">
          <Text>Redirecionamento baseado no assunto da conversa:</Text>
          <Text
            cursor={'pointer'}
            onClick={() => changeViewMoreInfo('redirection')}
            fontSize={'13px'}
            align={'center'}
            color={'purple.400'}
          >
            <span>Ver {isRedirectionInfo() ? 'menos' : 'mais'}</span>
          </Text>
        </HStack>
        {isRedirectionInfo() && (
          <Stack justify="space-between">
            <Text color="gray.400" fontSize="sm" fontWeight="bold">
              Contextos que sempre estarão disponíveis:
            </Text>
            <Text color="gray.400" fontSize="sm">
              Falar com Humano: Garante que o WOZ saberá que seu usuário quer
              falar com algum atendente, permitindo que você o direcione para o
              time de atendimento. Encerrar a conversa: O Woz irá indicar que o
              cliente quer encerrar a conversa, geralmente por não ter mais
              Text, permitindo que a árvore seja montada para isso.
            </Text>
          </Stack>
        )}
        <OctaDivider width="100%" />
      </Stack>
    </Stack>
  )
}
