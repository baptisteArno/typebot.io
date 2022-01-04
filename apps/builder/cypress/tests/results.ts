describe('ResultsPage', () => {
  before(() => {
    cy.intercept({ url: '/api/typebots/typebot2/results?', method: 'GET' }).as(
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
    cy.findByText('content 2').should('exist')
    cy.findByText('content 3').should('exist')
    cy.findAllByRole('checkbox').eq(2).check({ force: true })
    cy.findAllByRole('checkbox').eq(3).check({ force: true })
    cy.findByRole('button', { name: 'Delete 2' }).click()
    cy.findByRole('button', { name: 'Delete' }).click()
    cy.findByText('content 2').should('not.exist')
    cy.findByText('content 3').should('not.exist')
  })

  it.only('submissions table should have infinite scroll', () => {
    cy.signIn('test2@gmail.com')
    cy.visit('/typebots/typebot2/results')
    cy.wait('@getResults')
  })
})
