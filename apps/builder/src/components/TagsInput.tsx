import {
  HStack,
  IconButton,
  Wrap,
  Text,
  WrapItem,
  Input,
} from '@chakra-ui/react'
import { useRef, useState } from 'react'
import { CloseIcon } from './icons'
import { colors } from '@/lib/theme'
import { AnimatePresence, motion } from 'framer-motion'
import { convertStrToList } from '@typebot.io/lib/convertStrToList'
import { isEmpty } from '@typebot.io/lib/utils'

type Props = {
  items?: string[]
  placeholder?: string
  onChange: (value: string[]) => void
}
export const TagsInput = ({ items, placeholder, onChange }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [focusedTagIndex, setFocusedTagIndex] = useState<number>()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    setFocusedTagIndex(undefined)
    setInputValue(e.target.value)
    if (e.target.value.length - inputValue.length > 0) {
      const values = convertStrToList(e.target.value)
      if (values.length > 1) {
        onChange([...(items ?? []), ...convertStrToList(e.target.value)])
        setInputValue('')
      }
    }
  }
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!items) return

    if (e.key === 'Backspace') {
      if (focusedTagIndex !== undefined) {
        if (focusedTagIndex === items.length - 1) {
          setFocusedTagIndex((idx) => idx! - 1)
        }
        removeItem(focusedTagIndex)
        return
      }
      if (inputValue === '' && focusedTagIndex === undefined) {
        setFocusedTagIndex(items?.length - 1)
        return
      }
    }

    if (e.key === 'ArrowLeft') {
      if (focusedTagIndex !== undefined) {
        if (focusedTagIndex === 0) return
        setFocusedTagIndex(focusedTagIndex - 1)
        return
      }
      if (inputRef.current?.selectionStart === 0 && items) {
        setFocusedTagIndex(items.length - 1)
        return
      }
    }
    if (e.key === 'ArrowRight' && focusedTagIndex !== undefined) {
      if (focusedTagIndex === items.length - 1) {
        setFocusedTagIndex(undefined)
        return
      }
      setFocusedTagIndex(focusedTagIndex + 1)
    }
  }

  const removeItem = (index: number) => {
    if (!items) return
    const newItems = [...items]
    newItems.splice(index, 1)
    onChange(newItems)
  }

  const addItem = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isEmpty(inputValue)) return
    setInputValue('')
    onChange(items ? [...items, inputValue.trim()] : [inputValue.trim()])
  }

  return (
    <Wrap
      spacing={1}
      borderWidth={1}
      boxShadow={isFocused ? `0 0 0 1px ${colors['blue'][500]}` : undefined}
      p="2"
      rounded="md"
      borderColor={isFocused ? 'blue.500' : 'gray.200'}
      transitionProperty="box-shadow, border-color"
      transitionDuration="150ms"
      transitionTimingFunction="ease-in-out"
      onClick={() => inputRef.current?.focus()}
      onKeyDown={handleKeyDown}
    >
      <AnimatePresence mode="popLayout">
        {items?.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, transform: 'translateY(5px)' }}
            animate={{ opacity: 1, transform: 'translateY(0)' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            <WrapItem>
              <Tag
                content={item}
                onDeleteClick={() => removeItem(index)}
                isFocused={focusedTagIndex === index}
              />
            </WrapItem>
          </motion.div>
        ))}
      </AnimatePresence>
      <WrapItem>
        <form onSubmit={addItem}>
          <Input
            ref={inputRef}
            h="24px"
            p="0"
            borderWidth={0}
            focusBorderColor="transparent"
            size="sm"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={items && items.length === 0 ? placeholder : undefined}
          />
        </form>
      </WrapItem>
    </Wrap>
  )
}

const Tag = ({
  isFocused,
  content,
  onDeleteClick,
}: {
  isFocused?: boolean
  content: string
  onDeleteClick: () => void
}) => (
  <HStack
    spacing={0.5}
    borderWidth="1px"
    pl="1"
    rounded="sm"
    maxW="100%"
    borderColor={isFocused ? 'blue.500' : undefined}
    boxShadow={isFocused ? `0 0 0 1px ${colors['blue'][500]}` : undefined}
  >
    <Text fontSize="sm" noOfLines={1}>
      {content}
    </Text>
    <IconButton
      size="xs"
      icon={<CloseIcon />}
      aria-label="Remove tag"
      variant="ghost"
      onClick={onDeleteClick}
    />
  </HStack>
)
