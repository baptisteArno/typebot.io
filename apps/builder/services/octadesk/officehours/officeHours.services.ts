import { IOfficeHoursServices, OfficeHour, Timezone } from "./officehours.types";
import { services } from '@octadesk-tech/services'
import axios, { AxiosInstance } from 'axios'

import { loadParameterHeader } from '../helpers/headers'
export class OfficeHoursServices implements IOfficeHoursServices {

  private client(api: string, options: any = {}): Promise<AxiosInstance> {
    let _client: AxiosInstance;
    const getClient = async (): Promise<AxiosInstance> => {
      if (_client) {
        return _client
      }
      return (_client = await axios.create())
    }
    return getClient();
  }

  async getExpedients(): Promise<Array<OfficeHour>> {
    let officeHours: Array<OfficeHour> = [];
    await this.client("https://us-east1-001.qa.qaoctadesk.com/").then(async (client) => {
      await client.get(
        "https://us-east1-001.qa.qaoctadesk.com/calendars/api/v1/office-calendar/",
        loadParameterHeader()
      ).then((res) => {
        officeHours = res.data;
      })
    })
    return officeHours;
  }

  async getTimeZones(): Promise<Array<Timezone>> {
    let officeHours: Array<Timezone> = [];
    await this.client("").then(async (client) => {
      await client.get(
        "https://us-east1-001.qa.qaoctadesk.com/calendars/api/v1/office-calendar/timezones/",
        loadParameterHeader()
      ).then((res) => {
        officeHours = res.data;
      })
    })
    return officeHours;
  }

}
