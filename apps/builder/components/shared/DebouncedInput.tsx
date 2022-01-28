import { Input, InputProps } from '@chakra-ui/react'
import {
  ChangeEvent,
  ForwardedRef,
  forwardRef,
  useEffect,
  useState,
} from 'react'

type Props = Omit<InputProps, 'onChange' | 'value'> & {
  initialValue: string
  onChange: (debouncedValue: string) => void
}

export const DebouncedInput = forwardRef(
  (
    { onChange, initialValue, ...props }: Props,
    ref: ForwardedRef<HTMLInputElement>
  ) => {
    const [currentValue, setCurrentValue] = useState(initialValue)

    useEffect(() => {
      if (currentValue === initialValue) return
      onChange(currentValue)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentValue])

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
