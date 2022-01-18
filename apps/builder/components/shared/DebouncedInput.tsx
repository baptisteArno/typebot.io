import { Input, InputProps } from '@chakra-ui/react'
import {
  ChangeEvent,
  ForwardedRef,
  forwardRef,
  useEffect,
  useState,
} from 'react'
import { useDebounce } from 'use-debounce'

type Props = Omit<InputProps, 'onChange' | 'value'> & {
  delay: number
  initialValue: string
  onChange: (debouncedValue: string) => void
}

export const DebouncedInput = forwardRef(
  (
    { delay, onChange, initialValue, ...props }: Props,
    ref: ForwardedRef<HTMLInputElement>
  ) => {
    const [currentValue, setCurrentValue] = useState(initialValue)
    const [currentValueDebounced] = useDebounce(currentValue, delay)

    useEffect(() => {
      if (currentValueDebounced === initialValue) return
      onChange(currentValueDebounced)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentValueDebounced])

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      setCurrentValue(e.target.value)
    }

    return (
      <Input
        {...props}
        ref={ref}
        value={currentValue}
        onChange={handleChange}
      />
    )
  }
)
