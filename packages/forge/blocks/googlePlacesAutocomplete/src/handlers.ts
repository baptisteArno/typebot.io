import { createActionHandler } from '@typebot.io/forge'
import { searchAddress } from './actions/searchAddress'

export default [
  createActionHandler(searchAddress, {
    web: {
      displayEmbedBubble: {
        parseUrl: ({ credentials, options }) =>
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=&key=${credentials.apiKey}${options.country ? `&components=country:${options.country}` : ''}`,
        waitForEvent: {
          parseFunction: () => ({
            args: {},
            content: `
              var onMsg = function(event) {
                var data
                try { data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data }
                catch (e) { return }
                if (!data || data.type !== 'google-places-result') return
                window.removeEventListener('message', onMsg)
                continueFlow(JSON.stringify(data.place))
              }
              window.addEventListener('message', onMsg)
            `,
          }),
        },
        parseInitFunction: ({ credentials, options }) => ({
          args: {
            apiKey: credentials.apiKey ?? '',
            placeholder: options.placeholder ?? 'Start typing an address...',
            language: options.language ?? null,
            country: options.country ?? null,
          },
          content: buildInitScript(),
        }),
      },
    },
    server: async ({ logs }) => {
      logs.add({
        status: 'info',
        description:
          'Google Places Autocomplete requires a web environment. This block is skipped in non-web runtimes (e.g. WhatsApp).',
      })
    },
  }),
]

function buildHtml(
  apiKey: string,
  placeholder: string,
  language: string | null,
  country: string | null,
): string {
  const langParam = language ? `&language=${language}` : ''
  const countryJson = JSON.stringify(country ? country.toLowerCase() : null)

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: transparent; padding: 4px; }
#wrap { position: relative; }
#inp { width: 100%; padding: 10px 14px; font-size: 14px; border: 1.5px solid #D5DDDF; border-radius: 8px; outline: none; background: #FFFFFF; color: #000000; transition: border-color .15s; }
#inp:focus { border-color: #081F22; box-shadow: 0 0 0 3px rgba(8,31,34,.15); }
#inp:disabled { opacity: .6; cursor: default; }
#list { position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: #FFFFFF; border: 1.5px solid #D5DDDF; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,.1); overflow: hidden; display: none; z-index: 10; }
.item { padding: 10px 14px; cursor: pointer; font-size: 13px; display: flex; align-items: flex-start; gap: 8px; border-bottom: 1px solid #D5DDDF; transition: background .1s; }
.item:last-of-type { border-bottom: none; }
.item:hover, .item.active { background: #EAEEEF; }
.icn { flex-shrink: 0; margin-top: 1px; color: #081F22; }
.main { font-weight: 500; color: #000000; font-size: 13px; }
.sub { font-size: 11px; color: #628086; margin-top: 1px; }
.pw { text-align: right; padding: 4px 10px; font-size: 10px; color: #628086; border-top: 1px solid #D5DDDF; }
</style>
</head>
<body>
<div id="wrap">
  <input id="inp" type="text" placeholder="${placeholder}" autocomplete="off">
  <div id="list"></div>
</div>
<script>
var COUNTRY = ${countryJson};
var inp = document.getElementById("inp");
var list = document.getElementById("list");
var svc, token, predictions = [], activeIdx = -1, timer;

function resize() {
  var listVisible = list.style.display !== "none";
  var h = listVisible
    ? inp.offsetHeight + list.offsetHeight + 20
    : inp.offsetHeight + 16;
  parent.postMessage(JSON.stringify({ type: "google-places-height", height: h }), "*");
}

window.initGpa = function() {
  svc = new google.maps.places.AutocompleteService();
  token = new google.maps.places.AutocompleteSessionToken();
  inp.focus();
  resize();
};

inp.addEventListener("input", function() {
  clearTimeout(timer);
  var v = inp.value.trim();
  if (v.length < 2) { hide(); return; }
  timer = setTimeout(function() {
    var req = { input: v, sessionToken: token };
    if (COUNTRY) req.componentRestrictions = { country: COUNTRY };
    svc.getPlacePredictions(req, function(r, s) {
      if (s !== google.maps.places.PlacesServiceStatus.OK || !r) { hide(); return; }
      predictions = r.slice(0, 5);
      render(predictions);
    });
  }, 200);
});

inp.addEventListener("keydown", function(e) {
  if (!predictions.length) return;
  if (e.key === "ArrowDown") { e.preventDefault(); setActive(activeIdx + 1); }
  else if (e.key === "ArrowUp") { e.preventDefault(); setActive(activeIdx - 1); }
  else if (e.key === "Enter" && activeIdx >= 0) { e.preventDefault(); pick(predictions[activeIdx]); }
  else if (e.key === "Escape") hide();
});

function setActive(i) {
  var items = list.querySelectorAll(".item");
  if (!items.length) return;
  if (activeIdx >= 0 && items[activeIdx]) items[activeIdx].classList.remove("active");
  activeIdx = Math.max(0, Math.min(i, items.length - 1));
  if (items[activeIdx]) items[activeIdx].classList.add("active");
}

function render(preds) {
  list.innerHTML = "";
  preds.forEach(function(p) {
    var parts = p.description.split(",");
    var main = parts[0];
    var sub = parts.slice(1).join(",").trim();
    var el = document.createElement("div");
    el.className = "item";
    var icn = document.createElement("span");
    icn.className = "icn";
    icn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>';
    var txt = document.createElement("div");
    var m = document.createElement("div"); m.className = "main"; m.textContent = main; txt.appendChild(m);
    if (sub) { var s = document.createElement("div"); s.className = "sub"; s.textContent = sub; txt.appendChild(s); }
    el.appendChild(icn); el.appendChild(txt);
    el.addEventListener("mousedown", function(ev) { ev.preventDefault(); pick(p); });
    list.appendChild(el);
  });
  var pw = document.createElement("div"); pw.className = "pw"; pw.textContent = "Powered by Google"; list.appendChild(pw);
  list.style.display = "block"; activeIdx = -1; resize();
}

function hide() { list.style.display = "none"; predictions = []; activeIdx = -1; resize(); }

function pick(p) {
  inp.value = p.description; inp.disabled = true; hide();
  var d = document.createElement("div"); document.body.appendChild(d);
  var ps = new google.maps.places.PlacesService(d);
  ps.getDetails({ placeId: p.place_id, sessionToken: token, fields: ["address_components","formatted_address","geometry","place_id"] }, function(place, s) {
    document.body.removeChild(d);
    token = new google.maps.places.AutocompleteSessionToken();
    if (s !== google.maps.places.PlacesServiceStatus.OK || !place) { inp.disabled = false; return; }
    parent.postMessage(JSON.stringify({ type: "google-places-result", place: parsePlace(place) }), "*");
  });
}

function get(c, types, short) {
  var x = c.find(function(x) { return types.some(function(t) { return x.types.indexOf(t) !== -1; }); });
  return x ? (short ? x.short_name : x.long_name) : null;
}

function parsePlace(place) {
  var c = place.address_components || []; var lat = null, lng = null;
  if (place.geometry && place.geometry.location) { lat = place.geometry.location.lat(); lng = place.geometry.location.lng(); }
  return {
    formatted_address: place.formatted_address || null,
    street_number: get(c, ["street_number"], false),
    route: get(c, ["route"], false),
    city: get(c, ["locality","postal_town","sublocality_level_1"], false),
    state: get(c, ["administrative_area_level_1"], false),
    state_code: get(c, ["administrative_area_level_1"], true),
    country: get(c, ["country"], false),
    country_code: get(c, ["country"], true),
    postal_code: get(c, ["postal_code"], false),
    latitude: lat, longitude: lng, place_id: place.place_id || null
  };
}
</script>
<script src="https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places${langParam}&loading=async&callback=initGpa" async defer></script>
</body>
</html>`
}

const buildInitScript = () => `
var html = buildHtmlFn(apiKey, placeholder, language, country)

var iframe = document.createElement('iframe')
iframe.srcdoc = html
iframe.style.cssText = 'width:100%;height:58px;border:none;display:block'
iframe.scrolling = 'no'
typebotElement.appendChild(iframe)

window.addEventListener('message', function(event) {
  var data
  try { data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data }
  catch (e) { return }
  if (data && data.type === 'google-places-height') {
    iframe.style.height = data.height + 'px'
  }
})

${buildHtml.toString().replace('function buildHtml', 'function buildHtmlFn')}
`
