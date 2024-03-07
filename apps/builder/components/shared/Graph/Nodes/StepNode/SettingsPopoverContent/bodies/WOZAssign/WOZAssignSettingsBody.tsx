import { Checkbox, HStack, Stack, Text } from '@chakra-ui/react'
import { OctaDivider } from 'components/octaComponents/OctaDivider/OctaDivider'
import { WOZAssignOptions, WOZAssignStep } from 'models'
import React from 'react'

type Props = {
  options: WOZAssignOptions
  onOptionsChange: (options: WOZAssignOptions) => void
}

export const WOZAssignSettingBody = ({ options, onOptionsChange }: Props) => {
  const handleIntroduceChange = (a: any) => {
    onOptionsChange({
      ...options,
      introduceAsIA: a.target.checked,
    })
  }

  return (
    <Stack spacing={4}>
      <Stack>
        <HStack justify="space-between">
          <Checkbox isChecked={options.introduceAsIA} onChange={handleIntroduceChange}>
            Devo me apresentar como uma IA para o cliente?
          </Checkbox>
        </HStack>
        <OctaDivider width='100%' />
        <Stack justify="space-between">
          <Text color="gray.400" fontSize="sm">
            Aqui estão alguns benefícios dessa abordagem:
          </Text>
          <Text color="gray.400" fontSize="sm" fontWeight="bold">
            Transparência e Confiança:
          </Text>
          <Text color="gray.400" fontSize="sm">
            Ao comunicar claramente que estão interagindo com uma IA, os usuários percebem um maior nível de transparência por parte da nossa empresa. Isso constrói confiança, mostrando que somos honestos sobre o funcionamento do nosso serviço.
          </Text>
          <Text color="gray.400" fontSize="sm" fontWeight="bold">
            Gestão de Expectativas:
          </Text>
          <Text color="gray.400" fontSize="sm">
            Informar aos usuários que estão lidando com uma IA ajuda a estabelecer expectativas realistas sobre a natureza da interação. Isso reduz a frustração potencial se o chatbot não puder fornecer uma resposta precisa ou personalizada.
          </Text>
          <Text color="gray.400" fontSize="sm" fontWeight="bold">
            Melhoria da Experiência do Usuário:
          </Text>
          <Text color="gray.400" fontSize="sm">
            Consciência sobre a presença de uma IA pode encorajar os usuários a interagirem de forma mais eficaz e produtiva. Eles podem ajustar suas expectativas e utilizar o chatbot de maneira mais adequada, resultando em uma experiência geral mais positiva.
          </Text>

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
      </Stack>
    </Stack>
  )
}