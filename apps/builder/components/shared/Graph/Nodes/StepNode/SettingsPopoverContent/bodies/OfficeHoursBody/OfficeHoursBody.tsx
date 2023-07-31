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
  ButtonAddInterval,
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
  HoursIntervalRow,
  LabelInterval,
  ButtonAddSpecialDate
} from './OfficeHoursBody.style'

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
    Array<{ label: string; value: any; isTitle?: boolean; key: number }>
  >([])
  const [screen, setScreen] = useState<'SETTINGS' | 'CREATE-OFFICE-HOURS'>(
    'SETTINGS'
  )

  const [is24hours, setIs24Hours] = useState<boolean>(true)

  const [hasSpecialDates, setHasSpecialDates] = useState<boolean>(false)

  const handleToggle = () => {
    setHasSpecialDates((prevHasSpecialDates) => !prevHasSpecialDates);
  };

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
  }>()
  const [selectedDays, setSelectedDays] = useState<Array<number>>([])
  const [selectedDay, setSelectedDay] = useState<number>()
  const [officeHoursName, setOfficeHoursName] = useState('')
  const [officeHoursTimezone, setOfficeHoursTimezone] = useState('')
  const [form, setForm] = useState<OfficeHoursFormType>()

  const officeHoursMemo = useMemo(() => {
    return officeHour
  }, [officeHour])

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
      const options = officeHoursMemo.map((item, idx) => ({
        label: item.name,
        value: item,
        key: idx,
      }))
      setOptionsOfficeHours(options)
    }
  }, [officeHoursMemo])

  const changeScreenToCreateOfficeHour = (): void => {
    setScreen('CREATE-OFFICE-HOURS')
  }

  const addIntervalInputField = (): void => {
    console.log('teste')
  }

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

    //   return saved
    // }

    return null
  }

  const cancelCreate = (): void => {
    setScreen('SETTINGS')
  }

  const handleChangeName = (event: ChangeEvent<HTMLInputElement>): void => {
    const { value } = event.target
    setOfficeHoursName(value)
  }

  const handleChangeTimezone = (selectedOption: string) => {
    setOfficeHoursTimezone(selectedOption)
    // setForm((prevForm) => ({
    //   ...prevForm,
    //   timeZone: selectedOption,
    // }))
  }

  // useEffect(() => {
  //   // setForm((prevForm) => ({
  //   //   ...prevForm,
  //   //   daysOfWeek: {
  //   //     ...prevForm.daysOfWeek,
  //   //     is24hours: is24hours,
  //   //   },
  //   // }))
  // }, [is24hours])



  
  useEffect(() => {
    if (!daysOfWeek && selectedDay) {
      setDaysOfWeek(
      {
        days: [  {
          dayOfWeek: selectedDay,
          hours: [
            {
              start: '',
              end: '',
            },
          ],
        }]
      })  
      } else {
      let updatedDaysOfWeek
      const shouldRemoveDay = daysOfWeek?.days.find(
        (day) => day.dayOfWeek === selectedDay
      )
      const filteredDays = daysOfWeek?.days.filter(
        (day) => day.dayOfWeek !== selectedDay
      )
      if (daysOfWeek && selectedDay){

        updatedDaysOfWeek = [...daysOfWeek.days]
        updatedDaysOfWeek.push( {
                  dayOfWeek: selectedDay,
                  hours: [
                    {
                      start: '',
                      end: '',
                    },
                  ],
                })
                setDaysOfWeek({days: updatedDaysOfWeek})
      }
      if (shouldRemoveDay && filteredDays) {
        updatedDaysOfWeek = {
          days: filteredDays
            // days: daysOfWeek,
        }
        setDaysOfWeek(updatedDaysOfWeek)
      } 
      // else if(selectedDay && selectedDay > 0 ) {
        
      //   updatedDaysOfWeek = {
      //     ...daysOfWeek,
      //       days: [  {
      //         dayOfWeek: selectedDay,
      //         hours: [
      //           {
      //             start: '',
      //             end: '',
      //           },
      //         ],
      //       }] 
      //   }
      // }

      // setDaysOfWeek(updatedDaysOfWeek)
    }
    console.log('SEEEEEE', selectedDays, selectedDay)
  }, [selectedDays])


  const handleSelectDaysOfWeek = (number: number): void => {
    const hasSelectedDay = selectedDays.indexOf(number)

    setSelectedDay(number)

    if (hasSelectedDay <= -1) {
      return setSelectedDays((values) => [...values, number])
    }
    const updatedSelectedDays = [...selectedDays]
    updatedSelectedDays.splice(hasSelectedDay, 1)
    console.log('updatedSelectedDays', updatedSelectedDays)
    return setSelectedDays(updatedSelectedDays)
  }

  const handleSelectHours = (e: any): void => {
    const { value, dataset, name } = e.target
    e.stopPropagation()

    const dayIndex = selectedDays.findIndex(
      (selectedDay) => selectedDay.toString() === dataset.day.toString()
    )

    const day = form?.daysOfWeek.days.find(
      (dayOfWeek) => dayOfWeek.dayOfWeek.toString() === dataset.day.toString()
    )

    const selectedHours = {
      start: name === 'start' ? value : day?.hours[0].start,
      end: name === 'end' ? value : day?.hours[0].end,
    }

    const mount = {
      dayOfWeek: day?.dayOfWeek,
      hours: [selectedHours],
    } as any

    if (form?.daysOfWeek?.days && mount) {
      const index = form?.daysOfWeek?.days?.findIndex(
        (s) => s.dayOfWeek.toString() === mount?.dayOfWeek.toString()
      )

      form.daysOfWeek.days[index] = mount
      setForm({ ...form })
    }
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
                     {daysOfWeek?.days?.sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                      .map((day) => (
                        <div key={day.dayOfWeek}>
                          <HourDay>{dayPerNumber(day.dayOfWeek).full}</HourDay>
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
                          <div>
                            <LabelInterval>Intervalos</LabelInterval>
                            <HoursIntervalRow>
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
                            </HoursIntervalRow>
                          </div>
                          <ButtonAddInterval onClick={addIntervalInputField}>+ Adicionar Intervalo</ButtonAddInterval>
                        </div>
                      ))}
                    {/* {selectedDays
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
                          <div>
                            <LabelInterval>Intervalos</LabelInterval>
                            <HoursIntervalRow>
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
                            </HoursIntervalRow>
                          </div>
                          <ButtonAddInterval onClick={addIntervalInputField}>+ Adicionar Intervalo</ButtonAddInterval>
                        </div>
                      ))} */}
                  </HoursArea>
                </FormArea>
              </>
            )}
          </div>
          <FormArea>
              {hasSpecialDates}
            <Toggle>
              <input type="checkbox" id="switch" onChange={handleToggle} checked={hasSpecialDates} />
              <label htmlFor="switch">Toggle</label>
              <div className="input-label">
                Incluir datas e horários especiais
              </div>
            </Toggle>
          </FormArea>
          {hasSpecialDates && (
              <>             
                <FormArea>        
                  <FormControl>
                    <OctaInput
                      name="special-date"
                      placeholder="DD/MM/AAAA"
                      type="date"
                    />
                  </FormControl>
                </FormArea>

                <FormArea>
                <FormControl>
                    <Label style={{ width: '70%' }}>O seu time estará disponível nesta data?</Label>
                    <Options>
                      <OptionRadio>
                        <input
                          type="radio"
                          name="available-special-date"
                          id="yes"
                          defaultChecked={is24hours}
                        />{' '}
                        Sim
                      </OptionRadio>
                      <OptionRadio>
                        <input
                          type="radio"
                          name="available-special-date"
                          id="not"
                          defaultChecked={!is24hours}
                        />{' '}
                        Não
                      </OptionRadio>
                    </Options>
                  </FormControl>
                </FormArea>

                <FormArea>
                  <ButtonAddSpecialDate>Adicionar data</ButtonAddSpecialDate>
                </FormArea>
                </>
          )}
          <FormArea>
            <ButtonCreate onClick={createOfficeHour}>Salvar</ButtonCreate>
            <ButtonCancel onClick={cancelCreate}>Cancelar</ButtonCancel>
          </FormArea>
        </ContainerCreate>
      )}
    </>
  )
}
