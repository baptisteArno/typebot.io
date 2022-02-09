import { Box, BoxProps } from '@chakra-ui/react'
import { HTMLMotionProps, motion } from 'framer-motion'

export type MotionBoxProps = BoxProps & HTMLMotionProps<'div'>
export const MotionBox = motion<BoxProps>(Box)
