---
sidebar_position: 2
---

# WordPress

Typebot has a native [WordPress plug-in](https://wordpress.org/plugins/typebot/) that helps you embed typebots in your WordPress site.

Of course, before using it, you need to create and publish your first typebot.

<img src="/img/embeddings/wordpress-preview.png" alt="WP plugin preview"/>

The code snippet to paste is easily configurable in the Share tab of your bot after clicking on the "Wordpress" button.

## Personalize user experience

You can leverage the [prefilled variables](/editor/variables#prefilled-variables) and inject your user information directly into your typebot so that the experience is entirely customized to your user.

Here are the available variables from WordPress, make sure to create them in your typebot's variables dropdown:

<img src="/img/embeddings/wp-variables.png" alt="WP predefined variables" width="400px"/>

You can use these variables anywhere on your typebot. For more informations, check out the [Prefilled variables doc](https://docs.typebot.io/editor/variables#prefilled-variables)

## Your typebot isn't showing?

### You have litespeed with "Localise Resources" enabled

There is an a box where there is a list of URLs it localises, one of them was ‘https://cdn.jsdelivr.net’. This URL should be removed from it since it is used to import the embed library.

## You have litespeed with cache enabled

Make sure to insert `web.js` and `typebot` in the JS Excludes textbox and JS Deferred Excludes under Tuning Settings.

### You have a cache plugin

Plugins like WP Rocket prevent Typebot to work.

For WP Rocket:

1. Go to Settings > WP Rocket > Excluded Inline Javascript:

<img src="/img/embeddings/wp-rocket.png" width="600" alt="WP plugin preview"/>

2. Type "typebot"
3. Save

### You have plugin that adds `defer` attribute to external scripts

You need to add an exception for Typebot in the corresponding plugin config.

### Still not working

Contact me on the application using the typebot at the bottom right corner
