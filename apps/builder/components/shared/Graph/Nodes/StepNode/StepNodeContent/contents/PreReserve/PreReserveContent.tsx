import { useTypebot } from 'contexts/TypebotContext'
import { Options } from 'got'
import { PreReserveStep } from 'models'
import React, { useEffect, useState } from 'react'

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
    <div>
      Reservar a conversa para 
      {selectedGroup?.name || '...'}
    </div>
  )
}

export default PreReserveContent