import { Textarea, TextareaProps } from '@chakra-ui/react'
import { ChangeEvent, useEffect, useState } from 'react'
import { useDebounce } from 'use-debounce'

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
  const [debouncedValue] = useDebounce(
    currentValue,
    process.env.NEXT_PUBLIC_E2E_TEST ? 0 : 1000
  )

  useEffect(() => {
    if (debouncedValue === initialValue) return
    onChange(debouncedValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue])

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
