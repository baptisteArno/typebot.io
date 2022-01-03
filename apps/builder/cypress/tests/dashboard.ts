describe('Dashboard page', () => {
  beforeEach(() => {
    cy.task('seed')
    cy.signOut()
  })

  it('folders navigation should work', () => {
    cy.signIn('test1@gmail.com')
    cy.visit('/typebots')
    createFolder('My folder #1')
    cy.findByTestId('folder-button').click()
    cy.findByRole('heading', { name: 'My folder #1' }).should('exist')
    createFolder('My folder #2')
    cy.findByTestId('folder-button').click()
    cy.findByRole('heading', { name: 'My folder #2' }).should('exist')
    cy.findByRole('link', { name: 'Back' }).click()
    cy.findByRole('heading', { name: 'My folder #1' }).should('exist')
    cy.findByRole('link', { name: 'Back' }).click()
    cy.findByRole('button', { name: 'Show folder menu' }).click()
    cy.findByRole('menuitem', { name: 'Delete' }).click()
    cy.findByRole('button', { name: 'Delete' }).click()
    cy.findByDisplayValue('My folder #2').should('exist')
    cy.findByRole('button', { name: 'Show folder menu' }).click()
    cy.findByRole('menuitem', { name: 'Delete' }).click()
    cy.findByRole('button', { name: 'Delete' }).click()
    cy.findByDisplayValue('My folder #2').should('not.exist')
  })

  it('folders and typebots should be deletable', () => {
    cy.signIn('test2@gmail.com')
    cy.visit('/typebots')
    cy.findByText('Folder #1').should('exist')
    cy.findAllByRole('button', { name: 'Show folder menu' }).first().click()
    cy.findByRole('menuitem', { name: 'Delete' }).click()
    cy.findByRole('button', { name: 'Delete' }).click()
    cy.findByText('Folder #1').should('not.exist')
    cy.findByText('Typebot #1').should('exist')
    cy.findAllByRole('button', { name: 'Show typebot menu' }).first().click()
    cy.findByRole('menuitem', { name: 'Delete' }).click()
    cy.findByRole('button', { name: 'Delete' }).click()
    cy.findByText('Typebot #1').should('not.exist')
  })

  it('folders should be draggable and droppable', () => {
    cy.signIn('test2@gmail.com')
    cy.visit('/typebots')
    cy.findByTestId('typebot-button-typebot1').mouseMoveBy(-100, 0, {
      delay: 120,
    })
    cy.visit('/typebots/folders/folder1')
    cy.findByTestId('typebot-button-typebot1').mouseMoveBy(-300, -100, {
      delay: 120,
    })
    cy.visit('/typebots')
    cy.findByDisplayValue('Folder #1').should('exist')
    cy.findByText('Typebot #1').should('exist')
  })
})

const createFolder = (folderName: string) => {
  cy.findByRole('button', { name: 'Create a folder' }).click({ force: true })
  cy.findByText('New folder').click({ force: true })
  cy.findByDisplayValue('New folder').type(`${folderName}{enter}`)
}
