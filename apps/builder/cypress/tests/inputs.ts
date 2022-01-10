import {
  parseTestTypebot,
  preventUserFromRefreshing,
} from 'cypress/plugins/utils'
import { InputStep, InputStepType } from 'models'

describe('Text input', () => {
  beforeEach(() => {
    cy.task('seed')
    createTypebotWithStep({ type: InputStepType.TEXT })
    cy.signOut()
  })

  afterEach(() => {
    cy.window().then((win) => {
      win.removeEventListener('beforeunload', preventUserFromRefreshing)
    })
  })

  it('options should work', () => {
    cy.signIn('test2@gmail.com')
    cy.visit('/typebots/typebot3/edit')
    cy.findByRole('button', { name: 'Preview' }).click()
    getIframeBody()
      .findByPlaceholderText('Type your answer...')
      .should('have.attr', 'type')
      .should('equal', 'text')
    getIframeBody().findByRole('button', { name: 'Send' }).should('be.disabled')
    cy.findByTestId('step-step1').click({ force: true })
    cy.findByRole('textbox', { name: 'Placeholder:' })
      .clear()
      .type('Your name...')
    cy.findByRole('textbox', { name: 'Button label:' }).clear().type('Go')
    cy.findByRole('button', { name: 'Restart' }).click()
    cy.findByTestId('step-step1').should('contain.text', 'Your name...')
    getIframeBody().findByPlaceholderText('Your name...').should('exist')
    getIframeBody().findByRole('button', { name: 'Go' })
    cy.findByTestId('step-step1').click({ force: true })
    cy.findByRole('checkbox', { name: 'Long text?' }).check({ force: true })
    cy.findByRole('button', { name: 'Restart' }).click()
    getIframeBody().findByTestId('textarea').should('exist')
  })
})

describe('Number input', () => {
  beforeEach(() => {
    cy.task('seed')
    createTypebotWithStep({ type: InputStepType.NUMBER })
    cy.signOut()
  })

  it('options should work', () => {
    cy.signIn('test2@gmail.com')
    cy.visit('/typebots/typebot3/edit')
    cy.findByRole('button', { name: 'Preview' }).click()
    getIframeBody()
      .findByPlaceholderText('Type your answer...')
      .should('have.attr', 'type')
      .should('equal', 'number')
    getIframeBody().findByRole('button', { name: 'Send' }).should('be.disabled')
    cy.findByTestId('step-step1').click({ force: true })
    cy.findByRole('textbox', { name: 'Placeholder:' })
      .clear()
      .type('Your name...')
    cy.findByRole('textbox', { name: 'Button label:' }).clear().type('Go')
    cy.findByRole('spinbutton', { name: 'Min:' }).type('0')
    cy.findByRole('spinbutton', { name: 'Max:' }).type('100')
    cy.findByRole('spinbutton', { name: 'Step:' }).type('10')
    cy.findByRole('button', { name: 'Restart' }).click()
    cy.findByTestId('step-step1').should('contain.text', 'Your name...')
    getIframeBody()
      .findByPlaceholderText('Your name...')
      .should('exist')
      .type('-1{enter}')
      .clear()
      .type('150{enter}')
    getIframeBody().findByRole('button', { name: 'Go' })
    cy.findByTestId('step-step1').click({ force: true })
  })
})

describe('Email input', () => {
  beforeEach(() => {
    cy.task('seed')
    createTypebotWithStep({ type: InputStepType.EMAIL })
    cy.signOut()
  })

  it('options should work', () => {
    cy.signIn('test2@gmail.com')
    cy.visit('/typebots/typebot3/edit')
    cy.findByRole('button', { name: 'Preview' }).click()
    getIframeBody()
      .findByPlaceholderText('Type your email...')
      .should('have.attr', 'type')
      .should('equal', 'email')
    getIframeBody().findByRole('button', { name: 'Send' })
    getIframeBody().findByPlaceholderText('Type your email...').should('exist')
    getIframeBody().findByRole('button', { name: 'Send' }).should('be.disabled')
    cy.findByTestId('step-step1').click({ force: true })
    cy.findByRole('textbox', { name: 'Placeholder:' })
      .clear()
      .type('Your email...')
    cy.findByRole('textbox', { name: 'Button label:' }).clear().type('Go')
    cy.findByTestId('step-step1').should('contain.text', 'Your email...')
    cy.findByRole('button', { name: 'Restart' }).click()
    getIframeBody().findByPlaceholderText('Your email...').should('exist')
    getIframeBody().findByRole('button', { name: 'Go' })
  })
})

describe('URL input', () => {
  beforeEach(() => {
    cy.task('seed')
    createTypebotWithStep({ type: InputStepType.URL })
    cy.signOut()
  })

  it('options should work', () => {
    cy.signIn('test2@gmail.com')
    cy.visit('/typebots/typebot3/edit')
    cy.findByRole('button', { name: 'Preview' }).click()
    getIframeBody()
      .findByPlaceholderText('Type your URL...')
      .should('have.attr', 'type')
      .should('eq', 'url')
    getIframeBody().findByRole('button', { name: 'Send' }).should('be.disabled')
    cy.findByTestId('step-step1').click({ force: true })
    cy.findByRole('textbox', { name: 'Placeholder:' })
      .clear()
      .type('Your URL...')
    cy.findByRole('textbox', { name: 'Button label:' }).clear().type('Go')
    cy.findByTestId('step-step1').should('contain.text', 'Your URL...')
    cy.findByRole('button', { name: 'Restart' }).click()
    getIframeBody().findByPlaceholderText('Your URL...').should('exist')
    getIframeBody().findByRole('button', { name: 'Go' })
  })
})

describe('Date input', () => {
  beforeEach(() => {
    cy.task('seed')
    createTypebotWithStep({ type: InputStepType.DATE })
    cy.signOut()
  })

  it.only('options should work', () => {
    cy.signIn('test2@gmail.com')
    cy.visit('/typebots/typebot3/edit')
    cy.findByRole('button', { name: 'Preview' }).click()
    getIframeBody()
      .findByTestId('from-date')
      .should('have.attr', 'type')
      .should('eq', 'date')
    getIframeBody().findByRole('button', { name: 'Send' }).should('be.disabled')
    cy.findByTestId('step-step1').click({ force: true })
    cy.findByRole('checkbox', { name: 'Is range?' }).check({ force: true })
    cy.findByRole('textbox', { name: 'From label:' }).clear().type('Previous:')
    cy.findByRole('textbox', { name: 'To label:' }).clear().type('After:')
    cy.findByRole('checkbox', { name: 'With time?' }).check({ force: true })
    cy.findByRole('textbox', { name: 'Button label:' }).clear().type('Go')
    cy.findByRole('button', { name: 'Restart' }).click()
    getIframeBody()
      .findByTestId('from-date')
      .should('have.attr', 'type')
      .should('eq', 'datetime-local')
    getIframeBody()
      .findByTestId('to-date')
      .should('have.attr', 'type')
      .should('eq', 'datetime-local')
    getIframeBody().findByRole('button', { name: 'Go' })
  })
})

const createTypebotWithStep = (step: Omit<InputStep, 'id' | 'blockId'>) => {
  cy.task(
    'createTypebot',
    parseTestTypebot({
      id: 'typebot3',
      name: 'Typebot #3',
      ownerId: 'test2',
      steps: {
        byId: {
          step1: { ...step, id: 'step1', blockId: 'block1' },
        },
        allIds: ['step1'],
      },
      blocks: {
        byId: {
          block1: {
            id: 'block1',
            graphCoordinates: { x: 400, y: 200 },
            title: 'Block #1',
            stepIds: ['step1'],
          },
        },
        allIds: ['block1'],
      },
    })
  )
}

const getIframeBody = () => {
  return cy
    .get('#typebot-iframe')
    .its('0.contentDocument.body')
    .should('not.be.empty')
    .then(cy.wrap)
}
