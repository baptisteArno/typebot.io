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
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWJkb21haW4iOiJxYXMzMTkxMDAtYTMyIiwicm9sZSI6IjIiLCJyb2xlVHlwZSI6IjIiLCJlbWFpbCI6InJvZHJpZ28ub2tpeWFtYUBvY3RhZGVzay5jb20iLCJuYW1lIjoicm9kcmlnby5va2l5YW1hQG9jdGFkZXNrLmNvbSIsInR5cGUiOiIxIiwiaWQiOiJkMWFiYmNlNy1kZTYzLTQ1NjUtYmZmNS00NmY4MDI0NTY4ZGMiLCJwZXJtaXNzaW9uVHlwZSI6IjEiLCJwZXJtaXNzaW9uVmlldyI6IjAiLCJuYmYiOjE2Njk5MDMwMTUsImV4cCI6MTcwMTQzOTAxNSwiaWF0IjoxNjY5OTAzMDE1LCJpc3MiOiJhcGkucWFvY3RhZGVzay5zZXJ2aWNlcyJ9.uE2Yckb__23FQXR7tjzJnzjw5wa9EJdY999jXdjjXfc'

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

export const mock = {
  user,
  userToken,
  status,
}
