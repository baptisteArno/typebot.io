# Code

The "Code" block allows you to execute Javascript code. If you want to set a variable value with Javascript, use the [Set variable block](./set-variable) instead.

**It doesn't allow you to create a custom visual block**

<img src="/img/blocks/logic/code.png" width="600" alt="Code block"/>

## Examples

### Reload page

```js
window.location.reload()
```

### Post a message to parent

```js
postMessage('hello there!', '*')
```

Then on your parent website, you could listen for those messages:

```js
addEventListener('message', ({ data }) => console.log(data))
```

Do you need to do something but you're not sure how to? [Ask the community for help!](https://www.facebook.com/groups/typebot)
