import { colors } from '@/lib/theme'
import { useColorModeValue } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { animationVariants } from './animationVariants'

export const PopupIllustration = () => {
  const bubbleColor = useColorModeValue('white', colors.orange[100])
  return (
    <svg
      width="100"
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        width="500"
        height="500"
        rx="20"
        fill={useColorModeValue(colors.gray['400'], colors.gray['900'])}
      />
      <rect x="105" y="77" width="290" height="352" rx="10" fill="#0042DA" />
      <motion.rect
        x="171"
        y="117"
        width="156"
        height="34"
        rx="10"
        fill={bubbleColor}
        variants={animationVariants}
      />
      <motion.rect
        x="171"
        y="160"
        width="156"
        height="65"
        rx="10"
        fill={bubbleColor}
        variants={animationVariants}
      />

      <motion.circle
        cx="142"
        cy="254"
        r="20"
        fill={bubbleColor}
        variants={animationVariants}
      />
      <motion.rect
        x="171"
        y="234"
        width="156"
        height="40"
        rx="10"
        fill={bubbleColor}
        variants={animationVariants}
      />
      <motion.circle
        cx="356"
        cy="303"
        r="20"
        fill={bubbleColor}
        variants={animationVariants}
      />
      <motion.rect
        x="197"
        y="283"
        width="130"
        height="40"
        rx="10"
        fill={bubbleColor}
        variants={animationVariants}
      />
    </svg>
  )
}
