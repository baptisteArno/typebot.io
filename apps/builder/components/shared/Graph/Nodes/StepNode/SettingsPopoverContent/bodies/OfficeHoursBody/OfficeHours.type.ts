export type OfficeHoursFormType = {
  name: string;
  timeZone: string;
  daysOfWeek: {
    days: Array<DayInfo>;
    is24hours: boolean;
    sameSchedule: boolean;
  },
  specialDates: {
    active: boolean;
  }
}

export type DayInfo = {
  dayOfWeek: number;
  hours: Array<
    {
      start: string;
      end: string;
    }
  >;
}