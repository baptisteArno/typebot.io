import { forwardRef, Stack, StackProps } from '@chakra-ui/react'
import { motion, MotionProps, isValidMotionProp } from 'framer-motion'

export const MotionStack = motion(
  forwardRef<MotionProps & StackProps, 'div'>((props, ref) => {
    const chakraProps = Object.fromEntries(
      Object.entries(props).filter(([key]) => !isValidMotionProp(key))
    )

    return <Stack ref={ref} {...chakraProps} />
  })
)
