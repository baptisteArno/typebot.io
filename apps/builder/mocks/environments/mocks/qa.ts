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

const miniClusterStatus = {
	access_token:
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbnZfaWQiOiIzZTYxNmI1ZS0zOWQ4LTQ5YTEtODMzZi00MmE0Yzg3ZGY5YmIiLCJ0bnRfaWQiOiI4YmZmYWY3MS1mYmFjLTRmZWYtOGE3Mi00MTEyOTliMGIyMmEiLCJuYW1laWQiOiI3Nzk3MjAzYi02NjgwLTQ1ZTYtYmFmMy0yNDM0ZDRmY2U1OTUiLCJzdWJkb21haW4iOiJxYXMzMTg2MjgtOTJjIiwiZ2l2ZW5fbmFtZSI6Ik50aSIsImZhbWlseV9uYW1lIjoiRGFuZGFyYSIsImVtYWlsIjoibnRpLmRhbmRhcmFAb2N0YWRlc2suY29tIiwibGFuZyI6InB0LUJSIiwiYWRtIjoidHJ1ZSIsIm5iZiI6MTY2OTA1NjA0NiwiZXhwIjoxNzAwNTkyMDQ2LCJpYXQiOjE2NjkwNTYwNDZ9.LxWMdMBsjF0OAWLglKt7jvjQMCQ1CAwmhNRKx7QhV0U',
	octaAuthenticated: {
		environmentId: '3e616b5e-39d8-49a1-833f-42a4c87df9bb',
		tenantId: '8bffaf71-fbac-4fef-8a72-411299b0b22a',
		userId: '3d7f81ad-12bc-4878-8ce6-4c14b49bf288',
		subDomain: 'qas319100-a32',
		firstName: 'Nti',
		lastName: 'Dandara',
		email: 'nti.dandara@octadesk.com',
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
  miniClusterStatus
}
