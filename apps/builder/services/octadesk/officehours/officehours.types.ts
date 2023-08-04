export interface IOfficeHoursServices {
  getExpedients(): Promise<Array<OfficeHour>>
  getTimeZones(): Promise<Array<Timezone>>
}

export type OfficeHour = {
  id: string;
  name: string;
  timeZone: string;
  daysOfWeek: {
    is24hours: boolean;
    sameSchedule: boolean;
    days: Array<{
      dayOfWeek: number;
      hours: Array<{
        start: string;
        end: string;
      }>
    }>
  },
  specialDates: {
    active: boolean;
    dates: Array<any>
  }
}

export type Timezone = {
  timezone: string;
  translation: string;
}