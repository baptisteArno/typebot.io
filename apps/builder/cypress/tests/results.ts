import path from 'path'
import { parse } from 'papaparse'

describe('ResultsPage', () => {
  beforeEach(() => {
    cy.intercept({ url: '/api/typebots/typebot2/results*', method: 'GET' }).as(
      'getResults'
    )
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

  it('should correctly export selection in CSV', () => {
    const downloadsFolder = Cypress.config('downloadsFolder')
    cy.signIn('test2@gmail.com')
    cy.visit('/typebots/typebot2/results')
    cy.wait('@getResults')
    cy.findByRole('button', { name: 'Export' }).should('not.exist')
    cy.findByText('content199').should('exist')
    cy.findAllByRole('checkbox').eq(2).check({ force: true })
    cy.findAllByRole('checkbox').eq(3).check({ force: true })
    cy.findByRole('button', { name: 'Export 2' }).click({ force: true })
    const filename = path.join(
      downloadsFolder,
      `typebot-export_${new Date()
        .toLocaleDateString()
        .replaceAll('/', '-')}.csv`
    )
    cy.readFile(filename, { timeout: 15000 })
      .then(parse)
      .then(validateExportSelection as any)
    cy.findAllByRole('checkbox').first().check({ force: true })
    cy.findByRole('button', { name: 'Export 200' }).click({ force: true })
    const filenameAll = path.join(
      downloadsFolder,
      `typebot-export_${new Date()
        .toLocaleDateString()
        .replaceAll('/', '-')}_all.csv`
    )
    cy.readFile(filenameAll, { timeout: 15000 })
      .then(parse)
      .then(validateExportAll as any)
  })
})

const validateExportSelection = (list: { data: unknown[][] }) => {
  expect(list.data, 'number of records').to.have.length(3)
  expect(list.data[1][1], 'first record').to.equal('content198')
  expect(list.data[2][1], 'second record').to.equal('content197')
}

const validateExportAll = (list: { data: unknown[][] }) => {
  expect(list.data, 'number of records').to.have.length(201)
  expect(list.data[1][1], 'first record').to.equal('content199')
  expect(list.data[200][1], 'second record').to.equal('content0')
}
