import {
  GitHubSocialLogin,
  FacebookSocialLogin,
  GoogleSocialLogin,
} from 'cypress-social-logins/src/Plugins'
import { seedDb } from './database'
/// <reference types="cypress" />

/**
 * @type {Cypress.PluginConfig}
 */

const handler = (on: any) => {
  on('task', {
    GoogleSocialLogin: GoogleSocialLogin,
    FacebookSocialLogin: FacebookSocialLogin,
    GitHubSocialLogin: GitHubSocialLogin,
    seed: seedDb,
  })
}

export default handler
