import { DetailedHTMLProps, InputHTMLAttributes, ChangeEvent } from 'react'

export type OctaSelectProps = {
  items: Array<SelectItems<OptionItem>>
  onChange: (e: OptionItem) => void
} & DetailedHTMLProps<InputHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>

type SelectItems<T> = T

export type OptionItem = {
  label: string
  value: any
  isTitle?: boolean
  disabled?: boolean
}
