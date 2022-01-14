import { Textarea, TextareaProps } from '@chakra-ui/react'
import { ChangeEvent, useEffect, useState } from 'react'
import { useDebounce } from 'use-debounce'

type Props = Omit<TextareaProps, 'onChange' | 'value'> & {
  delay: number
  initialValue: string
  onChange: (debouncedValue: string) => void
}

export const DebouncedTextarea = ({
  delay,
  onChange,
  initialValue,
  ...props
}: Props) => {
  const [currentValue, setCurrentValue] = useState(initialValue)
  const [currentValueDebounced] = useDebounce(currentValue, delay)

  useEffect(() => {
    if (currentValueDebounced === initialValue) return
    onChange(currentValueDebounced)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentValueDebounced])

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentValue(e.target.value)
  }

  return (
    <Textarea
      {...props}
      value={currentValue}
      onChange={handleChange}
      resize={'vertical'}
    />
  )
}
