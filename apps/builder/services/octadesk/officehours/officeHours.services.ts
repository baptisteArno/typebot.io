import { IOfficeHoursServices, OfficeHour, Timezone } from "./officehours.types";
import axios, { AxiosInstance } from 'axios'

import { getBaseClient } from "../http";

import { loadParameterHeader } from '../helpers/headers'

const getCalendarClient = () => getBaseClient('calendar');

export class OfficeHoursServices implements IOfficeHoursServices {

  private client(): Promise<AxiosInstance> {
    let _client: AxiosInstance;
    const getClient = async (): Promise<AxiosInstance> => {
      if (_client) {
        return _client
      }
      _client = await getCalendarClient()
      if (!_client.defaults.baseURL?.includes('/api/v1/office-calendar/'))
        _client.defaults.baseURL += '/api/v1/office-calendar/'

      return _client
    }
    return getClient();
  }

  async getExpedients(): Promise<Array<OfficeHour>> {
    let officeHours: Array<OfficeHour> = [];
    await this.client().then(async (client) => {
      await client.get('',
        loadParameterHeader()
      ).then((res) => {
        officeHours = res.data;
      })
    })
    return officeHours;
  }

  async getTimeZones(): Promise<Array<Timezone>> {
    let timezones: Array<Timezone> = [];
    await this.client().then(async (client) => {
      await client.get("/timezones",
        loadParameterHeader()
      ).then((res) => {
        timezones = res.data;
      })
    })
    return timezones;
  }

}
