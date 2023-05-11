import { loadParameterHeader } from '../helpers/headers';

import Storage from '@octadesk-tech/storage'
import { getBaseClient } from "../http";
import { CommerceServicesType, ListCatalogType, ProductType } from "./commerce.type";

const getCommerceClient = () => getBaseClient('commerce');

export const CommerceService: CommerceServicesType = {
  getList: async (): Promise<Array<ListCatalogType>> => {
    try {
      const { data }: any = await getCommerceClient().then(client => (
        client.get('/catalogs', { headers: {
          'Content-type': "",
          appsubdomain: Storage.getItem('company'),
          authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWJkb21haW4iOiJxYXMzMTkxMzYtM2E5Iiwicm9sZSI6IjEiLCJyb2xlVHlwZSI6IjEiLCJlbWFpbCI6Imx1Y2FzY29yZGVpcm9hcmF1am9AZ21haWwuY29tIiwibmFtZSI6IjE5MTIyMjE1MDkiLCJ0eXBlIjoiMSIsImlkIjoiZGJhZWRhODYtYzg5NC00OTc2LWE0ZjktYTU4ZDM4NzU1M2VmIiwicGVybWlzc2lvblR5cGUiOiIxIiwicGVybWlzc2lvblZpZXciOiIwIiwibmJmIjoxNjcxNzUwMTgwLCJleHAiOjE3MDMyODYxODAsImlhdCI6MTY3MTc1MDE4MCwiaXNzIjoiYXBpLnFhb2N0YWRlc2suc2VydmljZXMifQ.ZZRjgezCWFZc_8PCkFH2IN1_eI5ahanPncX2YtC4dQY"
        } })
      ))
      return data.results as Array<ListCatalogType>;
    } catch (ex) {
      throw new Error('Error in get Catalogs: ' + ex)
    }
  },
  getProductsInCatalog: async (id: string): Promise<Array<ProductType>> => {
    try {
      const { data }: any = await getCommerceClient().then(client =>
        client.get(`/store/products`, {
          params: {
            page: '1',
            limit: '200',
            shouldIncludeVariants: true,
          },
          headers: {
            'Content-type': "",
            appsubdomain: Storage.getItem('company'),
            authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWJkb21haW4iOiJxYXMzMTkxMzYtM2E5Iiwicm9sZSI6IjEiLCJyb2xlVHlwZSI6IjEiLCJlbWFpbCI6Imx1Y2FzY29yZGVpcm9hcmF1am9AZ21haWwuY29tIiwibmFtZSI6IjE5MTIyMjE1MDkiLCJ0eXBlIjoiMSIsImlkIjoiZGJhZWRhODYtYzg5NC00OTc2LWE0ZjktYTU4ZDM4NzU1M2VmIiwicGVybWlzc2lvblR5cGUiOiIxIiwicGVybWlzc2lvblZpZXciOiIwIiwibmJmIjoxNjcxNzUwMTgwLCJleHAiOjE3MDMyODYxODAsImlhdCI6MTY3MTc1MDE4MCwiaXNzIjoiYXBpLnFhb2N0YWRlc2suc2VydmljZXMifQ.ZZRjgezCWFZc_8PCkFH2IN1_eI5ahanPncX2YtC4dQY"
          }
        })
      )
      return data.results as Array<ProductType>;
    } catch (ex) {
      throw new Error('Error in get product: ' + ex)
    }
  },
  getVariants: async (catalogId: string, productId: string): Promise<Array<ProductType>> => {
    try {
      const { data }: any = await getCommerceClient().then(client =>
        client.get(`/catalogs/${catalogId}/products/${productId}/variants`, {
          params: {
            page: '1',
            limit: '200',
            shouldIncludeVariants: true,
          },
          ...loadParameterHeader(),
        })
      )
      return data.results;
    } catch (ex) {
      throw new Error('Error in get product: ' + ex)
    }
  },
};
