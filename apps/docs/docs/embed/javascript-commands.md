---
sidebar_position: 4
---

# Javascript library

Typebot Javascript library is open-source ([check out the repository](https://github.com/baptisteArno/typebot.io/tree/main/packages/typebot-js)). Feel free to contribute if you're a developer and wish to improve its features.

Whenever a typebot is embedded on your website, you have access to commands to automatically trigger actions on your embedding depending on its type.

## Popup

### Open or Close a popup

You can use these commands:

```js
Typebot.getPopupActions().open()
```

```js
Typebot.getPopupActions().close()
```

You can bind these commands on a button element, for example:

```html
<button onclick="Typebot.getPopupActions().open()">Open the popup</button>
```

## Bubble

### Open or close the proactive message

You can use this command:

```js
Typebot.getBubbleActions().openProactiveMessage()
```

You can bind this command on a button element, for example:

```html
<button onclick="Typebot.getBubbleActions().openProactiveMessage()">
  Open proactive message
</button>
```

### Open or close the typebot

You can use these commands:

```js
Typebot.getBubbleActions().open()
```

```js
Typebot.getBubbleActions().close()
```

You can bind these commands on a button element, for example:

```html
<button onclick="Typebot.getBubbleActions().open()">Open the chat</button>
```
