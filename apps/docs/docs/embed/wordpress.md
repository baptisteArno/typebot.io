---
sidebar_position: 2
---

# WordPress

Typebot has a native [WordPress plug-in](https://wordpress.org/plugins/typebot/) that helps you embed typebots in your WordPress site.

Of course, before using it, you need to create and publish your first typebot.

<img src="/img/embeddings/wordpress-preview.png" width="600" alt="WP plugin preview"/>

You can either choose to configurate an "easy setup" or "advanced setup".

## Easy setup

### Container

When choosing "container" and click on "Save" you can then use a typebot shortcode in your page builder. [Here is a complete tutorial on how to insert a shortcode](https://www.wpbeginner.com/wp-tutorials/how-to-add-a-shortcode-in-wordpress/).

Here is how it looks like:

```text
[typebot width="100%" height="500px" background-color="#F7F8FF"]
```

`width`, `height`, `background-color` and `url` are optionnal.

You should use `url` parameter only if you need to embed different typebots as containers on your website.

If your typebot appears to have a small height like this:
<img src="/img/embeddings/wp-small-container.png" width="600" alt="WP plugin preview"/>

you need to set a fixed `height` in pixel (`500px` or `600px` is usually a great number).

### Popup & Bubble

Fields are self explanatory. To open the popup or the bubble when a button in your site is clicked you can use the [Javascript commands](/embed/html-javascript#open-or-close-a-popup).

#### Pages to include separated by a comma

With this field, you can tell the plugin to include the typebot only on specific pages.

Example:

- `/my-page,/other-page/*`: the typebot will appear on these pages: `/my-page`, `/other-page`, `/other-page/sub/path`, `/other-page/other/path`

## Advanced setup

This config allows you to directly paste the code from "HTML & Javascript" instructions in the Share page. So that you can set your own logic if needed.

Here is an example for a bubble config:

```html
<script
  type="text/javascript"
  src="https://static.typebot.io/typebot-1.0.0.js"
></script>

<script>
  const typebot = Typebot.Chat({
    publishId: 'exemple-lead-gen',
    buttonColor: '#0042DA',
    buttonIconUrl: '',
    loadingColors: {
      chatBackground: '#00002e',
      bubbleBackground: '#F7F8FF',
      typingDots: '#303235',
    },
  })
</script>
```

## Personalize user experience

You can leverage the [hidden variables](/editor/variables#hidden-variables) and inject your user information directly into your typebot so that the experience is entirely customized to your user.

Here are the available variables from WordPress, make sure to create them in your typebot's variables dropdown:

<img src="/img/embeddings/wp-variables.png" alt="WP predefined variables" width="400px"/>

You can use these variables anywhere on your typebot. For more informations, check out the [Hidden variables doc](https://docs.typebot.io/editor/variables/hidden-variables)

## Your typebot isn't showing?

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
