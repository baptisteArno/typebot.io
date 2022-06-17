const user = {
  isEnabled: true,
  id: 'f94d39dd-dfdc-4720-a03b-69f95e95bc8f',
  name: 'Nicolas Rosendo',
  email: 'nicolas.rosendo@octadesk.com',
  othersEmail: [],
  othersDocumentCode: {},
  othersCustomerCode: {},
  thumbUrl:
    'http://teekitstorage.blob.core.windows.net/avatar/d64298d5-549b-48c6-9ef7-39442cb42843.png',
  thumbUrlEncrypted:
    'Ggr50l7AqsCzBWtmTvyDl+5OF9iuPRZiWtWLTKSp5V9sHkHbhV4Xo0GeSE4tIv3LRPpnhcBAwekBjEgs6Z/bxTEqAiGkJ+EaO7Es7Mwq2FcxcC4qAmSNo8/ecTtmBdNi',
  avatarName: 'NR',
  isEmailValidated: true,
  isResetPassword: false,
  idsGroups: [
    'cd261a65-065e-4447-80f9-8615b1feb012',
    '74fa49db-6b08-43ce-a1c8-9c2439cd8f11'
  ],
  myApps: ['67e299e2-b573-4d1a-8b0b-f9b6068a5262'],
  customField: {},
  groupsIds: [],
  homePage: {},
  lastLoginId: 'd12aa795-4f7f-4649-afa7-13519ac997dd',
  subDomain: 'testebigousprd',
  type: 1,
  roleType: 2,
  permissionType: 1,
  permissionView: 1,
  participantPermission: 0,
  groups: [
    {
      id: 'cd261a65-065e-4447-80f9-8615b1feb012',
      name: 'Teste Bigous PRD',
      isEnabled: true,
      standard: true
    },
    {
      id: '74fa49db-6b08-43ce-a1c8-9c2439cd8f11',
      name: 'Desenvolvimento',
      isEnabled: true,
      standard: false
    }
  ],
  organization: {
    name: 'Octadesk',
    id: 'af18bf8c-fe55-4405-a198-f4bfd552795e',
    isEnabled: true
  },
  organizations: [
    {
      name: 'Octadesk',
      id: 'af18bf8c-fe55-4405-a198-f4bfd552795e',
      isEnabled: true
    }
  ],
  products: [],
  favoriteResponseTab: 0,
  dateCreation: '2017-08-22T20:09:08.311+00:00',
  lastLogin: '2020-05-09T00:59:47.7099239+00:00',
  daysSinceDateCreation: 990,
  daysSinceLastLogin: 0,
  accessRestriction: {},
  accessNewList: true,
  ticketListOrderConfig: []
}

const userToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWJkb21haW4iOiJ0ZXN0ZWJpZ291c3ByZCIsInJvbGUiOiIyIiwicm9sZVR5cGUiOiIyIiwiZW1haWwiOiJuaWNvbGFzLnJvc2VuZG9Ab2N0YWRlc2suY29tIiwibmFtZSI6Ik5pY29sYXMgUm9zZW5kbyIsInR5cGUiOiIxIiwiaWQiOiJmOTRkMzlkZC1kZmRjLTQ3MjAtYTAzYi02OWY5NWU5NWJjOGYiLCJwZXJtaXNzaW9uVHlwZSI6IjEiLCJwZXJtaXNzaW9uVmlldyI6IjEiLCJuYmYiOjE1ODg5ODU5ODcsImV4cCI6MTYyMDUyMTk4NywiaWF0IjoxNTg4OTg1OTg3LCJpc3MiOiJhcGkub2N0YWRlc2suc2VydmljZXMifQ.vHTd7ulGQF21cz1IjkvcLq44HnoxOU3gSpkmvMKuL6Y'

const status = {
  daysRemaining: 0,
  isAccountActivated: false,
  isTrial: false,
  isValid: true,
  name: 'Teste Bigous PRD',
  subDomain: 'testebigousprd'
}

export const mock = {
  userToken,
  status,
  user
}
