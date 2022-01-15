import { Box, BoxProps } from '@chakra-ui/react'
import { useGraph } from 'contexts/GraphContext'
import React, { useEffect, useRef } from 'react'

export const TargetEndpoint = ({
  stepId,
  isVisible,
  ...props
}: BoxProps & {
  stepId: string
  isVisible?: boolean
}) => {
  const { addTargetEndpoint } = useGraph()
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!ref.current) return
    addTargetEndpoint({
      id: stepId,
      ref,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref])

  return (
    <Box
      ref={ref}
      boxSize="15px"
      rounded="full"
      bgColor="blue.500"
      cursor="pointer"
      visibility={isVisible ? 'visible' : 'hidden'}
      {...props}
    />
  )
}
