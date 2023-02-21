import { colors } from '@/lib/theme'
import { useColorModeValue } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { animationVariants } from './animationVariants'

export const StandardIllustration = () => {
  const gray = useColorModeValue(colors.gray[400], colors.gray[700])
  const bubbleColor = useColorModeValue('white', colors.blue[100])
  return (
    <svg
      viewBox="0 0 500 500"
      width="100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        width="500"
        height="500"
        rx="20"
        fill={useColorModeValue(colors.gray['200'], colors.gray['900'])}
      />
      <rect x="49" y="49" width="108" height="109" rx="10" fill={gray} />
      <rect x="188" y="74" width="263" height="25" rx="5" fill={gray} />
      <rect x="188" y="111" width="263" height="25" rx="5" fill={gray} />
      <rect x="49" y="189" width="402" height="262" rx="10" fill="#0042DA" />

      <motion.rect
        variants={animationVariants}
        x="121"
        y="217"
        width="218"
        height="34"
        rx="10"
        fill={bubbleColor}
      />
      <motion.rect
        variants={animationVariants}
        x="121"
        y="260"
        width="218"
        height="65"
        rx="10"
        fill={bubbleColor}
      />
      <motion.circle
        variants={animationVariants}
        cx="93"
        cy="354"
        r="20"
        fill={bubbleColor}
      />
      <motion.rect
        variants={animationVariants}
        x="121"
        y="334"
        width="218"
        height="40"
        rx="10"
        fill={bubbleColor}
      />
      <motion.circle
        variants={animationVariants}
        cx="407"
        cy="410"
        r="20"
        fill={bubbleColor}
      />
      <motion.rect
        variants={animationVariants}
        x="250"
        y="390"
        width="130"
        height="40"
        rx="10"
        fill={bubbleColor}
      />
    </svg>
  )
}
