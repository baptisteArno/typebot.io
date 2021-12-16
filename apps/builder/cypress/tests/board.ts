describe('BoardPage', () => {
  beforeEach(() => {
    cy.task('seed')
    cy.signOut()
  })
  it('steps should be droppable', () => {
    cy.signIn('test2@gmail.com')
    cy.visit('/typebots/typebot1')
  })
})
