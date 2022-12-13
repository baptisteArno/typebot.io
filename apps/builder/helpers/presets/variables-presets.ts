import { DomainType } from "enums/customFieldsEnum"

export const fixedChatProperties = [
  {
    key: 'id-conversa',
    fieldId: 'id-conversa',
    property: 'room.key',
    type: 'text',
    domainType: DomainType.Chat,
    defaultOnBot: true,
  },
  {
    key: 'primeira-mensagem-cliente',
    fieldId: 'primeira-mensagem-cliente',
    property: 'room.messages[0].comment',
    type: 'text',
    domainType: DomainType.Chat,
    defaultOnBot: true,
  },
  {
    key: 'nome-empresa',
    fieldId: 'nome-empresa',
    property: 'room.organization.name',
    type: 'text',
    domainType: DomainType.Chat,
    defaultOnBot: false,
  },
  {
    key: 'nome-agente',
    fieldId: 'nome-agente',
    property: 'room.agent.name',
    type: 'text',
    domainType: DomainType.Chat,
    defaultOnBot: false,
  },
]

export const fixedPersonProperties = [
  {
    token: '#nome-contato',
    example: 'José da Silva',
    domain: 'PERSON',
    type: 'string',
    name: 'name',
    domainType: DomainType.Person,
  },
  {
    token: '#email-contato',
    example: 'email@cliente.com',
    domain: 'PERSON',
    type: 'email',
    name: 'email',
    domainType: DomainType.Person,
  },
  {
    token: '#tel-celular-contato',
    example: '(11) 98765-9999',
    domain: 'PERSON',
    type: 'phone',
    name: 'phone',
    domainType: DomainType.Person,
  },
  {
    token: '#tel-comercial-contato',
    example: '(11) 4444-9999',
    domain: 'PERSON',
    type: 'phone',
    name: 'phoneContact.business',
    domainType: DomainType.Person,
  },
  {
    token: '#tel-residencial-contato',
    example: '(11) 4444-9999',
    domain: 'PERSON',
    type: 'phone',
    name: 'phoneContact.home',
    domainType: DomainType.Person,
  },
  {
    token: '#status-do-contato',
    example: '',
    domain: 'PERSON',
    type: 'select',
    name: 'idContactStatus',
    dataSource: 'contactStatus',
    domainType: DomainType.Person,
  }
]

export const fixedOrganizationProperties = [
	{
		token: '#nome-organizacao',
		example: 'Organização',
		domain: 'ORGANIZATION',
		type: 'string',
		name: 'name',
	},
	{
		token: '#primeiro-telefone-organizacao',
		example: 'Telefone',
		domain: 'ORGANIZATION',
		type: 'string',
		name: 'firstPhoneContact',
	},
	{
		token: '#primeiro-dominio-organizacao',
		example: 'Domínio',
		domain: 'ORGANIZATION',
		type: 'string',
		name: 'firstDomain',
	},
]

export const sessionChatProperties = []