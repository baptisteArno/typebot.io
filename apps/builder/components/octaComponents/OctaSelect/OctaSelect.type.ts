import React, { DetailedHTMLProps, InputHTMLAttributes } from 'react'

export type OctaSelectProps = {
  onChange: (value: any, itemFull?: any) => void
  defaultSelected?: any
  label?: string;
  findable?: boolean;
  options?: Array<OptionType>;
} & DetailedHTMLProps<InputHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>

export type OptionProps = {
  value: any;
  children?: string;
  optionKey?: string | number;
  isTitle?: boolean;
  disabled?: boolean;
  selected: any;
} & DetailedHTMLProps<InputHTMLAttributes<HTMLLIElement>, HTMLLIElement>

export type OptionType = {
  value: any;
  label: string;
  isTitle?: boolean;
  disabled?: boolean;
  key: string | number;
  optionKey?: string | number;
  subType?: string;
}
