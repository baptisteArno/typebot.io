export type OfficeHoursFormType = {
  name: string;
  timeZone: string;
  daysOfWeek: {
    is24hours: boolean;
    days: Array<
      {
        dayOfWeek: number;
        hours: Array<
          {
            start: string;
            end: string;
          }
        >;
      }>,
    sameSchedule: boolean;
  },
  specialDates: {
    active: boolean;
  }
}