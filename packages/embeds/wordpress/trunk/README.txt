=== Typebot | Create advanced chat experiences without coding ===
Contributors: baptisteArno
Tags: typebot, forms, surveys, quizzes, form builder, survey builder, quiz builder, custom forms, mobile forms, payment forms, order forms, feedback forms, enquiry forms, stripe, dropbox, google sheets, mailchimp, salesforce, hubspot, activecampaign, infusionsoft, asana, hipchat, slack, trello, zendesk
Requires at least: 5.0
Tested up to: 6.0
License: GPL 2.0
License URI: http://www.gnu.org/licenses/gpl-2.0.txt
Stable Tag: 3.1.7

== Description ==
Collect 4x more responses with conversational apps using Typebot.

👉 Build beautiful conversational apps and easily embed them in your Wordpress site.
👉 Typebot helps you publish chat apps that feel native to your product and it provides the best experience for your users.
👉 With Typebot, you collect the answer as soon as the user answers the first question. You get to know exactly when the user tends to drop your form.

This plugin relies on Typebot which is a tool that allows you to create conversational forms and directly integrate them on your Wordpress site.
💁‍♂️ More information about Typebot: https://www.typebot.io/
👨🏼‍💻 How Typebot handles collected data: https://www.typebot.io/privacy-policies

== Installation ==
1. Add the plugin folder to the /wp-content/plugins/ directory
2. Activate the plugin through the ‘Plugins’ menu in WordPress
3. Activate your Typebot with the "Typebot" admin button located in the sidebar

== Changelog ==
= 3.1.7 =
* Fix forwarded user prefilled variables 

= 3.1.6 =
* Fix default apiHost typo

= 3.1.4 =
* Support for apiHost field in shortcode

= 3.1.1 =
* Fix excluded pages when empty

= 3.1.0 =
* Breaking change! You will need to import the new code snippet again.
* Fix wp admin crash
* Introduce excluded pages input

= 3.0.1 =
* Fix flow not proceeding on unknown domains

= 3.0.0 =
* Complete rework of the plugin. You are now required to generate a code snippet on https://app.typebot.io

= 2.1.9 =
* Fix standard embed when window is already loaded

= 2.1.8 =
* Fix bubble not displayed with proactive message

= 2.1.6 =
* Fix auto open bubble even if empty param

= 2.1.4 =
* Fix bug when Typebot URL is empty

= 2.1.2 =
* Fix shortcode default bot URL

= 2.1.0 =
* Added auto open delay for bubble embed

= 2.0.0 =
* Support for Typebot 2.0

= 1.4.8 =
* Fix shortcodes

= 1.4.7 =
* Fix minor bug

= 1.4.6 =
* Fix loading bug

= 1.4.5 =
* Remove external dependencies

= 1.4.4 =
* Improve input sanitizing and make the plugin more secure.

= 1.4.3 =
* Fix XSS risk in admin panel

= 1.4.2 =
* Fix styles bug in admin panels. Fix minor security issues.

= 1.4.1 =
* Make the library more reliable

= 1.4.0 =
* Introduce new typebot lib and give access to open / close commands for popups and bubbles

= 1.3.3 =
* Add `url` option to shortcodes in order to add multiple typebots on the same page.

= 1.3.0 =
* Adding wordpress user variables support. More info here: http://docs.typebot.io/embed/wordpress#personalize-user-experience-hidden-variables

= 1.2.3 =
* Add "Don't show message when opened or closed once" option

= 1.2.2 =
* Fix delete user bug.

= 1.2.1 =
* Can set publish or full URL (for custom domains).

= 1.2.0 =
* Add advanced setup where you can paste the code from Typebot.

= 1.1.2 =
* Bug fixes

= 1.1.1 =
* Add chat button icon customization

= 1.1.0 =
* Add path to include for chat and bubble to only display them on specific path patterns

= 1.0.1 =
* Transparency by default for the Standard embed with a shortcode

= 1.0.0 =
* Init new plugin 🥰
