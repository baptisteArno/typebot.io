/* eslint-disable @typescript-eslint/no-namespace */
// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************
/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      signOut(): Chainable<any>
      signIn(email: string): Chainable<any>
      loadTypebotFixtureInDatabase(path: string): Chainable<any>
      mouseMoveBy(
        x: number,
        y: number,
        options?: { delay: number }
      ): Chainable<
        [
          Element,
          {
            initialRect: ClientRect
            finalRect: ClientRect
            delta: { x: number; y: number }
          }
        ]
      >
    }
  }
}

Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false
  }
})

// Import commands.js using ES2015 syntax:
import '@testing-library/cypress/add-commands'
import 'cypress-file-upload'
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')
