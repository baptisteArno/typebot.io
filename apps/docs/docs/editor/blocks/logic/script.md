# Script block

The "Script" block allows you to execute Javascript code. If you want to set a variable value with Javascript, use the [Set variable block](./set-variable) instead.

**It doesn't allow you to create a custom visual block**

<img src="/img/blocks/logic/code.png" width="600" alt="Code block"/>

:::note
Variables in script are not parsed, they are evaluated. So it should be treated as if it were real javascript variables.

You need to write `console.log({{My variable}})` instead of `console.log("{{My variable}}")`
:::

## Examples

### Reload page

```js
window.location.reload()
```

### Redirect if a variable has a specific value

```js
if({{Category}} === 'qualified') {
  window.location.href = 'https://my-site.com'
}
```

Do you need to do something but you're not sure how to? [Ask the community for help!](https://www.facebook.com/groups/typebot)
