const subDomain = 'qas318628-92c'

const user = {
  isEnabled: true,
	id: '970bfa47-47c1-4425-97f9-91a1afc24b3e',
	name: 'Lucas Araujo',
	email: 'lucascordeiroaraujo@gmail.com',
	othersEmail: [],
	othersDocumentCode: {},
	othersCustomerCode: {},
	thumbUrlEncrypted: '',
	avatarName: 'LA',
	isEmailValidated: false,
	isResetPassword: false,
	idsGroups: [],
	myApps: ['67e299e2-b573-4d1a-8b0b-f9b6068a5262'],
	customField: {},
	groupsIds: [],
	homePage: {},
	subDomain,
	type: 1,
	roleType: 1,
	permissionType: 1,
	permissionView: 0,
	participantPermission: 0,
	groups: [],
	organizations: [],
	products: [],
	favoriteResponseTab: 0,
	dateCreation: '2022-04-25T18:49:36.49Z',
	lastLogin: '0001-01-01T00:00:00',
	daysSinceDateCreation: 176,
	daysSinceLastLogin: 738446,
	accessNewList: true,
	ticketListOrderConfig: [],
	newOcta: true,
}

const userToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWJkb21haW4iOiJxYXMzMTg2MjgtOTJjIiwicm9sZSI6IjIiLCJyb2xlVHlwZSI6IjIiLCJlbWFpbCI6InJvZHJpZ28ub2tpeWFtYUBvY3RhZGVzay5jb20iLCJuYW1lIjoiUm9kcmlnbyBPa2l5YW1hIiwidHlwZSI6IjEiLCJpZCI6IjVhYjk2MTk5LTQwMDgtNDQ2ZC04N2U4LTliMTg0NTA4MjhjOSIsInBlcm1pc3Npb25UeXBlIjoiMiIsInBlcm1pc3Npb25WaWV3IjoiMCIsIm5iZiI6MTY2OTA1OTM1NiwiZXhwIjoxNzAwNTk1MzU2LCJpYXQiOjE2NjkwNTkzNTYsImlzcyI6ImFwaS5xYW9jdGFkZXNrLnNlcnZpY2VzIn0.SvLuAQr4TvoP2m8_iazqe29qWd40J6cr7J1XG6v0Iwk'

const status = {
  daysRemaining: 0,
	isAccountActivated: false,
	isTrial: false,
	isValid: true,
	name: 'QA Cordeiro Mini-Cluster',
	subDomain,
}

export const mock = {
  user,
  userToken,
  status
}
