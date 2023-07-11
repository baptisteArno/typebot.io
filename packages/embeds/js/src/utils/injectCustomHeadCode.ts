import { isNotDefined } from '@typebot.io/lib/utils'

export const injectCustomHeadCode = (customHeadCode: string) => {
  customHeadCode = customHeadCode.replace(
    /<script>/g,
    `<script>
try {`
  )
  customHeadCode = customHeadCode.replace(
    /<\/script>/g,
    `} catch(e) {
  console.warn("Error while executing custom head code", e)
}
</script>`
  )
  const headCodes = customHeadCode.split('</noscript>')
  headCodes.forEach((headCode) => {
    const [codeToInject, noScriptContentToInject] = headCode.split('<noscript>')
    const fragment = document
      .createRange()
      .createContextualFragment(codeToInject)
    document.head.append(fragment)

    if (isNotDefined(noScriptContentToInject)) return

    const noScriptElement = document.createElement('noscript')
    const noScriptContentFragment = document
      .createRange()
      .createContextualFragment(noScriptContentToInject)
    noScriptElement.append(noScriptContentFragment)
    document.head.append(noScriptElement)
  })
}
