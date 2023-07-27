import { Button } from 'components/octaComponents/OctaButton/OctaButton.style'
import OctaInput from 'components/octaComponents/OctaInput/OctaInput'
import OctaSelect from 'components/octaComponents/OctaSelect/OctaSelect'
import { SourceEndpoint } from 'components/shared/Graph/Endpoints'
import { Step } from 'models'
import { parse } from 'path'
import React, {
  ChangeEvent,
  ChangeEventHandler,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { OfficeHoursServices } from 'services/octadesk/officehours/officeHours.services'
import { OfficeHour } from '../../../../../../../../services/octadesk/officehours/officehours.types'
import { DayInfo, OfficeHoursFormType } from './OfficeHours.type'
import {
  ButtonCreate,
  Container,
  ContainerCreate,
  Description,
  FormArea,
  Label,
  Title,
  FormControl,
  OptionRadio,
  Options,
  Toggle,
  ButtonCancel,
  ButtonDays,
  HoursArea,
  HoursControl,
  HoursPipe,
  HoursRow,
  HourDay,
} from './OfficeHoursBody.style'
import { format } from 'path/posix'
​
type Props = {
  step: Step
  onOptionsChange: (options: any) => void
  onExpand?: () => void
}
​
export const OfficeHoursBody = ({ step, onExpand, onOptionsChange }: Props) => {
  const service = new OfficeHoursServices()
  const [officeHour, setOfficeHour] = useState<Array<OfficeHour> | undefined>()
  const [optionsTimezone, setOptionsTimezone] =
    useState<Array<{ label: string; value: string; isTitle?: boolean }>>()
  const [optionsOfficeHour, setOptionsOfficeHours] = useState<
    Array<{ label: string; value: any; isTitle?: boolean; key: number }>
  >([])
  const [screen, setScreen] = useState<'SETTINGS' | 'CREATE-OFFICE-HOURS'>(
    'SETTINGS'
  )
​
  const [is24hours, setIs24Hours] = useState<boolean>(true)
​
  const WEEK_DAYS = [1, 2, 3, 4, 5, 6, 7]
  type dayOfWeek = {
    dayOfWeek: number
    hours: Array<{
      start: string
      end: string
    }>
  }
  const [daysOfWeek, setDaysOfWeek] = useState<{
    days: Array<dayOfWeek>
    is24hours: boolean
    sameSchedule: boolean
  }>()
  const [selectedDays, setSelectedDays] = useState<Array<number>>([])
  const [officeHoursName, setOfficeHoursName] = useState('')
  const [officeHoursTimezone, setOfficeHoursTimezone] = useState('')
​
  const [form, setForm] = useState<OfficeHoursFormType>()
​
  const officeHoursMemo = useMemo(() => {
    return officeHour
  }, [officeHour])
​
​
  const dayPerNumber = (number: number): { min: string; full: string } => {
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
​
  useEffect(() => {
    const getOfficeHours = async () => {
      const expedients = await service.getExpedients()
​
      setOfficeHour(expedients)
    }
​
    if (!officeHour) {
      getOfficeHours()
    }
  })
​
  useEffect(() => {
    const getTimezones = async () => {
      const timezones = await service.getTimeZones()
​
      const sortedOptions = timezones.map((timezone) => ({
        label: timezone.translation,
        value: timezone.timezone,
      }))
​
      sortedOptions.sort((a, b) => {
        if (a.value === 'America/Sao_Paulo') {
          return -1
        }
        if (b.value === 'America/Sao_Paulo') {
          return 1
        }
        return a.label.localeCompare(b.label)
      })
​
      setOptionsTimezone(sortedOptions)
    }
​
    if (!optionsTimezone) {
      getTimezones()
    }
  }, [])
​
  useEffect(() => {
    if (officeHoursMemo && officeHoursMemo.length) {
      const options = officeHoursMemo.map((item, idx) => ({
        label: item.name,
        value: item,
        key: idx,
      }))
      setOptionsOfficeHours(options)
    }
  }, [officeHoursMemo])
​
  const changeScreenToCreateOfficeHour = (): void => {
    setScreen('CREATE-OFFICE-HOURS')
  }
​
  const createOfficeHour = async (): Promise<OfficeHour | null> => {
    // console.log('createOfficeHour', form)
    // if (form) {
    //   console.log('bateu aqui')
    //    const formTest = {
    //       "name":"teste 24/766",
    //       "daysOfWeek":{
    //           "is24hours":true,
    //           days: [],
    //           sameSchedule: false
    //         },
    //        "specialDates":{
    //        "active":false
    //       },
    //       "timeZone":"America/Sao_Paulo"
    //     };
    //   const saved = await service.createOfficeHour(form)
    //   handleOfficeHourSelect(saved)
​
    //   return saved
    // }
​
    return null
  }
​
  const cancelCreate = (): void => {
    setScreen('SETTINGS')
  }
​
  const handleChangeName = (event: ChangeEvent<HTMLInputElement>): void => {
    const { value } = event.target
​
    setOfficeHoursName(value)
  }
​
  const handleChangeTimezone = (selectedOption: string) => {
    setOfficeHoursTimezone(selectedOption)
    // setForm((prevForm) => ({
    //   ...prevForm,
    //   timeZone: selectedOption,
    // }))
  }
​
  // useEffect(() => {
  //   // setForm((prevForm) => ({
  //   //   ...prevForm,
  //   //   daysOfWeek: {
  //   //     ...prevForm.daysOfWeek,
  //   //     is24hours: is24hours,
  //   //   },
  //   // }))
  // }, [is24hours])
​
  const handleSelectDaysOfWeek = (number: number): void => {
    const hasSelectedDay = selectedDays.indexOf(number)
    if (!form) {
      setForm({
        daysOfWeek: {
          days: [
            {
              dayOfWeek: number,
              hours: [
                {
                  start: '',
                  end: '',
                },
              ],
            },
          ],
          is24hours: is24hours,
          sameSchedule: true,
        },
        specialDates: { active: true },
        name: officeHoursName,
        timeZone: officeHoursTimezone,
      })
    } else {
      setForm({
        ...form,
        daysOfWeek: {
          days: [
            ...form.daysOfWeek.days,
            {
              dayOfWeek: number,
              hours: [
                {
                  start: '',
                  end: '',
                },
              ],
            },
          ],
          is24hours: is24hours,
          sameSchedule: true,
        },
      })
    }
​
    if (hasSelectedDay <= -1) {
      return setSelectedDays((values) => [...values, number])
    }
    return setSelectedDays((values) => values.splice(hasSelectedDay, 0))
  }
​
  const handleSelectHours = (e: any): void => {
    const { value, dataset, name } = e.target
    e.stopPropagation()
​
    const dayIndex = selectedDays.findIndex(
      (selectedDay) => selectedDay.toString() === dataset.day.toString()
    )
​
    const day = form?.daysOfWeek.days.find(
      (dayOfWeek) => dayOfWeek.dayOfWeek.toString() === dataset.day.toString()
    )
​
    const selectedHours = {
      start: name === 'start' ? value : day?.hours[0].start,
      end: name === 'end' ? value : day?.hours[0].end,
    }
​
    const mount = {
      dayOfWeek: day?.dayOfWeek,
      hours: [selectedHours],
    } as any
​
    if (form?.daysOfWeek?.days && mount) {
      const index = form?.daysOfWeek?.days?.findIndex(
        (s) => s.dayOfWeek.toString() === mount?.dayOfWeek.toString()
      )
​
      form.daysOfWeek.days[index] = mount
      setForm({ ...form })
    }
  }
​
  const handleOfficeHourSelect = (calendar: any): void => {
    onOptionsChange(calendar)
  }
​
  return (
    <>
      {screen === 'SETTINGS' && (
        <Container>
          <Title>Configure o atendimento</Title>
          <FormArea>
            <FormControl>
              {
                <OctaSelect
                  key={'office-hours-select'}
                  options={optionsOfficeHour}
                  findable
                  onChange={(e) => handleOfficeHourSelect(e)}
                  placeholder="Selecione um expediente"
                  label="Qual horário de expediente este bot irá atender?"
                ></OctaSelect>
              }
            </FormControl>
          </FormArea>
          <ButtonCreate onClick={changeScreenToCreateOfficeHour}>
            Criar novo horário de expediente
          </ButtonCreate>
        </Container>
      )}
      {screen === 'CREATE-OFFICE-HOURS' && (
        <ContainerCreate>
          <Title>Novo horário de expediente</Title>
          <Description>
            Defina o fuso, dias e horários em que seu time está disponível e
            prepare seu bot para atender as conversas que iniciarem fora desse
            horário
          </Description>
          <FormArea>
            <FormControl>
              <OctaInput
                name="name"
                placeholder="Novo horário expediente"
                label="Dê um nome para esse expediente"
                onChange={handleChangeName}
                required
              />
            </FormControl>
          </FormArea>
          <FormArea>
            <FormControl>
              {optionsTimezone && (
                <OctaSelect
                  findable
                  key={'timezone-select'}
                  options={optionsTimezone}
                  defaultValue="America/Sao_Paulo"
                  onChange={handleChangeTimezone}
                  // value={form?.timeZone}
                  placeholder="Selecione um fuso horário"
                  label="Qual é o fuso horário do expediente?"
                />
              )}
            </FormControl>
          </FormArea>
          <FormArea>
            <FormControl>
              <Label style={{ width: '70%' }}>A sua operação é 24/7?</Label>
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
            </FormControl>
          </FormArea>
​
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
                  <HoursArea>
                    {selectedDays
                      .sort((a, b) => a - b)
                      .map((day) => (
                        <div key={day}>
                          <HourDay>{dayPerNumber(day).full}</HourDay>
                          <HoursRow>
                            <HoursControl>
                              <OctaInput
                                placeholder="Início"
                                mask="99:99"
                                name="start"
                                data-day={`${day}`}
                                onBlur={handleSelectHours}
                              />
                            </HoursControl>
                            <HoursPipe>até</HoursPipe>
                            <HoursControl>
                              <OctaInput
                                placeholder="Fim"
                                mask="99:99"
                                name="end"
                                data-day={`${day}`}
                                onBlur={handleSelectHours}
                              />
                            </HoursControl>
                          </HoursRow>
                        </div>
                      ))}
                  </HoursArea>
                </FormArea>
              </>
            )}
          </div>
          {/* <FormArea>
            <Toggle>
              <input type="checkbox" id="switch" />
              <label htmlFor="switch">Toggle</label>
              <div className="input-label">
                Incluir datas e horários especiais
              </div>
            </Toggle>
          </FormArea> */}
          <FormArea>
            <ButtonCreate onClick={createOfficeHour}>Salvar</ButtonCreate>
            <ButtonCancel onClick={cancelCreate}>Cancelar</ButtonCancel>
          </FormArea>
        </ContainerCreate>
      )}
    </>
  )
}
