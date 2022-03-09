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
  initialValue: string
  onChange: (debouncedValue: string) => void
}

export const DebouncedInput = forwardRef(
  (
    { onChange, initialValue, ...props }: Props,
    ref: ForwardedRef<HTMLInputElement>
  ) => {
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

    const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
      setCurrentValue(e.target.value)

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
