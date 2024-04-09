import OctaInput from 'components/octaComponents/OctaInput/OctaInput'
import OctaSelect, {
  SELECT_ACTION,
} from 'components/octaComponents/OctaSelect/OctaSelect'
import React, { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { OfficeHoursServices } from 'services/octadesk/officehours/officeHours.services'
import { OfficeHour } from '../../../../../../../../services/octadesk/officehours/officehours.types'
import { OfficeHoursFormType } from './OfficeHours.type'
import {
  ButtonCreate,
  Container,
  ContainerCreate,
  Description,
  FormArea,
  Title,
  FormControl,
  OptionRadio,
  Options,
  Toggle,
  ButtonCancel,
  ButtonDays,
  FormControlRow,
} from './OfficeHoursBody.style'
import { Flex, Text, useDisclosure } from '@chakra-ui/react'
import { ItemWithId, TableList } from 'components/shared/TableList'
import { OctaDivider } from 'components/octaComponents/OctaDivider/OctaDivider'
import { DayOfWeekComponent } from './DayOfWeek'
import { SpecialDateComponent } from './SpecialDate'
import { ConfirmModal } from 'components/modals/ConfirmModal'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

type Props = {
  options: OfficeHour
  onOptionsChange: (options: any) => void
}

export type Interval = {
  start?: string
  end?: string
  minHour?: string
}

export type DayOfWeek = {
  dayOfWeek: number
  hours: Array<Interval>
}

export type SpecialDate = {
  date?: string
  dayOfWeek?: number
  hours?: Array<Interval>
}

enum ScreensType {
  SETTINGS = 'SETTINGS',
  CREATE_OFFICE_HOURS = 'CREATE-OFFICE-HOURS',
}

export const dayPerNumber = (number: number): { min: string; full: string } => {
  switch (number) {
    case 1:
      return { min: 'SEG', full: 'Segunda-feira' }
    case 2:
      return { min: 'TER', full: 'Terça-feira' }
    case 3:
      return { min: 'QUA', full: 'Quarta-feira' }
    case 4:
      return { min: 'QUI', full: 'Quinta-feira' }
    case 5:
      return { min: 'SEX', full: 'Sexta-feira' }
    case 6:
      return { min: 'SÁB', full: 'Sábado' }
    case 7:
      return { min: 'DOM', full: 'Domingo' }
    default:
      return { min: '', full: '' }
  }
}

type OptionOfficeHourSelect = {
  label: string
  value: any
  isTitle?: boolean
  key: number
}

export const OfficeHoursBody = ({ options, onOptionsChange }: Props) => {
  const service = new OfficeHoursServices()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [deletingId, setDeletingId] = useState<string>()
  const [officeHour, setOfficeHour] = useState<Array<OfficeHour> | undefined>()
  const [optionsTimezone, setOptionsTimezone] =
    useState<Array<{ key: string; label: string; value: string }>>()
  const [optionsOfficeHour, setOptionsOfficeHours] = useState<
    Array<OptionOfficeHourSelect>
  >([])
  const [screen, setScreen] = useState<'SETTINGS' | 'CREATE-OFFICE-HOURS'>(
    'SETTINGS'
  )
  const [is24hours, setIs24Hours] = useState<boolean>(true)
  const [hasSpecialDates, setHasSpecialDates] = useState<boolean>(false)
  const [hasSameHour, setHasSameHour] = useState<boolean>(true)
  const [isEdited, setisEdited] = useState<boolean>(false)
  const schema = z.object({
    name: z
      .string()
      .min(1, { message: 'Campo obrigatório' })
      .max(255, { message: 'Campo obrigatório' })
      .refine(
        (value) => {
          return !optionsOfficeHour.some(
            (createdOption) =>
              createdOption.label === value &&
              createdOption.value.id !== currentId
          )
        },
        { message: 'Esse nome já existe na sua lista' }
      ),
    timezone: z.string().min(1, { message: 'Campo obrigatório' }),
  })
  const {
    trigger,
    setValue,
    getValues,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      timezone: '',
    },
  })

  const handleToggle = () => {
    setHasSpecialDates((prevHasSpecialDates) => !prevHasSpecialDates)
  }

  const defaultSameHourOption = {
    id: '-1',
    type: 'dayofweek',
    dayOfWeek: -1,
    hours: [{ start: undefined, end: undefined }],
  }
  const WEEK_DAYS = [7, 1, 2, 3, 4, 5, 6]

  const [selectedDays, setSelectedDays] = useState<Array<number>>([
    1, 2, 3, 4, 5,
  ])
  const [daysOfWeek, setDaysOfWeek] = useState<Array<ItemWithId<DayOfWeek>>>([
    {
      ...defaultSameHourOption,
    },
  ])
  const [specialDates, setSpecialDates] = useState<
    Array<ItemWithId<SpecialDate>>
  >([
    {
      id: 'sp0',
      type: 'specialDate',
      hours: [],
    },
  ])

  const [currentId, setCurrentId] = useState<string | undefined>(options?.id)

  const handleToggleSameDayHour = () => {
    setHasSameHour((prevHasSameHour) => !prevHasSameHour)
    if (hasSameHour) changeSelectedDay(true)
    else setDaysOfWeek([{ ...defaultSameHourOption }])
  }

  const changeSelectedDay = (forceSet?: boolean) => {
    if (hasSameHour && !forceSet) return

    const daysOfWeekReplace = selectedDays.sort().map((dayOfWeek) => {
      const current = daysOfWeek.find((d) => d.dayOfWeek === dayOfWeek)
      return {
        id: dayOfWeek.toString(),
        type: 'dayofweek',
        dayOfWeek,
        hours: [...(current?.hours || [{}])],
      } as ItemWithId<DayOfWeek>
    })

    setDaysOfWeek(daysOfWeekReplace)
  }

  const setCurrentOffice = (current: OfficeHour | undefined) => {
    setValue('name', current?.name || '')
    setValue('timezone', current?.timeZone || '')
    setIs24Hours(
      current?.daysOfWeek?.is24hours !== undefined
        ? current.daysOfWeek.is24hours
        : true
    )
    const sameSchedule =
      current?.daysOfWeek?.sameSchedule !== undefined
        ? current.daysOfWeek.sameSchedule
        : true
    setHasSameHour(sameSchedule)
    setHasSpecialDates(
      current?.specialDates?.active !== undefined
        ? current.specialDates.active
        : false
    )

    const currentDays = current?.daysOfWeek?.days?.map((s) => s.dayOfWeek)
    setSelectedDays(currentDays || [1, 2, 3, 4, 5])

    const firstDay = current?.daysOfWeek?.days?.length
      ? current.daysOfWeek.days[0]
      : undefined

    const days =
      sameSchedule && firstDay?.hours
        ? [{ ...defaultSameHourOption, hours: [...firstDay.hours] }]
        : current?.daysOfWeek?.days?.map((a, idx) => {
            return { id: `d${idx}`, type: 'day', ...a }
          })

    setDaysOfWeek(days || [{ ...defaultSameHourOption }])
    setSpecialDates(
      current?.specialDates?.dates?.map((s, idx) => {
        return {
          id: `sd${idx}`,
          ...s,
        }
      }) || []
    )
  }

  useEffect(() => {
    const current = officeHour?.find((s) => s.id === currentId)
    setCurrentOffice(current)
  }, [currentId, officeHour])

  useEffect(() => {
    changeSelectedDay()
  }, [selectedDays])

  const getOfficeHours = async () => {
    const expedients = await service.getExpedients()

    setOfficeHour(expedients)
  }

  useEffect(() => {
    if (!officeHour || isEdited) {
      getOfficeHours()
      setisEdited(false)
    }
  }, [isEdited, officeHour])

  type labelValue = {
    key: string
    label: string
    value: string
  }

  useEffect(() => {
    return () => {
      if (screen === ScreensType.CREATE_OFFICE_HOURS) {
        reset()
      }
    }
  }, [screen])

  useEffect(() => {
    const getTimezones = async () => {
      const timezones = await service.getTimeZones()

      const sortedOptions = timezones
        .map((timezone) => ({
          key: timezone.timezone,
          label: timezone.translation,
          value: timezone.timezone,
        }))
        .reduce((agg: labelValue[], curr: labelValue) => {
          if (!agg.find((c) => c.label === curr.label)) agg.push(curr)
          return agg
        }, [])
        .sort((a, b) => {
          if (a.value === 'America/Sao_Paulo') {
            return -1
          }
          if (b.value === 'America/Sao_Paulo') {
            return 1
          }
          return a.label.localeCompare(b.label)
        })

      setOptionsTimezone(sortedOptions)
    }

    if (!optionsTimezone) {
      getTimezones()
    }
  }, [])

  useEffect(() => {
    changeSelectedDay()
  }, [])

  useEffect(() => {
    if (officeHour && officeHour.length) {
      const options = officeHour.map((item, idx) => ({
        label: item.name,
        value: item,
        key: idx,
      }))
      setOptionsOfficeHours(options)
    }
  }, [officeHour])

  const changeScreenToCreateOfficeHour = (): void => {
    setCurrentId(undefined)
    setScreen('CREATE-OFFICE-HOURS')
  }

  const saveOfficeHour = async (): Promise<OfficeHour | null> => {
    const toSave = {
      id: currentId,
      name: getValues('name'),
      specialDates: {
        active: hasSpecialDates,
        dates: hasSpecialDates ? specialDates : [],
      },
      timeZone: getValues('timezone'),
      daysOfWeek: {
        days: is24hours ? [] : (daysOfWeek as Array<DayOfWeek>),
        is24hours,
        sameSchedule: !is24hours && hasSameHour,
      },
    }

    if (!is24hours && hasSameHour) {
      const sameDay = daysOfWeek.find((s) => s.dayOfWeek < 0)
      toSave.daysOfWeek.days = selectedDays.map((dayOfWeek) => {
        return {
          dayOfWeek,
          hours: sameDay?.hours.map((h) => {
            return { start: h.start, end: h.end }
          }),
        } as DayOfWeek
      })
    }

    const saved = await (toSave.id
      ? service.updateOfficeHour(toSave as OfficeHoursFormType)
      : service.createOfficeHour(toSave as OfficeHoursFormType))

    await getOfficeHours()
    handleOfficeHourSelect(saved)
    setScreen('SETTINGS')
    setisEdited(true)

    return saved
  }

  const cancelCreate = (): void => {
    setScreen('SETTINGS')
  }

  const handleChangeName = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setValue('name', value)
    trigger('name')
  }

  const handleChangeTimezone = (selectedOption: string) => {
    setValue('timezone', selectedOption)
    trigger('timezone')
  }

  const handleSelectDaysOfWeek = (number: number): void => {
    const hasSelectedDay = selectedDays.indexOf(number)

    if (hasSelectedDay <= -1) {
      return setSelectedDays((values) => [...values, number])
    }
    const updatedSelectedDays = [...selectedDays]
    updatedSelectedDays.splice(hasSelectedDay, 1)
    return setSelectedDays(updatedSelectedDays)
  }

  const handleOfficeHourSelect = (calendar: any): void => {
    onOptionsChange(calendar)
  }

  const handleDayOfWeekChange = (
    values: ItemWithId<DayOfWeek>[],
    add?: boolean
  ) => {
    setDaysOfWeek([...values])
  }

  const handleSpecialDatesChange = (
    values: ItemWithId<SpecialDate>[],
    add?: boolean
  ) => {
    setSpecialDates([...values])
  }

  const handleIconClicked = async (value: any, action: SELECT_ACTION) => {
    switch (action) {
      case SELECT_ACTION.DELETE:
        setDeletingId(value.id)
        onOpen()
        return
      case SELECT_ACTION.EDIT:
        setCurrentId(value.id)
        await service.getOfficeHour(value.id).then((officeHour) => {
          setCurrentOffice(officeHour)
          setScreen('CREATE-OFFICE-HOURS')
        })

      default:
        return
    }
  }

  const onDeleteClick = async () => {
    onClose()
    if (!deletingId) return

    const deleted = await service.deleteOfficeHour(deletingId)
    if (deleted) getOfficeHours()

    setDeletingId(undefined)
  }

  return (
    <>
      {screen === 'SETTINGS' && (
        <Container>
          <Title>Configure o atendimento</Title>
          <FormArea>
            <FormControl>
              {
                <>
                  <ConfirmModal
                    isOpen={isOpen}
                    onConfirm={onDeleteClick}
                    onClose={onClose}
                    message={
                      <Text>
                        Deseja mesmo excluir esse horário de atendimento? Essa
                        ação não poderá ser desfeita.
                      </Text>
                    }
                    confirmButtonLabel={'Confirmar'}
                    title={'Deseja continuar?'}
                  />

                  <OctaSelect
                    key={'office-hours-select'}
                    options={optionsOfficeHour}
                    findable
                    onChange={(e) => handleOfficeHourSelect(e)}
                    placeholder="Selecione um expediente"
                    label="Qual horário de expediente este bot irá atender?"
                    showEdit={true}
                    showDelete={true}
                    onIconClicked={handleIconClicked}
                    defaultSelected={currentId}
                  />
                </>
              }
            </FormControl>
          </FormArea>
          <ButtonCreate onClick={changeScreenToCreateOfficeHour}>
            Criar novo horário de expediente
          </ButtonCreate>
        </Container>
      )}
      {screen === 'CREATE-OFFICE-HOURS' && (
        <form onSubmit={(e) => event?.preventDefault()}>
          <ContainerCreate>
            <Title>Novo horário de expediente</Title>
            <Description>
              Defina o fuso, dias e horários em que seu time está disponível e
              prepare seu bot para atender as conversas que iniciarem fora desse
              horário
            </Description>
            <FormArea>
              <FormControl>
                <FormControlRow>
                  <Text width={'50%'}>Dê um nome para esse expediente</Text>
                  {optionsTimezone && (
                    <Text width={'50%'}>
                      Qual é o fuso horário do expediente?
                    </Text>
                  )}
                </FormControlRow>
                <FormControlRow>
                  <Flex w="full" flexDirection={'column'} mr={2}>
                    <OctaInput
                      id="name"
                      name="name"
                      placeholder="Novo horário expediente"
                      onChange={handleChangeName}
                      label=""
                      margin-right={'10px'}
                      value={getValues('name')}
                    />
                    <Text color={'red.400'}>{errors.name?.message}</Text>
                  </Flex>
                  {optionsTimezone && (
                    <Flex w="full" flexDirection={'column'}>
                      <OctaSelect
                        findable
                        key={'timezone-select'}
                        options={optionsTimezone}
                        defaultValue="America/Sao_Paulo"
                        onChange={(value) => handleChangeTimezone(value)}
                        value={getValues('timezone')}
                        placeholder="Selecione um fuso horário"
                        defaultSelected={getValues('timezone')}
                        width={'100%'}
                      />
                      <Text color={'red.400'}>{errors.timezone?.message}</Text>
                    </Flex>
                  )}
                </FormControlRow>
              </FormControl>
            </FormArea>
            <FormArea>
              <FormControl></FormControl>
            </FormArea>
            <FormArea>
              <FormControlRow>
                <Text>A sua operação é 24/7?</Text>
                <Options>
                  <OptionRadio>
                    <input
                      type="radio"
                      name="operation"
                      id="yes"
                      defaultChecked={is24hours}
                      onChange={() => setIs24Hours(true)}
                    />{' '}
                    Sim
                  </OptionRadio>
                  <OptionRadio>
                    <input
                      type="radio"
                      name="operation"
                      id="not"
                      defaultChecked={!is24hours}
                      onChange={() => setIs24Hours(false)}
                    />{' '}
                    Não
                  </OptionRadio>
                </Options>
              </FormControlRow>
            </FormArea>

            <div>
              {!is24hours && (
                <>
                  <FormArea>
                    <h4>
                      Em quais dias você estará <strong>disponível</strong>?
                    </h4>
                  </FormArea>
                  <FormArea>
                    {WEEK_DAYS.map((day) => (
                      <ButtonDays
                        key={day}
                        onClick={() => handleSelectDaysOfWeek(day)}
                        className={selectedDays.includes(day) ? 'active' : ''}
                      >
                        {dayPerNumber(day).min}
                      </ButtonDays>
                    ))}
                  </FormArea>
                  <FormArea>
                    {hasSameHour}
                    <Toggle>
                      <input
                        type="checkbox"
                        id="switchSameHour"
                        onChange={handleToggleSameDayHour}
                        checked={hasSameHour}
                      />
                      <label htmlFor="switchSameHour">Toggle</label>
                      <div className="input-label">
                        Usar o mesmo horário para todos os dias
                      </div>
                    </Toggle>
                  </FormArea>
                  <TableList<ItemWithId<DayOfWeek>>
                    initialItems={daysOfWeek}
                    onItemsChange={handleDayOfWeekChange}
                    itemsList={daysOfWeek}
                    Item={DayOfWeekComponent}
                    shouldHideButton={true}
                    debounceTimeout={0}
                    ComponentBetweenItems={() => <OctaDivider width="100%" />}
                    buttonWidth="50%"
                  />
                </>
              )}
            </div>
            <FormArea>
              {hasSpecialDates}
              <Toggle>
                <input
                  type="checkbox"
                  id="switch"
                  onChange={handleToggle}
                  checked={hasSpecialDates}
                />
                <label htmlFor="switch">Toggle</label>
                <div className="input-label">
                  Incluir datas e horários especiais
                </div>
              </Toggle>
            </FormArea>
            {hasSpecialDates && (
              <TableList<ItemWithId<SpecialDate>>
                initialItems={specialDates}
                onItemsChange={handleSpecialDatesChange}
                Item={SpecialDateComponent}
                addLabel="Adicionar data"
                debounceTimeout={0}
                ComponentBetweenItems={() => <OctaDivider width="100%" />}
                minItems={1}
                buttonWidth="50%"
              />
            )}
            <FormArea>
              <ButtonCreate
                onClick={handleSubmit((values) => saveOfficeHour())}
              >
                Salvar
              </ButtonCreate>
              <ButtonCancel onClick={cancelCreate}>Cancelar</ButtonCancel>
            </FormArea>
          </ContainerCreate>
        </form>
      )}
    </>
  )
}
