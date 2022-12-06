export const fixedPersonProperties = [
  {
    token: '#nome-contato',
    example: 'José da Silva',
    domain: 'PERSON',
    type: 'string',
    name: 'name'
  },
  {
    token: '#email-contato',
    example: 'email@cliente.com',
    domain: 'PERSON',
    type: 'email',
    name: 'email'
  },
  {
    token: '#tel-celular-contato',
    example: '(11) 98765-9999',
    domain: 'PERSON',
    type: 'phone',
    name: 'phone'
  },
  {
    token: '#tel-comercial-contato',
    example: '(11) 4444-9999',
    domain: 'PERSON',
    type: 'phone',
    name: 'phoneContact.business'
  },
  {
    token: '#tel-residencial-contato',
    example: '(11) 4444-9999',
    domain: 'PERSON',
    type: 'phone',
    name: 'phoneContact.home'
  },
  {
    token: '#status-do-contato',
    example: '',
    domain: 'PERSON',
    type: 'select',
    name: 'idContactStatus',
    dataSource: 'contactStatus'
  }
]

export const sessionChatProperties = []