export const gtmHeadSnippet = (googleTagManagerId: string) => `<!-- Google Tag Manager -->
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${googleTagManagerId}');
<!-- End Google Tag Manager -->`;

export const gtmBodyElement = (googleTagManagerId: string) => {
  if (document.getElementById("gtm-noscript")) return "";
  const noScriptElement = document.createElement("noscript");
  noScriptElement.id = "gtm-noscript";
  const iframeElement = document.createElement("iframe");
  iframeElement.src = `https://www.googletagmanager.com/ns.html?id=${googleTagManagerId}`;
  iframeElement.height = "0";
  iframeElement.width = "0";
  iframeElement.style.display = "none";
  iframeElement.style.visibility = "hidden";
  noScriptElement.appendChild(iframeElement);
  return noScriptElement;
};
