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

type Props = {
  step: Step
  onOptionsChange: (options: any) => void
  onExpand?: () => void
}

export const OfficeHoursBody = ({ step, onExpand, onOptionsChange }: Props) => {
  const service = new OfficeHoursServices()
  const [officeHour, setOfficeHour] = useState<Array<OfficeHour> | undefined>()
  const [optionsTimezone, setOptionsTimezone] =
    useState<Array<{ label: string; value: string; isTitle?: boolean }>>()
  const [optionsOfficeHour, setOptionsOfficeHours] = useState<
    Array<{ label: string; value: any; isTitle?: boolean }>
  >([])
  const [screen, setScreen] = useState<'SETTINGS' | 'CREATE-OFFICE-HOURS'>(
    'SETTINGS'
  )

  const [is24hours, setIs24Hours] = useState<boolean>(true)

  const WEEK_DAYS = [1, 2, 3, 4, 5, 6, 7]

  const [daysOfWeek, setDaysOfWeek] = useState<
    Array<{ dayOfWeek: number; hours: { [key: string]: string } }>
  >([])
  const [selectedDays, setSelectedDays] = useState<Array<number>>([])

  const [form, setForm] = useState<OfficeHoursFormType>({
    name: '',
    timeZone: '',
    daysOfWeek: {
      days: [],
      is24hours: false,
      sameSchedule: false,
    },
    specialDates: {
      active: false,
    },
  })

  const officeHoursMemo = useMemo(() => {
    return officeHour
  }, [officeHour])

  const daysOfWeekMemo = useMemo(() => {
    return daysOfWeek
  }, [daysOfWeek])

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

  useEffect(() => {
    const getOfficeHours = async () => {
      const expedients = await service.getExpedients()

      setOfficeHour(expedients)
    }

    if (!officeHour) {
      getOfficeHours()
    }
  })

  // useEffect(() => {
  //   const getTimezones = async () => {
  //     const timezones = await service.getTimeZones();
  //     const options = timezones.map(timezone => ({ label: timezone.translation, value: timezone.timezone }));

  //     setOptionsTimezone(options);
  //   }
  //   if (!optionsTimezone) {
  //     getTimezones();
  //   }
  // });

  useEffect(() => {
    const getTimezones = async () => {
      const timezones = await service.getTimeZones()

      const sortedOptions = timezones.map((timezone) => ({
        label: timezone.translation,
        value: timezone.timezone,
      }))

      sortedOptions.sort((a, b) => {
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
    if (officeHoursMemo && officeHoursMemo.length) {
      const options = officeHoursMemo.map((item) => ({
        label: item.name,
        value: item,
      }))
      setOptionsOfficeHours(options)
    }
  }, [officeHoursMemo])

  const changeScreenToCreateOfficeHour = (): void => {
    setScreen('CREATE-OFFICE-HOURS')
  }

  const createOfficeHour = async (): Promise<OfficeHour | null> => {
    console.log('createOfficeHour', form)
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

    //   return saved
    // }

    return null
  }

  const cancelCreate = (): void => {
    setScreen('SETTINGS')
  }

  const handleChangeInput = (event: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target

    // switch (name) {
    //   case 'name':
    //     setForm(
    //       (e) =>
    //         ({
    //           ...e,
    //           name: value,
    //           daysOfWeek: [],
    //         } as unknown as OfficeHoursFormType)
    //     )
    //     break

    //   default:
    //     break
    // }

    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  }

  const handleChangeTimezone = (selectedOption: any) => {
    setForm((prevForm) => ({
      ...prevForm,
      timeZone: selectedOption,
    }))
  }

  const handleChangeIs24Hours = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setIs24Hours(event.target.value === 'true')
  }

  useEffect(() => {
    setForm((prevForm) => ({
      ...prevForm,
      daysOfWeek: {
        ...prevForm.daysOfWeek,
        is24hours: is24hours,
      },
    }))
  }, [is24hours])

  const handleSelectDaysOfWeek = (number: number): void => {
    const hasSelectedDay = selectedDays.indexOf(number)
    if (hasSelectedDay <= -1) {
      return setSelectedDays((values) => [...values, number])
    }

    return setSelectedDays((values) => values.splice(hasSelectedDay, 0))
  }

  const getSelectedDaysAndHours = (): void => {
    const selectedDaysWithHours = selectedDays.map((dayOfWeek) => {
      const dayInfo = daysOfWeek.find(
        (day) => day.dayOfWeek.toString() === dayOfWeek.toString()
      )
      const { start, end } = dayInfo?.hours || { start: '', end: '' }
      // console.group()
      // console.log('days of week', daysOfWeek)

      // console.log('day OF WEEK', dayOfWeek)
      // console.log('Day INFO', dayInfo)
      // console.groupEnd()
      return { dayOfWeek, hours: { start, end } }
    })
    // console.log(selectedDaysWithHours);
  }

  const handleEndHoursToDaysSelected = (
    e: any
  ): void => {
    const {value , dataset} = e.target
    e.stopPropagation()
    console.log('END', e.target.value)

    const day = daysOfWeekMemo.find(d => d.dayOfWeek.toString() === dataset.day.toString())

    if (!day) {
            setDaysOfWeek((values) => [
              ...values,
              {
                dayOfWeek: dataset.day,
                hours: {
                  end: value,
                },
              } as any,
            ])
          }
  }

  const handleStartHoursToDaysSelected = (
    e: any
  ): void => {
    const {value , dataset} = e.target
    e.stopPropagation()
    console.log('DATADAY', dataset.day)
    console.log('EVENT', e)
    console.log('START:', value)

    let day 
    day = daysOfWeekMemo.find(d => d.dayOfWeek.toString() === dataset.day.toString())
    if (!day) {
            setDaysOfWeek((values) => [
              ...values,
              {
                dayOfWeek: dataset.day,
                hours: {
                  start: value,
                },
              } as any,
            ])
            day = daysOfWeekMemo.forEach(d => { 
              console.log('AAAAAAA', d)
              console.log('BBBBBBBBB', dataset.day)
            })
          }
          console.log('DAYS OF WEEK', daysOfWeek)
      let mount: DayInfo | undefined = undefined   
      console.log('DAY', day)
      console.log('MEMO', daysOfWeekMemo)
      
      mount = {
              dayOfWeek: day?.dayOfWeek || dataset.day,
              hours: {
                start: value,
                end: day?.hours.end,
              },
            } as any
          
             if (form?.daysOfWeek?.days && mount) {
              console.log('TEXTO FODASE', form)
              const filteredArray = form?.daysOfWeek?.days.filter(item => item !== undefined);
              console.log(filteredArray); // Output: [“item1”, “item3"]
               
              
              const index = filteredArray.findIndex(
                 (s) => s.dayOfWeek.toString() === mount?.dayOfWeek.toString()
               )
               console.log('INDEX', index)
               if(index > 0){

                 form.daysOfWeek.days[index] = mount
                } else {
                  form.daysOfWeek.days[dataset.day] = mount
                }
                setForm({ ...form })
             }

             console.log('FORM', form)
    // const { value, name, dataset } = e.target

    // let day
    // let mount: DayInfo | undefined = undefined
    // console.log('EVENTO', e)
    // switch (name) {
    //   case 'start':
    //     day = daysOfWeekMemo.find(
    //       (d) => d.dayOfWeek.toString() === dataset.day?.toString()
    //     )
    //     if (!day) {
    //       setDaysOfWeek((values) => [
    //         ...values,
    //         {
    //           dayOfWeek: dataset.day,
    //           hours: {
    //             [name]: value,
    //           },
    //         } as any,
    //       ])
    //     }
    //     mount = {
    //       dayOfWeek: day?.dayOfWeek,
    //       hours: {
    //         start: value,
    //         end: day?.hours.end,
    //       },
    //     } as any
    //     break
    //   case 'end':
    //     day = daysOfWeekMemo.find(
    //       (d) => d.dayOfWeek.toString() === dataset.day?.toString()
    //     )
    //     if (!day) {
    //       setDaysOfWeek((values) => [
    //         ...values,
    //         {
    //           dayOfWeek: dataset.day,
    //           hours: {
    //             [name]: value,
    //           },
    //         } as any,
    //       ])
    //     }
    //     console.log('DAY', day)
    //     mount = {
    //       dayOfWeek: day?.dayOfWeek,
    //       hours: {
    //         start: day?.hours.start,
    //         end: value,
    //       },
    //     } as any
    //   default:
    //     break
    // }
    // console.log('MOUNT', mount)
    // if (form?.daysOfWeek?.days && mount) {
    //   console.log('FORM', form)
    //   const index = form?.daysOfWeek?.days?.findIndex(
    //     (s) => s.dayOfWeek.toString() === mount?.dayOfWeek.toString()
    //   )
    //   console.log('INDEX', index)
    //   form.daysOfWeek.days[index] = mount
    //   setForm({ ...form })
    // }
  }

  const handleOfficeHourSelect = (calendar: any): void => {
    onOptionsChange(calendar)
  }

  return (
    <>
      {screen === 'SETTINGS' && (
        <Container>
          <Title>Configure o atendimento</Title>
          <FormArea>
            <FormControl>
              {
                <OctaSelect
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
                onChange={handleChangeInput}
                required
              />
            </FormControl>
          </FormArea>
          <FormArea>
            <FormControl>
              {optionsTimezone && (
                <OctaSelect
                  findable
                  options={optionsTimezone}
                  defaultValue="America/Sao_Paulo"
                  onChange={handleChangeTimezone}
                  value={form.timeZone}
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

          <div>
            {!is24hours && (
              <>
                <FormArea>
                  <h4>
                    Em quais dias você estará <strong>disponível</strong>?
                  </h4>
                </FormArea>
                <Button onClick={getSelectedDaysAndHours}>
                  Get Selected Days and Hours
                </Button>
                <FormArea>
                  {WEEK_DAYS.map((week) => (
                    <ButtonDays
                      key={week}
                      onClick={() => handleSelectDaysOfWeek(week)}
                      className={selectedDays.includes(week) ? 'active' : ''}
                    >
                      {dayPerNumber(week).min}
                    </ButtonDays>
                  ))}
                </FormArea>
                <FormArea>
                  <HoursArea>
                    {selectedDays
                      .sort((a, b) => a - b)
                      .map((day) => (
                        <>
                          <HourDay>{dayPerNumber(day).full}</HourDay>
                          <HoursRow>
                            <HoursControl>
                              <OctaInput
                                placeholder="Início"
                                mask="99:99"
                                name="start"
                                data-day={`${day}`}
                                onBlur={handleStartHoursToDaysSelected}
                              />
                            </HoursControl>
                            <HoursPipe>até</HoursPipe>
                            <HoursControl>
                              <OctaInput
                                placeholder="Fim"
                                mask="99:99"
                                name="end"
                                data-day={`${day}`}
                                onBlur={handleEndHoursToDaysSelected}
                              />
                            </HoursControl>
                          </HoursRow>
                        </>
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
