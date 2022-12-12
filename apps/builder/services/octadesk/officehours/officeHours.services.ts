import { IOfficeHoursServices, OfficeHour, Timezone } from "./officehours.types";
import { services } from '@octadesk-tech/services'
import axios, { AxiosInstance } from 'axios'

import { loadParameterHeader } from '../helpers/headers'

export class OfficeHoursServices implements IOfficeHoursServices {

  private tempToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWJkb21haW4iOiJxYXMzMTkxMDAtYTMyIiwicm9sZSI6IjIiLCJyb2xlVHlwZSI6IjIiLCJlbWFpbCI6Im1hcmN1cy5yb2RyaWd1ZXNAb2N0YWRlc2suY29tIiwibmFtZSI6Ik1hcmN1cyBSb2RyaWd1ZXMiLCJ0eXBlIjoiMSIsImlkIjoiZjczY2E5MzgtZWE2YS00NWUxLTg2ZWYtMWNiMjI3ZjYyNjMyIiwicGVybWlzc2lvblR5cGUiOiIyIiwicGVybWlzc2lvblZpZXciOiIwIiwibmJmIjoxNjcwMjM4NDgyLCJleHAiOjE3MDE3NzQ0ODIsImlhdCI6MTY3MDIzODQ4MiwiaXNzIjoiYXBpLnFhb2N0YWRlc2suc2VydmljZXMifQ.LZGEeH2BgCe4HX5nswqWvgbyVzMrluV-EloNg7Vi_qY";

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
        {
          headers:
          {
            ...loadParameterHeader().headers,
            Authorization: `Bearer ${this.tempToken}`
          }
        }
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
        {
          headers:
          {
            ...loadParameterHeader().headers,
            Authorization: `Bearer ${this.tempToken}`
          }
        }
      ).then((res) => {
        officeHours = res.data;
      })
    })
    return officeHours;
  }

}
