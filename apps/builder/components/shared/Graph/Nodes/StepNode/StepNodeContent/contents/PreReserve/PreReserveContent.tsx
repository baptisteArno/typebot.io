import { useTypebot } from 'contexts/TypebotContext'
import { Options } from 'got'
import { PreReserveStep } from 'models'
import React, { useEffect, useState } from 'react'
import { Container, Space } from './PreReserveContent.style'
import { chakra, Text } from '@chakra-ui/react'

type Props = {
  step: PreReserveStep
}

const PreReserveContent = ({ step }: Props) => {
  const { octaGroups } = useTypebot();

  const [selectedGroup, setSelectedGroup] = useState<any>();

  useEffect(() => {
    if (octaGroups) {
      const item = octaGroups.find(g => g.id === step?.options?.assignTo)
      setSelectedGroup(item);
    }
    return () => {
      setSelectedGroup(undefined)
    };
  }, [octaGroups, step]);

  return (
    <Container>
      Reservar a conversa para:
      <Space>
        <chakra.span
          bgColor="orange.400"
          color="white"
          rounded="md"
          py="0.5"
          px="1"
        >
          {selectedGroup?.name || '...'}
        </chakra.span>
      </Space>

    </Container>
  )
}

export default PreReserveContent