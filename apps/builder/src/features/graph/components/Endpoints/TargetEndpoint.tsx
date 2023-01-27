import { Box, BoxProps } from '@chakra-ui/react'
import { useGraph } from '../../providers'
import React, { useEffect, useRef } from 'react'

export const TargetEndpoint = ({
  blockId,
  isVisible,
  ...props
}: BoxProps & {
  blockId: string
  isVisible?: boolean
}) => {
  const { addTargetEndpoint } = useGraph()
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!ref.current) return
    addTargetEndpoint({
      id: blockId,
      ref,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref])

  return (
    <Box
      ref={ref}
      boxSize="20px"
      rounded="full"
      bgColor="blue.500"
      cursor="pointer"
      visibility={isVisible ? 'visible' : 'hidden'}
      {...props}
    />
  )
}
