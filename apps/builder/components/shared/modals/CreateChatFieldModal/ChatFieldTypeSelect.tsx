import { Box } from '@chakra-ui/react'
import Select, { Props as SelectProps } from 'react-select'
import { Md123 } from 'react-icons/md'
import { BiCalendarEvent } from 'react-icons/bi'
import { TbCircle0Filled } from 'react-icons/tb'
import { BsFileTextFill } from "react-icons/bs";
import { LuScroll } from "react-icons/lu";
import { CustomFieldTypes } from 'enums/customFieldsEnum'

export const ChatFieldTypeSelect = (props: SelectProps) => {
  const options = [
    {
      value: CustomFieldTypes.Text,
      label: 'Texto curto',
      icon: BsFileTextFill,
    },
    {
      value: CustomFieldTypes.MultiText,
      label: 'Texto longo',
      icon: LuScroll,
    },
    {
      value: CustomFieldTypes.Numbers,
      label: 'Número inteiro',
      icon: Md123,
    },
    {
      value: CustomFieldTypes.Decimal,
      label: 'Número decimal',
      icon: TbCircle0Filled,
    },
    { value: CustomFieldTypes.Date, label: 'Data', icon: BiCalendarEvent },
  ]

  return (
    <Select
      defaultValue={options[0]}
      placeholder="Selecione o tipo de campo..."
      options={options}
      getOptionLabel={(props: any) => {
        const { icon: Icon, label } = props
        return (
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            gap={'8px'}
          >
            {Icon && <Icon />}
            <span>{label}</span>
          </Box>
        ) as unknown as string
      }}
      {...props}
    />
  )
}
