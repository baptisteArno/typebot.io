import {
  GitHubSocialLogin,
  FacebookSocialLogin,
  GoogleSocialLogin,
} from 'cypress-social-logins/src/Plugins'
/// <reference types="cypress" />

/**
 * @type {Cypress.PluginConfig}
 */

const handler = (on: any) => {
  on('task', {
    GoogleSocialLogin: GoogleSocialLogin,
    FacebookSocialLogin: FacebookSocialLogin,
    GitHubSocialLogin: GitHubSocialLogin,
  })
}

export default handler
