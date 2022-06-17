const user = {
  isEnabled: true,
  id: '12e3ae1d-e33a-406b-90ae-df80fefbc474',
  name: 'Nicolas Rosendo',
  email: 'nicolas.rosendo@octadesk.com',
  othersEmail: [],
  othersDocumentCode: {},
  othersCustomerCode: {},
  thumbUrl:
    'http://teekitstorage.blob.core.windows.net/avatar/0fb60ac4-529f-4fac-8d9e-9d2daf6f10fe.png',
  thumbUrlEncrypted:
    'Ggr50l7AqsCzBWtmTvyDl+5OF9iuPRZiWtWLTKSp5V9sHkHbhV4Xo0GeSE4tIv3LI6AzYr5ey/t5EZ3TYsSbDOUmKvIjlfeNFK69FXq0++U6NmnHLh2/vKGFN2a/6W5o',
  avatarName: 'NR',
  isEmailValidated: true,
  isResetPassword: false,
  idsGroups: ['2b87372e-c0c0-43dd-945a-edd8549bda64'],
  myApps: [
    '67e299e2-b573-4d1a-8b0b-f9b6068a5262',
    'adfe05db-0e04-43f0-b196-fb4e07a72f8b'
  ],
  customField: {
    teste: 'b024f5a7-46e4-4dd2-a751-aec82925b603',
    aniversario: 'NaN/NaN/NaN',
    telefone_comercial: '11971815840',
    cpf: '',
    campo_teste: 'teste teste'
  },
  groupsIds: [],
  homePage: {},
  lastLoginId: 'f450e359-4a27-450a-a786-8a6320e85dd1',
  subDomain: 'chatoctaqa',
  type: 1,
  roleType: 1,
  permissionType: 1,
  permissionView: 1,
  participantPermission: 0,
  groups: [
    {
      id: '2b87372e-c0c0-43dd-945a-edd8549bda64',
      name: 'Chatoctaqa',
      isEnabled: true,
      standard: true
    }
  ],
  organization: {
    name: 'Test',
    domain: 'octadesk.com',
    id: 'b7af4eec-2101-4604-907e-0944bd21a291',
    isEnabled: true
  },
  organizations: [
    {
      name: 'Test',
      domain: 'octadesk.com',
      id: 'b7af4eec-2101-4604-907e-0944bd21a291',
      isEnabled: true
    }
  ],
  products: [],
  favoriteResponseTab: 0,
  dateCreation: '2017-02-22T19:28:22.757+00:00',
  lastLogin: '2021-02-16T15:31:09.8181487+00:00',
  daysSinceDateCreation: 1454,
  daysSinceLastLogin: 0,
  accessRestriction: {},
  accessNewList: true,
  chatViewVersion: 'v1',
  ticketListOrderConfig: []
}

const userToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWJkb21haW4iOiJjaGF0b2N0YXFhIiwicm9sZSI6IjIiLCJyb2xlVHlwZSI6IjIiLCJlbWFpbCI6ImRpZWdvLmxpbWFAb2N0YWRlc2suY29tIiwibmFtZSI6IkRpZWdvIExvcGVzIExpbWEiLCJ0eXBlIjoiMSIsImlkIjoiYjg2M2ExMTYtYTQ3NC00OWRlLTgzNTQtMTZiMWM3MDRlNzY2IiwicGVybWlzc2lvblR5cGUiOiIxIiwicGVybWlzc2lvblZpZXciOiIxIiwibmJmIjoxNjQ1MDk2NDczLCJleHAiOjE2NzY2MzI0NzMsImlhdCI6MTY0NTA5NjQ3MywiaXNzIjoiYXBpLnFhb2N0YWRlc2suc2VydmljZXMifQ.KkPiGN5xXpc7uquQYuWWok2gBloyWreAB2n213LuJqg'

const status = {
  id: 'a374c4d2-ee6d-4d8e-a167-a6a7e9f59e81',
  name: 'Chatoctaqa',
  daysRemaining: 0,
  subDomain: 'chatoctaqa',
  isTrial: false,
  isAccountActivated: false,
  isValid: true,
  paymentInformation: { updatedTime: '0001-01-01T00:00:00Z', status: 0 },
  cycleType: 2,
  totalLicenses: 999
}

export const mock = {
  user,
  userToken,
  status
}
