import {
  FormArea,
  HoursArea,
  HoursPipe,
  HoursRow,
  SelectContainer,
} from './OfficeHoursBody.style'
import React, { WheelEventHandler, useEffect, useState } from 'react'
import Select, { ActionMeta, SingleValue } from 'react-select'
import { Interval } from './OfficeHoursBody'
import { TableListItemProps } from 'components/shared/TableListOcta'
import { Button } from '@chakra-ui/react'
import { DeleteIcon } from '@chakra-ui/icons'

type OptionType = { key: number; label: string; value: string }
export const getNumberWithTwoDigits = (number: number) =>
  number.toLocaleString('en-US', {
    minimumIntegerDigits: 2,
    useGrouping: false,
  })
export const OfficeHoursIntervalTimer = (
  props: TableListItemProps<Interval>
) => {
  let hoursByQuarter: Array<OptionType> = []
  let control = 0
  for (let i = 0; i < 24; i++) {
    hoursByQuarter = [
      ...hoursByQuarter,
      ...[0, 15, 30, 45].map((curr) => {
        const label =
          getNumberWithTwoDigits(i) + ':' + getNumberWithTwoDigits(curr)
        return { key: control++, label, value: label + ':00' }
      }),
    ]

    if (i === 23) {
      const lastMinuteOfDay = getNumberWithTwoDigits(i) + ':' + getNumberWithTwoDigits(59)
      hoursByQuarter.push({ key: control++, label: lastMinuteOfDay, value: lastMinuteOfDay + ':00' })
    }
  }

  useEffect(() => {
    const minIndex = hoursByQuarter.findIndex(
      (h) => h.value === props.item.minHour
    )
    setInitialHours([...hoursByQuarter.filter((h) => h.key > minIndex)])
  }, [props.item.minHour])

  const [initialHours, setInitialHours] =
    useState<Array<{ key: number; label: string; value: string }>>(
      hoursByQuarter
    )

  const [finalHours, setFinalHours] = useState<
    Array<{ key: number; label: string; value: string }>
  >([])

  const [endHour, setEndHour] = useState<OptionType>()
  const [initialHour, setInitialHour] = useState<OptionType>()

  useEffect(() => {
    if (!initialHour)
      setInitialHour(
        initialHours.find((s) => s.value === props.item.start) || undefined
      )
  }, [initialHours])

  useEffect(() => {
    if (!endHour)
      setEndHour(
        finalHours.find((s) => s.value === props.item.end) || undefined
      )
  }, [finalHours])

  useEffect(() => {
    if (props.item.end)
      setFinalHours([
        ...hoursByQuarter.filter((h) => h.key > (initialHour?.key || 0)),
      ])
  }, [initialHour])

  const onChangeInitialHour = (
    newValue: SingleValue<OptionType>,
    metaOption: ActionMeta<OptionType>
  ) => {
    const value = newValue as OptionType
    setInitialHour(value)
    if (!value) return

    setFinalHours([...hoursByQuarter.filter((h) => h.key > (value?.key || 0))])

    let endToSend = endHour?.value
    if (value.key > (endHour?.key || 0)) {
      endToSend = undefined
      onChangeFinalHour(
        null,
        { action: 'clear' } as ActionMeta<OptionType>,
        true
      )
    }

    props.onItemChange({ ...props.item, start: value.value, end: endToSend })
  }

  const onChangeFinalHour = (
    newValue: SingleValue<OptionType>,
    metaOption: ActionMeta<OptionType>,
    ignoreEvent?: boolean
  ) => {
    setEndHour(newValue as OptionType)

    if (ignoreEvent) return

    props.onItemChange({
      ...props.item,
      start: initialHour?.value,
      end: newValue?.value,
    })
  }

  const handleContentWheel: WheelEventHandler = (event) => {
    event.stopPropagation()
  }

  const onDeleteClick = () => props.onRemoveItem()

  return (
    <FormArea>
      <HoursArea>
        <HoursRow>
          <HoursPipe>De</HoursPipe>
          <SelectContainer data-screen={screen}>
            <div onWheelCapture={handleContentWheel}>
              <Select
                value={initialHour}
                isClearable={true}
                onChange={onChangeInitialHour}
                options={initialHours}
                placeholder={'Hora inicial'}
                getOptionLabel={(option: OptionType) => option.label}
                getOptionValue={(option: OptionType) => option.value}
              />
            </div>
          </SelectContainer>
          <HoursPipe>Até</HoursPipe>
          <SelectContainer data-screen={screen}>
            <div onWheelCapture={handleContentWheel}>
              <Select
                value={endHour}
                isClearable={true}
                isDisabled={(finalHours?.length || 0) === 0}
                noOptionsMessage={() => 'Selecione a hora inicial'}
                onChange={onChangeFinalHour}
                options={finalHours}
                placeholder={'Hora final'}
                getOptionLabel={(option: OptionType) => option.label}
                getOptionValue={(option: OptionType) => option.value}
              />
            </div>
          </SelectContainer>
        </HoursRow>
      </HoursArea>
      <Button onClick={onDeleteClick}>
        <DeleteIcon />
      </Button>
    </FormArea>
  )
}
