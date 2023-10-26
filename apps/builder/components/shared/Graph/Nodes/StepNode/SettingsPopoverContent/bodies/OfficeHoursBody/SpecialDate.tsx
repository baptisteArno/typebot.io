import {
  FormArea,
  FormControlRow,
  Label,
  OptionRadio,
  Options,
  SpecialDateContainer,
} from './OfficeHoursBody.style'
import React, { useState } from 'react'
import { Interval, SpecialDate } from './OfficeHoursBody'
import { TableListItemProps } from 'components/shared/TableListOcta'
import { Box, FormControl, HStack, Stack, Text, Button } from '@chakra-ui/react'
import { ItemWithId, TableList } from 'components/shared/TableList'
import { OctaDivider } from 'components/octaComponents/OctaDivider/OctaDivider'
import {
  OfficeHoursIntervalTimer,
  getNumberWithTwoDigits,
} from './OfficeHoursIntervalTimer'
import OctaInput from 'components/octaComponents/OctaInput/OctaInput'
import DatePicker, { registerLocale } from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import br from 'date-fns/locale/pt-BR'
import { Container } from 'components/octaComponents/OctaInput/OctaInput.style'
import { DeleteIcon } from '@chakra-ui/icons'
registerLocale('pt-br', br)

export const SpecialDateComponent = (
  props: TableListItemProps<ItemWithId<SpecialDate>>
) => {
  const date = props?.item?.date ? new Date(props.item.date) : new Date()
  date.setTime(date.getTime() + 3 * 3600 * 1000)
  const [currentDate, setCurrentDate] = useState<Date>(date)
  const [isAvailable, setIsAvailable] = useState<boolean>(
    (props?.item?.hours?.length || 0) > 0
  )
  const [intervals, setIntervals] = useState<Array<Interval>>([
    ...(props?.item?.hours || [{ start: undefined, end: undefined }]),
  ])

  const handleIntervalChange = (values: Interval[], add?: boolean) => {
    if (add) {
      const newInterval = values[values.length - 1]
      const previousInterval = values[values.length - 2]
      newInterval.minHour = previousInterval?.end
      return
    }

    props.onItemChange({ ...props.item, hours: values })
  }

  const changeDate = (date: Date) => {
    setCurrentDate(date)
    const dateAsString =
      date.getFullYear() +
      '-' +
      getNumberWithTwoDigits(date.getMonth() + 1) +
      '-' +
      getNumberWithTwoDigits(date.getDate()) +
      'T00:00:00'
    props.onItemChange({ ...props.item, date: dateAsString })
  }

  const handleIsAvailableChange = (isAvailable: boolean) => {
    setIsAvailable(isAvailable)
    if (isAvailable) setIntervals([{ start: undefined, end: undefined }])
  }

  const onDeleteClick = () => props.onRemoveItem()

  return (
    <Box
      borderWidth={'1.5px'}
      borderRadius={'5px'}
      width={'100%'}
      padding="10px"
    >
      <Container>
        <HStack marginBottom={'10px'} width={'100%'}>
          <Label>Data:</Label>
          <DatePicker
            selected={currentDate}
            onChange={(date: Date) => changeDate(date)}
            dateFormat="dd/MM/yyyy"
            locale={'pt-br'}
          />
          <Stack marginInlineStart={'auto!important'}>
            <Button height="50px" onClick={onDeleteClick}>
              <DeleteIcon />
            </Button>
          </Stack>
        </HStack>
        <FormArea>
          <FormControlRow>
            <Label>O seu time estará disponível nesta data?</Label>
            <Options>
              <OptionRadio>
                <input
                  type="radio"
                  name={'available-special-date' + props.item.id}
                  id="yes"
                  onChange={() => handleIsAvailableChange(true)}
                  checked={isAvailable}
                />{' '}
                Sim
              </OptionRadio>
              <OptionRadio>
                <input
                  type="radio"
                  name={'available-special-date' + props.item.id}
                  id="not"
                  onChange={() => handleIsAvailableChange(false)}
                  checked={!isAvailable}
                />{' '}
                Não
              </OptionRadio>
            </Options>
          </FormControlRow>
        </FormArea>
        {isAvailable && (
          <TableList<Interval>
            initialItems={intervals}
            onItemsChange={handleIntervalChange}
            Item={OfficeHoursIntervalTimer}
            addLabel="Adicionar intervalo"
            debounceTimeout={0}
            ComponentBetweenItems={() => <OctaDivider width="100%" />}
            buttonWidth="50%"
          />
        )}
      </Container>
    </Box>
  )
}
