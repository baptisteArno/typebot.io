const loadTypeform = (): Promise<void> =>
  new Promise((resolve) => {
    const existingScript = document.getElementById('typeform-lib')
    if (!existingScript) {
      const script = document.createElement('script')
      script.innerHTML = `(function() { var qs,js,q,s,d=document, gi=d.getElementById, ce=d.createElement, gt=d.getElementsByTagName, id="typef_orm", b="https://embed.typeform.com/"; if(!gi.call(d,id)) { js=ce.call(d,"script"); js.id=id; js.src=b+"embed.js"; q=gt.call(d,"script")[0]; q.parentNode.insertBefore(js,q) } })()`
      script.id = 'typeform-lib'
      document.body.appendChild(script)
      resolve()
    }
    if (existingScript) resolve()
  })

export default loadTypeform
