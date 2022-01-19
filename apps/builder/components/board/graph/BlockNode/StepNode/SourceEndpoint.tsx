import { Box, BoxProps, Flex } from '@chakra-ui/react'
import { ConnectingSourceIds, useGraph } from 'contexts/GraphContext'
import React, { MouseEvent, useEffect, useRef } from 'react'

export const SourceEndpoint = ({
  source,
  ...props
}: BoxProps & {
  source: ConnectingSourceIds
}) => {
  const { setConnectingIds, addSourceEndpoint: addEndpoint } = useGraph()
  const ref = useRef<HTMLDivElement | null>(null)

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    setConnectingIds({ source })
  }

  useEffect(() => {
    if (!ref.current) return
    const id =
      source.choiceItemId ?? source.stepId + (source.conditionType ?? '')
    addEndpoint({
      id,
      ref,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref])

  return (
    <Flex
      ref={ref}
      boxSize="18px"
      rounded="full"
      onMouseDown={handleMouseDown}
      cursor="copy"
      borderWidth="1px"
      borderColor="gray.400"
      bgColor="white"
      justify="center"
      align="center"
      {...props}
    >
      <Box bgColor="gray.400" rounded="full" boxSize="7px" />
    </Flex>
  )
}
