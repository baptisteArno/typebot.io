const user = {
  isEnabled: true,
  id: '49993d57-c440-4ab7-8e87-c09a2b322537',
  name: 'Nicolas Rosendo',
  email: 'nicolas.rosendo@octadesk.com',
  othersEmail: [],
  othersCustomerCode: {},
  thumbUrlEncrypted: '',
  avatarName: 'NR',
  isEmailValidated: true,
  isResetPassword: false,
  idsGroups: ['a6aeff9c-1ff4-482a-b405-356c68bb2030'],
  myApps: [
    '5402dbb8-4cdf-e711-80c1-9a214cf093ae',
    'b8db0254-df4c-11e7-80c1-9a214cf093ae'
  ],
  customField: {},
  groupsIds: [],
  homePage: {},
  lastLoginId: 'e2fff2d1-ec46-4743-a70d-4431146aef94',
  subDomain: 'tech',
  type: 1,
  roleType: 2,
  permissionType: 1,
  permissionView: 1,
  participantPermission: 0,
  groups: [
    {
      id: 'a6aeff9c-1ff4-482a-b405-356c68bb2030',
      name: 'Octadesk Tech',
      isEnabled: true,
      standard: true
    }
  ],
  organization: {
    name: 'Octadesk',
    domain: 'octadesk.com',
    id: 'dd2326c1-5245-4d4c-862f-dbc45f1af9af',
    isEnabled: true
  },
  products: [],
  favoriteResponseTab: 0,
  dateCreation: '2017-05-05T14:36:37.101+00:00',
  lastLogin: '2018-12-05T20:19:14.611+00:00',
  daysSinceDateCreation: 579,
  daysSinceLastLogin: 0
}

const userToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWJkb21haW4iOiJ0ZWNoIiwicm9sZSI6IjIiLCJyb2xlVHlwZSI6IjIiLCJlbWFpbCI6Im5pY29sYXMucm9zZW5kb0BvY3RhZGVzay5jb20iLCJuYW1lIjoiTmljb2xhcyBSb3NlbmRvIiwidHlwZSI6IjEiLCJpZCI6IjQ5OTkzZDU3LWM0NDAtNGFiNy04ZTg3LWMwOWEyYjMyMjUzNyIsInBlcm1pc3Npb25UeXBlIjoiMSIsInBlcm1pc3Npb25WaWV3IjoiMSIsIm5iZiI6MTU0NDA0MTE1NCwiZXhwIjoxNTc1NTc3MTU0LCJpYXQiOjE1NDQwNDExNTQsImlzcyI6ImFwaS5vY3RhZGVzay5zZXJ2aWNlcyJ9.8wrzfMr-x4EcMe70TYAfB1ryC69nLZ1gMbHpwCR95B4'

const status = {
  daysRemaining: 0,
  isAccountActivated: false,
  isTrial: false,
  isValid: true,
  name: 'Tech',
  subDomain: 'tech'
}

export const mock = {
  user,
  userToken,
  status
}
