import { IOfficeHoursServices, OfficeHour, Timezone } from "./officehours.types";
import axios, { AxiosInstance } from 'axios'

import { getBaseClient } from "../http";

import { loadParameterHeader } from '../helpers/headers'
import { OfficeHoursFormType } from "components/shared/Graph/Nodes/StepNode/SettingsPopoverContent/bodies/OfficeHoursBody/OfficeHours.type";

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

  async createOfficeHour(officeHour: OfficeHoursFormType): Promise<OfficeHour | null> {
    return this.client().then(async (client) => {
      return await client.post("/", officeHour, loadParameterHeader()
      ).then((res) => {
        return res.data
      })
    })
  }

  async updateOfficeHour(officeHour: OfficeHoursFormType): Promise<OfficeHour | null> {
    return this.client().then(async (client) => {
      return await client.put("/", officeHour, loadParameterHeader()
      ).then((res) => {
        return res.data
      })
    })
  }

  async deleteOfficeHour(id: string): Promise<boolean> {
    return this.client().then(async (client) => {
      return client.delete(`/${id}`, loadParameterHeader()
      ).then((res) => {
        if (res.status === 200) return true

        return false
      })
    })
  }

  async getOfficeHour(id: string) : Promise<OfficeHour | undefined> {
    return this.client().then(async (client) => {
      return client.get(`/${id}`, loadParameterHeader()
      ).then((res) => {
        if (res.status === 200) return res.data

        return undefined
      })
    })
  }
}
