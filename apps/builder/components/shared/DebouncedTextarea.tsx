import { Textarea, TextareaProps } from '@chakra-ui/react'
import { ChangeEvent, useEffect, useState } from 'react'

type Props = Omit<TextareaProps, 'onChange' | 'value'> & {
  initialValue: string
  onChange: (debouncedValue: string) => void
}

export const DebouncedTextarea = ({
  onChange,
  initialValue,
  ...props
}: Props) => {
  const [currentValue, setCurrentValue] = useState(initialValue)

  useEffect(() => {
    if (currentValue === initialValue) return
    onChange(currentValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentValue])

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
