describe('ResultsPage', () => {
  before(() => {
    cy.intercept({ url: '/api/typebots/typebot2/results*', method: 'GET' }).as(
      'getResults'
    )
    cy.intercept({ url: '/api/typebots/typebot2/results*', method: 'GET' }).as(
      'getResults'
    )
  })
  beforeEach(() => {
    cy.task('seed')
    cy.signOut()
  })

  it('results should be deletable', () => {
    cy.signIn('test2@gmail.com')
    cy.visit('/typebots/typebot2/results')
    cy.wait('@getResults')
    cy.findByText('content198').should('exist')
    cy.findByText('content197').should('exist')
    cy.findAllByRole('checkbox').eq(2).check({ force: true })
    cy.findAllByRole('checkbox').eq(3).check({ force: true })
    cy.findByRole('button', { name: 'Delete 2' }).click({ force: true })
    cy.findByRole('button', { name: 'Delete' }).click()
    cy.findByText('content198').should('not.exist')
    cy.findByText('content197').should('not.exist')
    cy.wait(200)
    cy.findAllByRole('checkbox').first().check({ force: true })
    cy.findByRole('button', { name: 'Delete 198' }).click({ force: true })
    cy.findByRole('button', { name: 'Delete' }).click()
    cy.findAllByRole('row').should('have.length', 1)
  })

  it('submissions table should have infinite scroll', () => {
    cy.signIn('test2@gmail.com')
    cy.visit('/typebots/typebot2/results')
    cy.findByText('content50').should('not.exist')
    cy.findByText('content199').should('exist')
    cy.findByTestId('table-wrapper').scrollTo('bottom')
    cy.findByText('content149').should('exist')
    cy.findByTestId('table-wrapper').scrollTo('bottom')
    cy.findByText('content99').should('exist')
    cy.findByTestId('table-wrapper').scrollTo('bottom')
    cy.findByText('content50').should('exist')
    cy.findByText('content0').should('exist')
  })
})
