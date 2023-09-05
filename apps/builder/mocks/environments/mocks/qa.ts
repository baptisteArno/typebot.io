const subDomain = 'qas319100-a32'

const user = {
  id: 'c81fcd9d-4555-4ad9-8be5-75b10332bdbf',
  isEnabled: true,
  name: 'Marcos Freitas',
  email: 'marcos.freitas@octadesk.com',
  thumbUrl: null,
  apps: [
    {
      productId: '67e299e2-b573-4d1a-8b0b-f9b6068a5262',
      productName: 'OctaChat',
      fields: {
        connectionStatus: 0,
        connectionStatusManual: false,
        lastService: '-271821-04-20T00:00:00.000Z',
        availability: true,
      },
    },
  ],
  myApps: ['67e299e2-b573-4d1a-8b0b-f9b6068a5262'],
  type: 1,
  roleType: 1,
  webPushSubscriptions: [],
  customFields: {},
  active: true,
  connectionStatus: 0,
  connectionStatusManual: false,
  lastService: '-271821-04-20T00:00:00.000Z',
  availability: true,
  subDomain,
}

const userToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWJkb21haW4iOiJxYXMzMTkxMDAtYTMyIiwicm9sZSI6IjEiLCJyb2xlVHlwZSI6IjEiLCJlbWFpbCI6Im1hcmNvcy5mcmVpdGFzQG9jdGFkZXNrLmNvbSIsIm5hbWUiOiJNYXJjb3MgRnJlaXRhcyIsInR5cGUiOiIxIiwiaWQiOiJjODFmY2Q5ZC00NTU1LTRhZDktOGJlNS03NWIxMDMzMmJkYmYiLCJwZXJtaXNzaW9uVHlwZSI6IjEiLCJwZXJtaXNzaW9uVmlldyI6IjAiLCJuYmYiOjE2OTM5MTc3MzksImV4cCI6MTY5Mzk3MTczOSwiaWF0IjoxNjkzOTE3NzM5LCJpc3MiOiJhcGkucWFvY3RhZGVzay5zZXJ2aWNlcyJ9.M2N0dDVn_YS6j_LVm0-NCDrRqOuED7CsvJY-So5Im8Q'

const status = {
  id: 'e8690b78-aa35-46c5-ad68-ed89d1399964',
  name: 'Alexa-Para-Qa',
  daysRemaining: 998,
  subDomain: 'qas319100-a32',
  isTrial: true,
  isAccountActivated: false,
  isValid: true,
  paymentInformation: { updatedTime: '0001-01-01T00:00:00', status: 0 },
  cycleType: 3,
  totalLicenses: 1,
}

const miniClusterStatus = {
  access_token:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbnZfaWQiOiIzZTYxNmI1ZS0zOWQ4LTQ5YTEtODMzZi00MmE0Yzg3ZGY5YmIiLCJ0bnRfaWQiOiI4NWY0MzgyMi1hYzE0LTQxZGUtYmRjZi01MWQ4NGExYmE1MTciLCJuYW1laWQiOiIxNjMyZDVlMC03YzIyLTRhMTMtYWJjMS02YmI2ZWIyZDUwNzYiLCJzdWJkb21haW4iOiJxYXMzMTkxMDAtYTMyIiwiZ2l2ZW5fbmFtZSI6Ik1hcmNvcyIsImZhbWlseV9uYW1lIjoiRnJlaXRhcyIsImVtYWlsIjoibWFyY29zLmZyZWl0YXNAb2N0YWRlc2suY29tIiwibGFuZyI6InB0LUJSIiwic2Vzc2lvbiI6IjI0NmVhMGQ2LTU3NzAtNDA1MS1hODVmLTJhMTdiZjIyMzk0NyIsImFkbSI6InRydWUiLCJvY3RhdXNlciI6ImZhbHNlIiwibmJmIjoxNjkzOTE3NzM3LCJleHAiOjE3MjU0NTM3MzcsImlhdCI6MTY5MzkxNzczN30.L5xoq6fISdrVVkL20TsmFiGlYBcBrDntAA-P5fBp26Q',
  octaAuthenticated: {
    environmentId: '3e616b5e-39d8-49a1-833f-42a4c87df9bb',
    tenantId: '85f43822-ac14-41de-bdcf-51d84a1ba517',
    userId: '1f81d72d-9105-4b6b-a3c7-0dce595c375d',
    subDomain: 'qas319100-a32',
    firstName: 'Rodrigo',
    lastName: null,
    email: 'rodrigo.okiyama@octadesk.com',
    languageCode: 'pt-BR',
    timezoneCode: null,
    admin: true,
    profile: null,
    newOcta: true,
  },
}

export const mock = {
  user,
  userToken,
  status,
  miniClusterStatus,
}
