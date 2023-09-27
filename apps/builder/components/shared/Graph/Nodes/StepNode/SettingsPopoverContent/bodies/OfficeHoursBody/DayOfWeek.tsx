import { FormArea } from './OfficeHoursBody.style'
import React from 'react'
import { DayOfWeek, Interval, dayPerNumber } from './OfficeHoursBody'
import { TableListItemProps } from 'components/shared/TableListOcta'
import { Stack, Text } from '@chakra-ui/react'
import { ItemWithId, TableList } from 'components/shared/TableList'
import { OctaDivider } from 'components/octaComponents/OctaDivider/OctaDivider'
import { OfficeHoursIntervalTimer } from './OfficeHoursIntervalTimer'

export const DayOfWeekComponent = (
  props: TableListItemProps<ItemWithId<DayOfWeek>>
) => {
  const handleIntervalChange = (values: Interval[], add?: boolean) => {
    if (add) {
      const newInterval = values[values.length - 1]
      const previousInterval = values[values.length - 2]
      newInterval.minHour = previousInterval?.end
      return
    }

    props.onItemChange({ ...props.item, hours: values })
  }

  return (
    <Stack width={'100%'}>
      <Text>{dayPerNumber(props.item.dayOfWeek).full}</Text>
      <TableList<Interval>
        initialItems={props.item.hours}
        onItemsChange={handleIntervalChange}
        Item={OfficeHoursIntervalTimer}
        addLabel="Adicionar intervalo"
        debounceTimeout={0}
        ComponentBetweenItems={() => <OctaDivider width="100%" />}
        buttonWidth="50%"
      />
    </Stack>
  )
}
