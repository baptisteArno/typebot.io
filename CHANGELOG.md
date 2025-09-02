# Changelog

<a name="3.11.0"></a>
## 3.11.0 (2025-09-02)

### UI/UX Improvements

- 🚸 Improve http requests auto error toast [[bd955f4](https://github.com/baptisteArno/typebot.io/commit/bd955f4adc56f66d8ea62a850ce4b651621891e3)]
- 🚸 Remove write domain options for workspace guests [[9b1a564](https://github.com/baptisteArno/typebot.io/commit/9b1a564b33ab09cf13eeda85b10daaf9e9b7df8a)]
- 💄 Increase variables dropdown items font size [[d68104d](https://github.com/baptisteArno/typebot.io/commit/d68104d28d9d647c2c88065c6e37fd2766a3a83c)]
- 💄 Harmonize block settings hover bar [[c7ab594](https://github.com/baptisteArno/typebot.io/commit/c7ab594109ded261c0c1d176004654df2b06220d)]
- 💄 Update Icon component to prevent flex shrinkage [[755a1da](https://github.com/baptisteArno/typebot.io/commit/755a1daef042c56d2f2779c668f696b5116896cb)]
- 🚸 Migrate floating components to Base UI ([#2266](https://github.com/baptisteArno/typebot.io/issues/2266)) [[9a9a7e6](https://github.com/baptisteArno/typebot.io/commit/9a9a7e684ced16b0ad30558cb78842e30f585978)]
- 🚸 (whatsapp) skip whatsapp message if empty [[59e2c09](https://github.com/baptisteArno/typebot.io/commit/59e2c09b67f82df01025b4a31e3968a9f05c059f)]
- 🚸 (whatsapp) Improve link parsing when link &#x3D;&#x3D;&#x3D; text [[49de018](https://github.com/baptisteArno/typebot.io/commit/49de0181dc6d654a9054a447d3d4ca096bef6c95)]
- 🚸 (whatsApp) Add media upload cache [[b1d5b5b](https://github.com/baptisteArno/typebot.io/commit/b1d5b5b01e06087430b778aa9033d5c3a89e7f4c)]
- 🚸 Add new OpenAI, Mistral and Anthropic models [[8a69ff3](https://github.com/baptisteArno/typebot.io/commit/8a69ff36653254d4a9ed8c1ec1d22da4728ca502)]
- 🚸 Show 5s max delay UI feedback on typing emulation settings [[a1382b7](https://github.com/baptisteArno/typebot.io/commit/a1382b75e671befc16a1d137d4db9097dc881642)]

### Fixed

- 🐛 Attempt to fix no camera option on file upload for Android users [[39c9033](https://github.com/baptisteArno/typebot.io/commit/39c9033c695dd8ea0fd4a6a034e7da4765b9e0db)]
- 🐛 Fix DataVariableInputs, remove mock array [[7c897cb](https://github.com/baptisteArno/typebot.io/commit/7c897cb709e0f59ad25fc8e2a8382f4e5ad30940)]
- 🐛 Fix WhatsApp start condition not working with button reply [[6e6b66f](https://github.com/baptisteArno/typebot.io/commit/6e6b66ff83d682e90afe5d877b8127a85852d73d)]
- 🐛 Transform folder and typebot buttons into divs to avoid default button behavior [[f60ac6e](https://github.com/baptisteArno/typebot.io/commit/f60ac6ec1e858594b98fa60f61d2789cc338362e)]
- 🐛 Fix BasicSelect onChange type inference [[a9875d9](https://github.com/baptisteArno/typebot.io/commit/a9875d9917dda18b0a835eed2ae68849bc33c3c2)]
- 🐛 Make sure prefilled variables are taken into account for transcript compute [[09d50d0](https://github.com/baptisteArno/typebot.io/commit/09d50d0916f5cd9d116af0264302b828dc2918fc)]
- 🐛 Fix OAuth connect, prevent page to refresh [[71edb99](https://github.com/baptisteArno/typebot.io/commit/71edb99cb22e926ec4a73be2933c04914b831f63)]
- 🚑 Fix single button parsing [[07fc210](https://github.com/baptisteArno/typebot.io/commit/07fc210953c6eb6868dcb8cbac40cea4e95eea9a)]
- 🐛 Refactor edge ID retrieval logic in computeResultTranscript to handle cards input and block items more effectively [[c8cfa6a](https://github.com/baptisteArno/typebot.io/commit/c8cfa6a66ee383f24fce53fc121fa482e9b9de23)]
- 🐛 (picture choice) Fix invalid matching when title equals indices [[d4b33ef](https://github.com/baptisteArno/typebot.io/commit/d4b33ef4eea9834266b0b203f2ce9edf4e8f7743)]
- 🐛 Enable vision for gpt-5 models [[2b626f7](https://github.com/baptisteArno/typebot.io/commit/2b626f75f3aeca4d7a59c96f390e6bc724fedcf4)]
- 🐛 Remove test menu in media popover [[d2e944c](https://github.com/baptisteArno/typebot.io/commit/d2e944c3aff6f934169c63d26718d494d4233e4d)]
- 🐛 Update webhookHandler to change response status for unhandled events from 304 to 204 [[3a5c2c6](https://github.com/baptisteArno/typebot.io/commit/3a5c2c66d6298d4ea24869749d9f68878096f2e4)]
- 🚑 Fix inverted invoice condition in webhook handler [[7c695e8](https://github.com/baptisteArno/typebot.io/commit/7c695e8768c9c0271391a1752a5f926b9a570fb2)]
- 🐛 Improve error handling for empty session state in getSession [[12f6e58](https://github.com/baptisteArno/typebot.io/commit/12f6e5886242b710340d7b87657c859924725e4e)]
- 🐛 Fix invalid test payload used in response keys [[de7705d](https://github.com/baptisteArno/typebot.io/commit/de7705d43f0641e0b058f0f64156d2c89bae40c6)]
- 🐛 (landing-page) Fix first-time cookie setter for non EU users [[8548d36](https://github.com/baptisteArno/typebot.io/commit/8548d36cdac28dc25b1404f16aeeced86d75dc64)]
- 🐛 Update sessionId if user is remembered [[72a6104](https://github.com/baptisteArno/typebot.io/commit/72a61047be1dd7a72ed44cd05504f4bb4c6e7fa6)]
- 🐛 Reset skipFirstMessageBubble to false in walkFlowForward function [[0537423](https://github.com/baptisteArno/typebot.io/commit/05374231e7084e489af9a877674b7903da61ed85)]
- 🐛 Only delete session with empty state if it&#x27;s not in replying state [[1d6a500](https://github.com/baptisteArno/typebot.io/commit/1d6a500e5cfa41e474bddb69bb1ebe92e53116f9)]
- 🐛 Fix AB Test block to return undefined for outgoing edge when none is found [[f9d5295](https://github.com/baptisteArno/typebot.io/commit/f9d529548b0d9046dad62b3f597ba0f3705b00db)]
- 🐛 Fix item settings button not showing on display condition hover [[31c5c74](https://github.com/baptisteArno/typebot.io/commit/31c5c748fa38948c88658a1c2d4154d268a1d878)]
- 🐛 Fix CreateAPIToken dialog not resetting on close [[f2b314d](https://github.com/baptisteArno/typebot.io/commit/f2b314d02df8ec026afa90df3eabe8ce3c40b61a)]
- 🐛 Fix askAssistant custom auth base URL [[25ccfc3](https://github.com/baptisteArno/typebot.io/commit/25ccfc3cb202171ee33339c046d69cd5133198e2)]
- 🐛 Fix embed continue chat and client log queries not following allowed origins config [[b8a487b](https://github.com/baptisteArno/typebot.io/commit/b8a487b92ebc63f570924cdb0b34e9d41897baf5)]
- 🐛 Fix invalid chat window background URL in default Bubble theme [[5a4787b](https://github.com/baptisteArno/typebot.io/commit/5a4787be44bc0c301587d104f6237c3a8687f6e8)]
- 🐛 Avoid adding https:// prefix if URL starts with variable string [[6fd807e](https://github.com/baptisteArno/typebot.io/commit/6fd807e72c8975efb1a3b609b9af5c4eb518b1e2)]
- 🚑 Fix WhatsApp send message if provider is undefined [[35a4f83](https://github.com/baptisteArno/typebot.io/commit/35a4f8361af59844b71bc6fdb8e23d68d634f37e)]

### Content

- 📝 Add transcript section to results docs [[0c5cd61](https://github.com/baptisteArno/typebot.io/commit/0c5cd615f5be6946b4ccb76edc21720b165e23de)]
- 📝 Update Cards block documentation to include variable mapping [[41a1954](https://github.com/baptisteArno/typebot.io/commit/41a1954fb7e986b9ec6224570da4107ef4e34a4a)]
- 📝 Update metadata guidelines [[b48f0e3](https://github.com/baptisteArno/typebot.io/commit/b48f0e3fffc3a4de7bd762ca4baec5e454710005)]
- 📝 Add July blog posts ([#2261](https://github.com/baptisteArno/typebot.io/issues/2261)) [[2a308d2](https://github.com/baptisteArno/typebot.io/commit/2a308d229c9aec61ac6a0a96f2773ea1f060318d)]

### Internal

- 🔧 Use middleware for redirectPath and callbackUrl [[f986d3f](https://github.com/baptisteArno/typebot.io/commit/f986d3f827c15705622ab73fcdb627cce530666f)]
- 🔧 Add middleware for homepage redirection based on authentication status and locale. [[d504741](https://github.com/baptisteArno/typebot.io/commit/d504741e6d757cb6246e33412a438367b78def5a)]
- 🔧 Refactor content retrieval logic across various input parsing functions to use logical OR for default values [[1925569](https://github.com/baptisteArno/typebot.io/commit/1925569b4a168017188ffe9f32fc885cd63c31cf)]
- 🔧 Introduce new &quot;unpaid&quot; subscription status mirror in webhook handler [[4ea6903](https://github.com/baptisteArno/typebot.io/commit/4ea6903dd87bfbc40be631be836ab5afe9ae1007)]
- 🔧 Add hugeicons license key in github actions [[4193512](https://github.com/baptisteArno/typebot.io/commit/4193512f1cc84915efc9b02641853f56960c1710)]
- 🔧 Enhance stripe webhookHandler to manage invoice.payment_failed events and quarantine workspaces [[9ee2074](https://github.com/baptisteArno/typebot.io/commit/9ee207439529f85e05c97808ef6dcd01719ae361)]
- ♻️ Refacto buttons and migrate from Chakra UI ([#2268](https://github.com/baptisteArno/typebot.io/issues/2268)) [[af02929](https://github.com/baptisteArno/typebot.io/commit/af029292ff51ceffb2815bc9028e4f0257057d24)]
- 🔒 Add potential trademark infrigement detection [[50fe05f](https://github.com/baptisteArno/typebot.io/commit/50fe05f563e1f248edaa29fc492f8a95289ce77d)]
- 🔧 Add &quot;Start event doesn&#x27;t exist&quot; to Sentry ignore messages [[f091683](https://github.com/baptisteArno/typebot.io/commit/f091683c6a7cded62d7a374ace373ccb12e9680b)]
- 🔧 Update FolderContent component to enhance read-only logic based on workspace user mode [[f97c978](https://github.com/baptisteArno/typebot.io/commit/f97c9780d25a41317cb53827ab0e15cb6c002dc1)]
- 🔧 Update TikTok regex to support dots in usernames [[a65bc02](https://github.com/baptisteArno/typebot.io/commit/a65bc020f13fceb2ade373dfaca6d40d53d02993)]
- 🔧 (builder) add robots.txt to index only registration pages [[49fe1b9](https://github.com/baptisteArno/typebot.io/commit/49fe1b99b0b9d91781307db7061afd1dbc23ee67)]
- 🔧 (landing-page) Add dynamic sitemap.xml route and robots.txt to desindex home.typebot.io [[22328fd](https://github.com/baptisteArno/typebot.io/commit/22328fde187e6074bead41ccee02e163dac476a0)]
- 🔒 Add X-Content-Type-Options header to enhance security [[ee91147](https://github.com/baptisteArno/typebot.io/commit/ee91147b79f8cb6558b32ef4a661673698a80466)]

### Miscellaneous

- 🧑‍💻 Add &#x60;reset&#x60; typebot embed command [[f876415](https://github.com/baptisteArno/typebot.io/commit/f8764153094c7cdd55fe7177f5c58667a2734338)]


<a name="3.10.0"></a>
## 3.10.0 (2025-08-06)

### New features

- ✨ Add 360Dialog provider [[43328f4](https://github.com/baptisteArno/typebot.io/commit/43328f48445e746534c170b6f8fdbe723af25840)]
- ✨ Add Transcript tab in Results details modal [[43a3eb5](https://github.com/baptisteArno/typebot.io/commit/43a3eb5432c8c2bc331b11f3fa86481b70c1dd86)]
- ✨ Add Gmail block ([#2253](https://github.com/baptisteArno/typebot.io/issues/2253)) [[40884d5](https://github.com/baptisteArno/typebot.io/commit/40884d5df9d5a3faf5f138fe9dc5f6f2a3cc2795)]
- ✨ Add support for array type in Generate variables actions [[de7f96a](https://github.com/baptisteArno/typebot.io/commit/de7f96ac0caf3a46a8d90cea0e700075f166fd58)]

### UI/UX Improvements

- ⚡ (dify) Switch to ai-sdk ([#2247](https://github.com/baptisteArno/typebot.io/issues/2247)) [[085397e](https://github.com/baptisteArno/typebot.io/commit/085397ea09638d313662f24854cddcd2e8fbadd3)]
- 🚸 (gmail) Improve OAuth credential popup handling [[ce7627f](https://github.com/baptisteArno/typebot.io/commit/ce7627fd99aae5de492a15c30b57dfe55259054e)]
- 🚸 (bot) Improve error message on failed file upload [[bac1ee2](https://github.com/baptisteArno/typebot.io/commit/bac1ee280e7544689e787dbb7a1c664123c36d70)]
- 🚸 Add Claude 4 models in suggestion dropdown [[16abe1c](https://github.com/baptisteArno/typebot.io/commit/16abe1c0e357ebfba85a31fdd0fe626d10add89c)]

### Fixed

- 🐛 Fix empty accordion in forged block with preprocessing [[167b252](https://github.com/baptisteArno/typebot.io/commit/167b252d08c56cf572528ffadcee14b2042f9a40)]
- 🐛 Fix gmail add label [[77eb695](https://github.com/baptisteArno/typebot.io/commit/77eb695f00019e7a9d7398cbe67902ed4815c5b4)]
- 🚑 Fix Google Sheet authentication not refreshing [[f33d3b2](https://github.com/baptisteArno/typebot.io/commit/f33d3b224d1801dc298a050b2d4d6a589f0a09ba)]
- 🐛 Fix bot avatar not displayed on streaming message [[541d744](https://github.com/baptisteArno/typebot.io/commit/541d7446500844f7eab60387c0db1093435111c2)]

### Content

- 📝 Remove temporary absence notice from help documentation [[dfe98a1](https://github.com/baptisteArno/typebot.io/commit/dfe98a115122834d954705421feb4dfc39aca418)]
- 📝 Add &quot;create multi step form&quot; and &quot;lead qualification questions&quot; blog posts ([#2256](https://github.com/baptisteArno/typebot.io/issues/2256)) [[9049101](https://github.com/baptisteArno/typebot.io/commit/904910128140aaa78b68d2e841ff78cef2b36a6c)]
- 📝 Update help documentation to reflect maintainer&#x27;s temporary absence [[8068860](https://github.com/baptisteArno/typebot.io/commit/80688607f585f0bac77515e04cd7fda6a9494961)]
- 📝 Add refund policy to terms of service, outlining 14-day refund period for new accounts [[217049d](https://github.com/baptisteArno/typebot.io/commit/217049d2962feff35d2f94b1fbb0b36f3c7f3dc6)]
- 📝 Add Google workspace limited use of user data policy [[1572426](https://github.com/baptisteArno/typebot.io/commit/1572426998124ce4d962d44d5582ef34f3edb243)]
- 📝 Update privacy policy to include third-party integration policy [[a21d6e9](https://github.com/baptisteArno/typebot.io/commit/a21d6e914e66ef65166db7a864e9881590ab0fad)]
- 📝 Add WA allow list phone number screenshot [[0c374d9](https://github.com/baptisteArno/typebot.io/commit/0c374d96179b277bfc52a1702680f6fd5c5ee647)]
- 📝 Add more troobleshoot steps to WhatsApp deployment [[85b7bae](https://github.com/baptisteArno/typebot.io/commit/85b7bae1eda80d79223830947a002764ad5477bc)]
- 📝 Add cookies info and state ISO 27001 compliance [[0681926](https://github.com/baptisteArno/typebot.io/commit/0681926f162f27cee270c58daa2c0676c5f30fb0)]
- 📝 Update WhatsApp doc and troubleshooting [[65921bb](https://github.com/baptisteArno/typebot.io/commit/65921bbde4958559a166a3c60e1725746df03512)]
- 📝 Add june blog posts ([#2246](https://github.com/baptisteArno/typebot.io/issues/2246)) [[96c08dc](https://github.com/baptisteArno/typebot.io/commit/96c08dc8b24354108b9534cc28a7cbbd7be99f49)]

### Internal

- 🔒 Add Content Security Policy header on builder [[a034176](https://github.com/baptisteArno/typebot.io/commit/a034176962527a0f2c72571c97d1ab3a630ede19)]
- 🔧 (gmail) Add beta badge [[763c101](https://github.com/baptisteArno/typebot.io/commit/763c1012a59ce0e66ad4dcfe332224cfe8308c1f)]
- 🔧 Refactor webhookHandler to streamline past due status updates for workspaces [[913dbd7](https://github.com/baptisteArno/typebot.io/commit/913dbd7051c0f7aca643e34350f80cf0e582c4a1)]
- 🔧 Properly exit execute prisma script [[24313ba](https://github.com/baptisteArno/typebot.io/commit/24313ba6b842a50f0bf844f9bd7adcea7298bff5)]
- ♻️ Fix wordpress PHP deprecation warning ([#2248](https://github.com/baptisteArno/typebot.io/issues/2248)) [[b5958bd](https://github.com/baptisteArno/typebot.io/commit/b5958bd6edf49b79023411984a0abf72c1f39bd1)]
- 🔧 Exit destroy user if no workspaces found [[6b8a7dd](https://github.com/baptisteArno/typebot.io/commit/6b8a7dd795cf908dc5e3aa6c61fbbaec5807d125)]
- ♻️ Harmonize unit test execution across the workspace [[354b9e7](https://github.com/baptisteArno/typebot.io/commit/354b9e7893e53de38767c8ba40bfa8c804f076b2)]


<a name="3.9.0"></a>
## 3.9.0 (2025-07-04)

### New features

- ✨ Display Root page in viewer when matching root path on viewer url [[e239ead](https://github.com/baptisteArno/typebot.io/commit/e239eadda42606a8399adb0f8abd1ebe376f1032)]

### UI/UX Improvements

- ⚡ Remove trpc http batch link [[015a82e](https://github.com/baptisteArno/typebot.io/commit/015a82e1847acba957bf669bf882552ce876981a)]
- 🚸 Re-organize Script settings for better UX [[1e16158](https://github.com/baptisteArno/typebot.io/commit/1e16158021e496866fa62ce7e3b5a0ff3ee1e600)]
- 💄 Fix groups dropdown displaying ID instead of title [[0ee75cf](https://github.com/baptisteArno/typebot.io/commit/0ee75cf974fbeb944a6787d7a9fb5969b683429b)]
- 🚸 (blink) Add isOrdered to card content section array [[a487c55](https://github.com/baptisteArno/typebot.io/commit/a487c5513b4c3c4ddd4296f9f537471b4e8265bd)]
- 🚸 Add variable option on Jump and Typebot link blocks [[fd4fe0c](https://github.com/baptisteArno/typebot.io/commit/fd4fe0cdf2cce47c584000c44f8b92b7879ba66b)]
- 🚸 Remove dialog expansion, instead expand popover [[000495d](https://github.com/baptisteArno/typebot.io/commit/000495d3aaa09188c2e14df2269f90a23cd9a3f8)]
- 🚸 (textInput) Add Input mode option [[b76dad1](https://github.com/baptisteArno/typebot.io/commit/b76dad18b7a3175df7be5d1960e0f0f733d9ad6c)]
- 🚸 Add terms consent in onboarding bot [[7d1b73b](https://github.com/baptisteArno/typebot.io/commit/7d1b73bd4ba00814f2ce23ae9f6c9dd74394ae1b)]

### Fixed

- 🐛 (lp) Fix trackPageView not being called on first route change [[e415c72](https://github.com/baptisteArno/typebot.io/commit/e415c72c53b5512928d35322f1e4e090abed701f)]
- 💚 Fix vitest build error mismatch vite peer dep version [[d182f42](https://github.com/baptisteArno/typebot.io/commit/d182f422e800c0d0d5fa96777674d620b3c5cffb)]
- 🐛 Fix network error toast showing up in some scenario even if no error was returned [[06d82ad](https://github.com/baptisteArno/typebot.io/commit/06d82ad347a6856bf69339fd62849191eb8bf42a)]
- 🐛 Fix embed bubble wait for event not working in linked bot [[97d050c](https://github.com/baptisteArno/typebot.io/commit/97d050cc99a5418db5818e8dcf0069485cd85a77)]
- 🐛 Remove play button on focused group in analytics graph [[34ba46f](https://github.com/baptisteArno/typebot.io/commit/34ba46fe263c81196ad19e8f4928d57bff4b0c3b)]
- 🐛 Improve error handling in receiveMessage function by simplifying error parsing and logging [[1d16277](https://github.com/baptisteArno/typebot.io/commit/1d162774db94e876f1bd586b3b0834cd11499fbe)]
- 💚 Add missing types for new tax IDs [[208f81d](https://github.com/baptisteArno/typebot.io/commit/208f81de1791e89d3a72afd8639caa28c0759df1)]
- 🐛 Add some missing Tax IDs [[c765b57](https://github.com/baptisteArno/typebot.io/commit/c765b57000ff43a348869d54380eb86b4802ac65)]
- 🐛 Fix negative in-depth dropoff in some loop scenario [[3a1d7b9](https://github.com/baptisteArno/typebot.io/commit/3a1d7b935b24c6784ce701ea0fa45cb1616bd86b)]
- 🐛 Fix select box height offset [[ed2ec66](https://github.com/baptisteArno/typebot.io/commit/ed2ec66c47ff7c8e34e1907ea56d2a4e0b0e2f06)]
- 🐛 Fix infinite loop crash in analytics graph in some scenarios [[75fb6e5](https://github.com/baptisteArno/typebot.io/commit/75fb6e50f81bedfce79563574b300d52f8aa8811)]
- 🐛 Fix multiple choice parsing to work with non-ASCII chars [[4d899c0](https://github.com/baptisteArno/typebot.io/commit/4d899c09ef8acd315db80bd3551b52da7eaafc17)]
- ✏️ Fix the Forge overview link ([#2225](https://github.com/baptisteArno/typebot.io/issues/2225)) [[296efeb](https://github.com/baptisteArno/typebot.io/commit/296efeb2619ac99ef15bb563ac9539e5649ce668)]
- 🐛 Fix subscription cancellation event tracking condition [[dffdac6](https://github.com/baptisteArno/typebot.io/commit/dffdac61600508ce212e14ed65542dbf91e30865)]
- 🐛 Better manage newly created subscription in stripe webhook [[761602b](https://github.com/baptisteArno/typebot.io/commit/761602b3d2a8d3f8db79843ec6e37424759d2c5f)]
- 🐛 Fix iOS scroll still not working on some devices [[45e2984](https://github.com/baptisteArno/typebot.io/commit/45e29846b5ab7610a22c8db600e0457690a2b863)]
- 🐛 Fix scroll on some iOS devices when chat container is disabled [[1e14ae7](https://github.com/baptisteArno/typebot.io/commit/1e14ae7be405b735edf14956778465464fbbec9b)]
- 🐛 Fix height viewport overflow issue on mobile [[16aa060](https://github.com/baptisteArno/typebot.io/commit/16aa06026636fdab241024604c6decc0cbfe0dfc)]
- 🐛 Fix bot client height reactivity [[c0bda44](https://github.com/baptisteArno/typebot.io/commit/c0bda4478d1cef1ac3f0f22cca40586ed8a7e24f)]
- 🐛 Add conflict margin for Typebot update to handle clock synchronization issues [[a2bb9ac](https://github.com/baptisteArno/typebot.io/commit/a2bb9ac944d1a058f56bb3c5390036dcec18485b)]
- 💚 Fix missing cookie dep [[e087a30](https://github.com/baptisteArno/typebot.io/commit/e087a30a01d797f32572353a606bedfe774cac39)]
- 🐛 Fix multiple choice parser not working with multiple indices [[045d62e](https://github.com/baptisteArno/typebot.io/commit/045d62e56641c668637ac33d1e241cb3e708995d)]
- 🐛 Always transform undefined to null values for user name and image in OAuth profile extraction [[b8d5899](https://github.com/baptisteArno/typebot.io/commit/b8d589931dba7dfd299667a0659d94f655a1f0ce)]
- 🚑 (embed) Fix absolute positioned element not following scroll [[6e53baf](https://github.com/baptisteArno/typebot.io/commit/6e53baf18d9e43c92801ed3f4d6e8ae94b599325)]
- 🐛 Fix ark ui positioning z-index stacking clash with chakra [[5b7faa3](https://github.com/baptisteArno/typebot.io/commit/5b7faa34e0690957d58ebe9032e018d9698f2f16)]
- 🐛 Fix some popovers rendering behind content [[24c2667](https://github.com/baptisteArno/typebot.io/commit/24c2667efc1c52a8dba5aceb69a38d230a742b1b)]
- 🐛 Fix narrow scroll chat container when transparent [[89ab2f6](https://github.com/baptisteArno/typebot.io/commit/89ab2f6697c89f6284f9824da93265b3582fa31a)]
- ✏️ Remove tooltip for high chat usage alert in UsageProgressBars component [[d017138](https://github.com/baptisteArno/typebot.io/commit/d017138ebec236275d47c1392795a591c66a6fef)]
- 🐛 Fix recursive transcript set variable [[2338f2b](https://github.com/baptisteArno/typebot.io/commit/2338f2bf803f28425af1cc7e5acd9d6a4e88f7ce)]
- 🐛 Fix multi client side action after input block not triggering [[0e473f0](https://github.com/baptisteArno/typebot.io/commit/0e473f0fee5bae49890ee0338457c3866a1a0636)]
- 🐛 Fix on workspace delete, missing redirection to other workspace [[b990aed](https://github.com/baptisteArno/typebot.io/commit/b990aedc1139cdc00c9f5308faa6a96995ad3754)]
- 🐛 Avoid redirect to onboarding if env var is missing [[dfcbb1f](https://github.com/baptisteArno/typebot.io/commit/dfcbb1f94ba9368c7a059c3207007b95fb894690)]
- 🐛 Patch Gitlab profile parsing for next-auth@v5 compatibility ([#2213](https://github.com/baptisteArno/typebot.io/issues/2213)) [[97beef0](https://github.com/baptisteArno/typebot.io/commit/97beef0ae068a4405c3c7779a8b1f3cfa319c446)]
- 🐛 Prevent stuck drag state when opening native emoji picker [[5ec770a](https://github.com/baptisteArno/typebot.io/commit/5ec770ad5e4d83dd223af24fc795ab44223733bb)]
- 🐛 Fix progress bar position issue on builder preview [[a4d6228](https://github.com/baptisteArno/typebot.io/commit/a4d622837af6f04241b314a32d9a9ef68818165c)]
- 🚑 (lp) Attempt to fix client side crash [[8c4c8ff](https://github.com/baptisteArno/typebot.io/commit/8c4c8ffbc8213c232b95ea0989ad75c477d99f3d)]
- 💚 Fix typecheck error in TypebotPageV3 [[ef82ff8](https://github.com/baptisteArno/typebot.io/commit/ef82ff81a65482e11d4875116ca47d435f64e7a1)]
- ✏️ Fix get-started docs type ([#2207](https://github.com/baptisteArno/typebot.io/issues/2207)) [[7cced2f](https://github.com/baptisteArno/typebot.io/commit/7cced2fc8ab55cca9c949e090d01e5a1a507f0ab)]
- 🐛 Fix forge autocomplete input popover rendering behind dialog [[47d1bee](https://github.com/baptisteArno/typebot.io/commit/47d1bee4ce6e10096d04f792c4e195462dc29125)]
- 🐛 Fix number input default locale to browser&#x27;s language [[c43ad4b](https://github.com/baptisteArno/typebot.io/commit/c43ad4bfe75ef97845a958117d61fa279b1991ec)]
- 🐛 Fix double page tracking on router subscription init [[c8cd522](https://github.com/baptisteArno/typebot.io/commit/c8cd522c405b79667989b2cf04d351b76f8c5ae3)]

### Content

- 📝 Add &quot;how to create a chatbot for beginners&quot; blog post ([#2223](https://github.com/baptisteArno/typebot.io/issues/2223)) [[f1e7eac](https://github.com/baptisteArno/typebot.io/commit/f1e7eac1914493f4ee4866f4777fcbbedd96bcfb)]
- 📝 Add new section on hiding the preview message after user interaction. [[9699402](https://github.com/baptisteArno/typebot.io/commit/9699402d96e44a0212d2e8818d48368501365a66)]
- 📝 Add &quot;b2b lead qualification&quot; blog post ([#2200](https://github.com/baptisteArno/typebot.io/issues/2200)) [[9575725](https://github.com/baptisteArno/typebot.io/commit/9575725acc5e3e7e3b701e0a01c32d79deb0da03)]
- 📝 Add Blink block documention [[e546689](https://github.com/baptisteArno/typebot.io/commit/e546689412385bea98285799f97a2c05a255d15c)]

### Internal

- 🔧 Correctly forward serverFunction call to lp app [[ae1898c](https://github.com/baptisteArno/typebot.io/commit/ae1898c9e822b7ab0987742e23fec321cdc56572)]
- 🔧 Adapt MinIO bucket creation script for newer &#x60;mc&#x60; versions ([#2235](https://github.com/baptisteArno/typebot.io/issues/2235)) [[2770ecf](https://github.com/baptisteArno/typebot.io/commit/2770ecf9c7fe2c055f92997338a2b727c596f2f7)]
- 🔧 Fix new tanstack assets folder source [[8432b5b](https://github.com/baptisteArno/typebot.io/commit/8432b5b5a0a35fa61e6440a6a689e7598c3f4029)]
- 🔧 Add POSTHOG_PERSONAL_API_KEY to daily workflow secrets [[0cedd50](https://github.com/baptisteArno/typebot.io/commit/0cedd5019bea9624db4feda6a0d07714713051e7)]
- ♻️ Upgrade to tRPC v11 and use Tanstack Query [[90add8c](https://github.com/baptisteArno/typebot.io/commit/90add8c56f53d1c4cc7bef8655074e47bf0f2e94)]
- ♻️ Redirect to onboarding if terms not accepted [[d06dbd7](https://github.com/baptisteArno/typebot.io/commit/d06dbd70b03e957862a10bf5ee6ee43ddcc2e22e)]
- ♻️ Remove isNewUser constraint on onboarding page [[91381c9](https://github.com/baptisteArno/typebot.io/commit/91381c953063205675fd3f7ba73a3e0a7d1f2afb)]
- ♻️ Create new user package and migrate update API to tRPC [[9fb016b](https://github.com/baptisteArno/typebot.io/commit/9fb016b304a7ceb3c249832cae85f13ab36c18fa)]

### Miscellaneous

- 🧑‍💻 Add startFrom prop to startChat endpoint [[cdaa7b8](https://github.com/baptisteArno/typebot.io/commit/cdaa7b8867d33c859d00b24e214b9d9581078d9f)]
- 🧹 Move functions Vercel config to dashboard [[c156004](https://github.com/baptisteArno/typebot.io/commit/c156004f5a77a4bfe95fb0c58829ea87b2364b80)]
- 🧑‍💻 Improve typebot save conflict toast with overwrite option [[235bd99](https://github.com/baptisteArno/typebot.io/commit/235bd9944b8865148d9c5c0ea59d7ed4b568505c)]
- 🧑‍💻 Improve jump block error context details [[803e1f4](https://github.com/baptisteArno/typebot.io/commit/803e1f45d7907d2cdb63e6c58cb0451e4ff04e3f)]
- 🧑‍💻 (embed) Better typebot typing on init [[01a3eb6](https://github.com/baptisteArno/typebot.io/commit/01a3eb64e745561616cc454460cd02ba81fab225)]
- 🧑‍💻 Add progress bar slot for custom css [[c3c1728](https://github.com/baptisteArno/typebot.io/commit/c3c17289d8ab15d16e29587e70fd291f79796dd9)]


<a name="3.8.0"></a>
## 3.8.0 (2025-06-03)

### New features

- ✨ Add &quot;Allow search engines to index&quot; option ([#2163](https://github.com/baptisteArno/typebot.io/issues/2163)) [[ac510ab](https://github.com/baptisteArno/typebot.io/commit/ac510abf763d573a5819be92528a95f36683ae2a)]
- ✨ Add Invalid Reply event node [[b20b9ba](https://github.com/baptisteArno/typebot.io/commit/b20b9ba1448a798112c0ccc0821b37fb4b029f71)]
- ✨ Add Reply event block ([#2114](https://github.com/baptisteArno/typebot.io/issues/2114)) [[1ca7040](https://github.com/baptisteArno/typebot.io/commit/1ca7040ec24601d061dce826b10d8058c3a94ab8)]

### UI/UX Improvements

- 🚸 Scroll to bottom of settings when test http response is received [[267b495](https://github.com/baptisteArno/typebot.io/commit/267b4958d2d1fe62152a6566e062d3c9f2f66040)]
- 💄 (embed) Fix vertical buttons width on medium screen [[338793c](https://github.com/baptisteArno/typebot.io/commit/338793ccc32959cbbedb80f66e633d2c362133c8)]
- 🚸 (embed) Improve chat container responsivity and caroussel width [[7a11d5f](https://github.com/baptisteArno/typebot.io/commit/7a11d5f6aa7e24e178ad75fe2d677e6c8cf4c565)]
- 💄 (setVariable) Improve block content preview UI especially for long code content [[492e365](https://github.com/baptisteArno/typebot.io/commit/492e365fc543e5664d36cefd9e9b3bbf54072e0d)]
- 💄 Update builder OG image [[f495093](https://github.com/baptisteArno/typebot.io/commit/f495093dfdf5027b0b2e049beb6951e0e9ca74fe)]
- 🚸 (date) Allow for YY and DD to be interpreted as yy and dd [[e19a839](https://github.com/baptisteArno/typebot.io/commit/e19a83944396d2a6cf831f83cee28f688337f0b8)]
- 💄 Remove New tags on old templates [[629cb3c](https://github.com/baptisteArno/typebot.io/commit/629cb3c1f264b6354f08fdb8e965ab39fe9a20a4)]
- 🚸 Only execute reply event with outgoind edge id [[45f7e2c](https://github.com/baptisteArno/typebot.io/commit/45f7e2ca5ecc2b605b50ae23620a81ffb1224d2f)]
- 🚸 Improve Card item manipulation [[924a57b](https://github.com/baptisteArno/typebot.io/commit/924a57be300185ac7f84a1dc4c7b1f10b2b6489d)]
- 🚸 Add isOpen and isHidden props to Bubble embed [[0552d14](https://github.com/baptisteArno/typebot.io/commit/0552d140537948162a75dc26b70ea8bd9589f490)]
- 🚸 (dateInput) Add submit on Enter press ([#2176](https://github.com/baptisteArno/typebot.io/issues/2176)) [[a322789](https://github.com/baptisteArno/typebot.io/commit/a32278921593211aeca4cefebb58d489ebf918ae)]

### Fixed

- ✏️ Update next.js package install snippet ([#2196](https://github.com/baptisteArno/typebot.io/issues/2196)) [[cf4922f](https://github.com/baptisteArno/typebot.io/commit/cf4922ffd96570ba7fe4cf237ad659bb873f5ce2)]
- 🐛 Fix NocoDB not working with Link fields [[3f4ddc7](https://github.com/baptisteArno/typebot.io/commit/3f4ddc789bc44987b47cfa44e40ae0e207126f5a)]
- 🐛 (engine) Sanitize variable value before saving to avoid db insert failure [[b041842](https://github.com/baptisteArno/typebot.io/commit/b041842e4a898453d2f6d615af48dff8796484fa)]
- 🐛 Fix retrocompat issue, allow null message on continueChat endpoint [[07cec85](https://github.com/baptisteArno/typebot.io/commit/07cec85f3b6d599780cfe59edbed0a776dc6dfa5)]
- 🐛 Improve invalid regex handling in comparison logic [[78a1ce2](https://github.com/baptisteArno/typebot.io/commit/78a1ce26f94a9affc2fd74598926fdb543bfe11d)]
- 💚 Add typecheck scripts and fix types issues [[0940a1b](https://github.com/baptisteArno/typebot.io/commit/0940a1b2712feaff82b10a3a217971fdc898364c)]
- 🐛 (embed) Fix client side result set as the last input answer [[7479c15](https://github.com/baptisteArno/typebot.io/commit/7479c15b8172ba1c2822684b7d38921a8e9112d2)]
- 🐛 Fix save variable data mapping suggestion for arrays with mixed objects [[3a2ac4f](https://github.com/baptisteArno/typebot.io/commit/3a2ac4f8fa21a867e025653efff77b2abd2a83aa)]
- 🐛 Normalize file type extension comparison in parseReply function [[c28c39b](https://github.com/baptisteArno/typebot.io/commit/c28c39bc6431fc95a47d53cb43d94a4e473c7f98)]
- 🐛 Fix anticipated end with nested link to typebot [[0a34f7a](https://github.com/baptisteArno/typebot.io/commit/0a34f7a8c8372f57f5940eaf5782c8808878c48d)]
- ✏️ Fix Next.js deployment doc title [[433105c](https://github.com/baptisteArno/typebot.io/commit/433105c565958f9124b73b8fc8631e366ae30cd3)]
- 🐛 Fix bot container size reactivity on children [[d745438](https://github.com/baptisteArno/typebot.io/commit/d745438f5565a0819536122b13e32f273d326300)]
- 🐛 Fix Card item drag on text area resize and allow textarea scroll [[79f6521](https://github.com/baptisteArno/typebot.io/commit/79f65217d6270cfa416d5c11d804f8125ea03996)]
- 🐛 Fix buttons input option auto opening when it shouldn&#x27;t [[2dc6b00](https://github.com/baptisteArno/typebot.io/commit/2dc6b0008c0f9442917bb32e92b678f3060bf23c)]
- 🐛 Fix static positioned bubble placeholder size [[b614bf7](https://github.com/baptisteArno/typebot.io/commit/b614bf7b354d80993ce1537edc313081b92f1c3b)]
- 🚑 Remove test Bubble from viewer [[018767a](https://github.com/baptisteArno/typebot.io/commit/018767a8501c7f4dbb1535a57c2e5214204c9044)]
- 🐛 Fix Bot premature isEnded flag when response has only clientSideActions [[46089d6](https://github.com/baptisteArno/typebot.io/commit/46089d65dfebcf6f0fdcd39b189220e413b775b3)]
- 🐛 Refactor populateEdgesWithTotalVisits to fix dropoff compute edge cases [[b0189f7](https://github.com/baptisteArno/typebot.io/commit/b0189f75793e8e2b0709fc77f9e2c8a6476a7a09)]
- 🐛 Fix WA crash when trying to send duplicate buttons (after truncation) [[3c8cc89](https://github.com/baptisteArno/typebot.io/commit/3c8cc8951a7b9d0cbf887ed7872c74393181cccc)]
- 🐛 Fix custom oauth OIDC URL discovery [[2c1ca26](https://github.com/baptisteArno/typebot.io/commit/2c1ca2687728d411afb32ae6a5c3703e200cf5bc)]
- 🐛 Fix custom OAuth not working after Auth.js upgrade to v5 [[af63487](https://github.com/baptisteArno/typebot.io/commit/af634875f70f5ecaa8e03944cf9f3bf441b112bc)]
- 🐛 Fix color picker elevation on share instructions modals [[4ca143e](https://github.com/baptisteArno/typebot.io/commit/4ca143e0152614aa9c87d0e0ae7ee5290ae1971e)]
- 🚑 Fix client side actions not triggered when first block in group [[6715e06](https://github.com/baptisteArno/typebot.io/commit/6715e068be1354d9636c1e4989f502a6f8e9d0cd)]
- 🚑 Add default returnMark status [[28c77d3](https://github.com/baptisteArno/typebot.io/commit/28c77d3a36eee682f343fdf04734d8df45b67230)]
- 🚑 Fix command event not triggering [[280a91c](https://github.com/baptisteArno/typebot.io/commit/280a91cfd55c66b996d651577689a138f00ed3e2)]

### Content

- 📝 Add &quot;Product recommendation quiz shopify&quot; blog post ([#2180](https://github.com/baptisteArno/typebot.io/issues/2180)) [[924ae28](https://github.com/baptisteArno/typebot.io/commit/924ae28683714026081ea69462f33829f78a9653)]
- 📝 Add progress bar docs [[0c883b9](https://github.com/baptisteArno/typebot.io/commit/0c883b9a111c55bbd4c742ca43a40b077289b63b)]
- 📝 Add &quot;Business Continuity&quot; page [[4f3c270](https://github.com/baptisteArno/typebot.io/commit/4f3c270c78f6d49d2008c44201c46ca711170e5b)]
- 📝 Add &quot;Voiceflow vs flowise&quot; blog post ([#2173](https://github.com/baptisteArno/typebot.io/issues/2173)) [[34a8da5](https://github.com/baptisteArno/typebot.io/commit/34a8da5a0d4543dc094c6f63e51cbe7f692bef12)]
- 📝 Add &quot;WhatsApp API use cases&quot; blog post ([#2169](https://github.com/baptisteArno/typebot.io/issues/2169)) [[6d21dc2](https://github.com/baptisteArno/typebot.io/commit/6d21dc2d4acdebcb40558331a44a298836b9268f)]

### Internal

- 🔧 Disable Sentry trace sampling [[fd8bc81](https://github.com/baptisteArno/typebot.io/commit/fd8bc8122c2e18ba59e37a31439ae173a2752d42)]
- 🔧 Add common trpc error message in ignore list [[9a9285c](https://github.com/baptisteArno/typebot.io/commit/9a9285c96241d184ec922f209551ca0801e0ede0)]
- ♻️ Remove global signals from embed lib to avoid conflict with multiple bots [[081654f](https://github.com/baptisteArno/typebot.io/commit/081654f73312ed9ba2b382cad15f83406970758e)]
- ♻️ (embed) export commands file [[6df30d9](https://github.com/baptisteArno/typebot.io/commit/6df30d9a0b04296488c051e2a5bed3c1724d2836)]
- ♻️ (embed) improve buttons layout on small windows [[bab77ef](https://github.com/baptisteArno/typebot.io/commit/bab77ef98ac78c9d26312c3e4184aea8ba1f2fbd)]
- ♻️ (embed) Use @tailwindcss/container-queries and improve layout for small containers in height [[2e49fc0](https://github.com/baptisteArno/typebot.io/commit/2e49fc05b76adf3c63c791c09f2c12d422896e44)]
- ♻️ (embed) lift colors CSS up [[ab907f1](https://github.com/baptisteArno/typebot.io/commit/ab907f1516a63e4968885c08dc78c1d88a9254f4)]
- 🔧 Add &quot;/business-continuity&quot; to lp pages in next.config [[d5ec6d5](https://github.com/baptisteArno/typebot.io/commit/d5ec6d54f9785389e7117beb348e2cb2a66a28e5)]
- ♻️ (commandEvent) Remove Resume after option [[466fc47](https://github.com/baptisteArno/typebot.io/commit/466fc47b9882ff537f867c5432c93a2420aede31)]

### Miscellaneous

- 🧑‍💻 Make react package ssr compatible and deprecate nextjs package [[28c149c](https://github.com/baptisteArno/typebot.io/commit/28c149c0c765382c3fe2cc6c68d55c00f52895f2)]
- 🧑‍💻 Add reload embed command [[c94266d](https://github.com/baptisteArno/typebot.io/commit/c94266dbffeff098eeb37960dc945333eee00593)]


<a name="3.7.1"></a>
## 3.7.1 (2025-05-06)

### Fixed

- 🐛 Fix host trusting issue for self-hosting instances [[9737fee](https://github.com/baptisteArno/typebot.io/commit/9737fee8b5f8321b75cf96d36d9eb5d5d2698462)]

### Content

- 📝 Add &quot;Chatbot Survey Questions&quot; blog post ([#2149](https://github.com/baptisteArno/typebot.io/issues/2149)) [[71be123](https://github.com/baptisteArno/typebot.io/commit/71be1233d8b0edde495d9bdfc64e1be75dc045cd)]


<a name="3.7.0"></a>
## 3.7.0 (2025-05-05)

### New features

- ✨ Add &quot;Send Feed Event&quot; Blink action [[14b1a26](https://github.com/baptisteArno/typebot.io/commit/14b1a26acf2c0ab46b8edd49af93bc71ce8d0880)]
- ✨ Add &quot;Return&quot; logic block [[ecda1d8](https://github.com/baptisteArno/typebot.io/commit/ecda1d82d34ccb10135d66fd37797a46216411f6)]
- ✨ (openai) Add new 4.1 models [[86e8477](https://github.com/baptisteArno/typebot.io/commit/86e8477bdeaf5e8e4c9117c3e398c5b050a09552)]

### UI/UX Improvements

- 💄 Fix long tag overflowing in tags input [[48531c0](https://github.com/baptisteArno/typebot.io/commit/48531c04c3d543480226c0759c26979120a3bf55)]
- 🚸 (analytics) Take into account Jump blocks for analytics [[6cd0705](https://github.com/baptisteArno/typebot.io/commit/6cd070580a8cb3d864fb59dc2e6312b395ceceb5)]
- 💄 Fix chat bubble window dynamic height on mobile [[04d2a2d](https://github.com/baptisteArno/typebot.io/commit/04d2a2d6eb091e34d9ffdaf8c0956fac3ee75386)]
- 🚸 Add error toast on workspace member inviation failure [[f2a3ff0](https://github.com/baptisteArno/typebot.io/commit/f2a3ff072d0ef3cdb229f537331d8e27670ea49b)]
- 💄 Fix border on file attached on text input [[26fd11a](https://github.com/baptisteArno/typebot.io/commit/26fd11ab1abe42c9f1d1112f153a8665cce3f848)]
- 💄 Remove hero height constraint on mobild to fix scroll glitch [[10cf18d](https://github.com/baptisteArno/typebot.io/commit/10cf18d6818c398873b37a0b4dab584ee5ee3d19)]
- 💄 Fix condition items overflow with long variable names [[9305ae8](https://github.com/baptisteArno/typebot.io/commit/9305ae8fd82fd82ce41e58c824ff72d6c8973ce5)]
- 🚸 (lp) fix scroll glitch ios due to vh height [[b69d76d](https://github.com/baptisteArno/typebot.io/commit/b69d76d8b28d029e4b248d7af16f52c3f263f955)]
- 💄 (lp) remove book a demo button [[9cc6054](https://github.com/baptisteArno/typebot.io/commit/9cc605471df685716983df3addfc02ee9e29d10e)]
- 🚸 (auth) Add user change email form [[47107e3](https://github.com/baptisteArno/typebot.io/commit/47107e3b5528904aaeb0cf61d38a21dd2518e141)]
- 💄 fix combobox input border color [[1f133d1](https://github.com/baptisteArno/typebot.io/commit/1f133d14675d75e6ddd274763ab8c67cfda8fab9)]
- 🚸 Place button settings floating button on top right [[786accd](https://github.com/baptisteArno/typebot.io/commit/786accdf2433db3d4dddacffc28e3754460b2655)]
- 💄 Fix Items list top alignment [[3c11131](https://github.com/baptisteArno/typebot.io/commit/3c11131f18e7baba125ee2ad1282dcf39fec4b4e)]
- 🚸 Improve pexels picker with options [[14d341f](https://github.com/baptisteArno/typebot.io/commit/14d341f9b24bc0759500545ac568d7667fbf2508)]
- 🚸 (calCom) Add custom question prefill option [[42cf1f3](https://github.com/baptisteArno/typebot.io/commit/42cf1f3fd88c1d120047c3a4ad18af97f3742343)]

### Fixed

- 🐛 Fix getInDepthAnalyticsData invalid request when typebot is not defined [[30d5ceb](https://github.com/baptisteArno/typebot.io/commit/30d5ceb94ba3e29aa635af01dea540ee0fda211e)]
- 🐛 Fix webhook listening error when body is not JSON [[9a1907d](https://github.com/baptisteArno/typebot.io/commit/9a1907d7c7aff2cbd4b61a5efcd6fecb350164ea)]
- 🐛 Fix restore published bot not working on v6.1 [[e1c7c27](https://github.com/baptisteArno/typebot.io/commit/e1c7c27667501c4b236d23c33ee3e3ad1fc2c44e)]
- 🐛 Fix buttons invalid reply when internal value is empty string [[79254cb](https://github.com/baptisteArno/typebot.io/commit/79254cb91086554e9aabecc3514abc3d58de2a46)]
- 🐛 Add ENTERPRISE plan in hasProPerks helper function [[abde422](https://github.com/baptisteArno/typebot.io/commit/abde4227c3b8b8bcb0d06373985e07f4ea0b2f92)]
- 🐛 Map allow comments and reation Blink options [[0027867](https://github.com/baptisteArno/typebot.io/commit/0027867bee1edc7dacda86062818be93aab42ad1)]
- 🐛 Fix black background not showing on popup embed [[1f1baad](https://github.com/baptisteArno/typebot.io/commit/1f1baadb59749dc60a509ab1ea9db9cfa963cc90)]
- 🐛 Fix resetOutgoingEdgeIdProp, look for from props only [[ba338b1](https://github.com/baptisteArno/typebot.io/commit/ba338b1ac6c7e6ddee0c97260626e4c892a7a5e9)]
- 🐛 Fix cards block duplication [[a78498f](https://github.com/baptisteArno/typebot.io/commit/a78498f8293b3c84e8c0f431fd32fcb33c97f0d8)]
- 🐛 Update invitation count query to exclude guests from existing members [[1d43f14](https://github.com/baptisteArno/typebot.io/commit/1d43f14cb672af50d0036bfe7870de66fea898e5)]
- 🐛 (condition) matched condition without connected edge should end the session [[a43173c](https://github.com/baptisteArno/typebot.io/commit/a43173cc478394adf678f7a8bed2e85976da4baf)]
- 🐛 Fix Else item not displayed [[85eafc2](https://github.com/baptisteArno/typebot.io/commit/85eafc2f39097e0e2b645946818797d71394af77)]
- 💚 Fix CI build [[8a9e16e](https://github.com/baptisteArno/typebot.io/commit/8a9e16ecc7b3aaa671920b4837f7c7148ef344e0)]
- 🐛 (cards) Dynamic internal value not being saved [[ec5bd44](https://github.com/baptisteArno/typebot.io/commit/ec5bd4408181ecbd54f53c671edeabc18863e02e)]
- 🐛 Fix svg image not displaying on Firefox [[7807d4c](https://github.com/baptisteArno/typebot.io/commit/7807d4c0a20b57a0ba9b25d8410053eac437febf)]
- 🐛 Fix file re-upload not working [[d007ad0](https://github.com/baptisteArno/typebot.io/commit/d007ad0d51e0ec1dca23f3904a335ed1525c89c3)]
- 🐛 Fix TypebotHeader overlapping blocks settings window [[148b64d](https://github.com/baptisteArno/typebot.io/commit/148b64deaf8c90fedfeb8a8913932097e5e26263)]
- 🐛 Fix results files duplication on typebot duplication [[ee8a41c](https://github.com/baptisteArno/typebot.io/commit/ee8a41ceae98a311e8a62ddc5a46e04b96e9f4c3)]
- 💚 Explicitely add GITHUB_TOKEN in auto tag workflow [[547ecac](https://github.com/baptisteArno/typebot.io/commit/547ecac156cb8e3ec6dfcc8fec4ba11b53eb199e)]
- 🐛 Fix clientSideActions executed from linked bot [[98309fc](https://github.com/baptisteArno/typebot.io/commit/98309fcb3bb28f41a59020ec8de1fb215691550e)]
- 🚑 Fix maximum callstack size issue from setVariableHistory [[21767d2](https://github.com/baptisteArno/typebot.io/commit/21767d2eee259d024a8bd580adba5b950a65605d)]
- 🐛 Fix copy/paste not pasting variable ids in block items [[08ad395](https://github.com/baptisteArno/typebot.io/commit/08ad39558aca1fad375db482015487fecb421651)]
- 🐛 Correctly update startTimeout in exec loop [[2a85bb2](https://github.com/baptisteArno/typebot.io/commit/2a85bb26dcf4dca3164b9e9651c563f70e0adf67)]
- 🐛 Correctly update start time in group execution loop [[98b3383](https://github.com/baptisteArno/typebot.io/commit/98b33832d1f1d152d1a29c697d901a2b18c1f425)]
- 🚑 Fix edge case when calling link to typebot after input [[601ddf3](https://github.com/baptisteArno/typebot.io/commit/601ddf3c070d152a81bfd2df86a57d1ceaef700b)]
- 🐛 Fix starting preview from group not working [[25808a9](https://github.com/baptisteArno/typebot.io/commit/25808a97f05f88c5b92791fd04adc330876ed0d4)]
- 🚑 Fix previous typebot link freeze [[6953a5e](https://github.com/baptisteArno/typebot.io/commit/6953a5e67eae31fa0ede6c0593f73876433003e7)]
- 🚑 Fix typebot link block freeze [[54ed980](https://github.com/baptisteArno/typebot.io/commit/54ed980cbb8497d062dce3d300fbd767f9e6b091)]
- 💚 Fix cards options type error [[997c455](https://github.com/baptisteArno/typebot.io/commit/997c45533fba8e7156a0229e2a29e0475d73e15b)]
- 🐛 (cards) Fix variables saving not working [[ea53db5](https://github.com/baptisteArno/typebot.io/commit/ea53db54749d37c088b9803ab2ce1ef46ac7c911)]
- 🐛 Fix buttons border color not applied [[4836bf1](https://github.com/baptisteArno/typebot.io/commit/4836bf1d801c9d2b766108f9afa0cc586183a121)]
- 🐛 Fix ColorPicker behind other elements in theme config [[a88fa63](https://github.com/baptisteArno/typebot.io/commit/a88fa63e13c36526727a30e9f90913503abf6918)]
- 💚 (lp) Fix window is not defined error from embed bubble loading [[ba5dafb](https://github.com/baptisteArno/typebot.io/commit/ba5dafbb94098de04ae0981e95a2565d7f121b78)]
- 🐛 Add Cote D&#x27;Ivoire (+225) to country code options [[77818e4](https://github.com/baptisteArno/typebot.io/commit/77818e4fc9604201b9fe31dc93887c9ce92bda90)]
- 🐛 Update contacts schema in OpenAPI definitions to use arrays for contacts and phones [[508d339](https://github.com/baptisteArno/typebot.io/commit/508d3392204b8dec22571cc6da2689a24a751150)]
- 🐛 (whatsapp) Update incomingMessageSchema to use an array for contacts [[9c1e82a](https://github.com/baptisteArno/typebot.io/commit/9c1e82a6a6d942883ccce6ea41efd613b5ff20ce)]

### Content

- 📝 Add &quot;feedback chatbot&quot; blog post ([#2140](https://github.com/baptisteArno/typebot.io/issues/2140)) [[ea91378](https://github.com/baptisteArno/typebot.io/commit/ea913782e2e6a8b75e9e8d963d24c0ab6756446d)]
- 📝 Add &quot;lead generation form examples&quot; blog post ([#2054](https://github.com/baptisteArno/typebot.io/issues/2054)) [[8a20050](https://github.com/baptisteArno/typebot.io/commit/8a200504da8a10fb1f1d7a9f387c85f9ff268815)]
- 📝 Add &quot;HTML Form Generator&quot; blog post ([#2011](https://github.com/baptisteArno/typebot.io/issues/2011)) [[43bacc4](https://github.com/baptisteArno/typebot.io/commit/43bacc442caba5fcdfac424f7075be772e07c424)]
- 📝 Add v3.6 newsletter [[f47eda9](https://github.com/baptisteArno/typebot.io/commit/f47eda9880353c852d35ddbeca6f0f5d3fe34dbb)]
- 📝 Update settings documentation to include system messages feature [[19d1a56](https://github.com/baptisteArno/typebot.io/commit/19d1a56cb5efd92bd3c8d388b6a80b38e3861aab)]
- 📝 Add Query Knowledge Base section to Dify.AI documentation [[93908a9](https://github.com/baptisteArno/typebot.io/commit/93908a9ae17ecf3a27a2eeea4c84b672e9fa1dbf)]
- 📝 Add formatting options for Number input block documentation [[24c6278](https://github.com/baptisteArno/typebot.io/commit/24c62783d91bdf72b532d06ac0171580a7562527)]
- 📝 Update Buttons documentation to include item options and display conditions [[b8a63a9](https://github.com/baptisteArno/typebot.io/commit/b8a63a93b7bd702a1d0b9e3e91def16f758da3af)]
- 📝 Add Security Policy doc [[ba02684](https://github.com/baptisteArno/typebot.io/commit/ba0268466d1416e2896ed94cf0a5baac6cc35182)]

### Internal

- 🔧 Add &quot;Missing credentialsId&quot; to Sentry ignore messages [[9c1b980](https://github.com/baptisteArno/typebot.io/commit/9c1b98073089dc0c4d935e05207918be926abcf5)]
- ♻️ Improve transcript computation for jump and return blocks [[8ab1f02](https://github.com/baptisteArno/typebot.io/commit/8ab1f0235dc6901fb4631aac9135d249b825909d)]
- 🔧 Update GitHub Actions workflow to use CONTENTS_RW_PAT for GITHUB_TOKEN [[d32b6f8](https://github.com/baptisteArno/typebot.io/commit/d32b6f8fa47ff192fec6e49f435f17ce806beeae)]
- ♻️ Migrate chat api schemas to its own package [[1217bd5](https://github.com/baptisteArno/typebot.io/commit/1217bd58e6743f5c287598478959ebd9b99883f7)]
- 🗃️ Add Enterprise to Plan enum [[9844126](https://github.com/baptisteArno/typebot.io/commit/98441264ec07c542e2c06bac55e99997cb237550)]
- 🔒 Add necessary auto add project workflow PAT [[a95364f](https://github.com/baptisteArno/typebot.io/commit/a95364fadfac4576410d59db8bcafd542d21464d)]
- 🔒 Remove use of PAT in Github workflows [[59627ab](https://github.com/baptisteArno/typebot.io/commit/59627ab1d8018929111646921cdb10d2cfc9501e)]
- ♻️ Simplify walk the flow logic in bot engine ([#2127](https://github.com/baptisteArno/typebot.io/issues/2127)) [[81ef7df](https://github.com/baptisteArno/typebot.io/commit/81ef7dfdff26a4ff7c2e25d83c4331781545c2c2)]
- ♻️ Misc types improvement ([#2120](https://github.com/baptisteArno/typebot.io/issues/2120)) [[fe8469f](https://github.com/baptisteArno/typebot.io/commit/fe8469fcdeb90c35f963575c1b0ba4ddbc5c71aa)]

### Miscellaneous

- 🧑‍💻 Use custom HOSTNAME and PORT in docker entrypoints ([#2148](https://github.com/baptisteArno/typebot.io/issues/2148)) [[ce637fb](https://github.com/baptisteArno/typebot.io/commit/ce637fb608ffe44ff119739c7f4aaad3d42c2fa9)]
- 🧑‍💻 Upgrade to next-auth v5 and next v15 [[3f53bfe](https://github.com/baptisteArno/typebot.io/commit/3f53bfec5d203bac5c633700b19b6c6992067c6d)]
- 🩹 Fix &quot;Generated HTML&quot; auto height [[8d7163d](https://github.com/baptisteArno/typebot.io/commit/8d7163dd8951f590efea434b50aeaefc69f952d1)]


<a name="3.6.0"></a>
## 3.6.0 (2025-04-01)

### Breaking changes

Before upgrading, please make sure to read all the [associated breaking changes](https://docs.typebot.io/self-hosting/breaking-changes).

### New features

- ✨ Add &quot;Allowed file types&quot; option in file upload input ([#2103](https://github.com/baptisteArno/typebot.io/issues/2103)) [[0861d63](https://github.com/baptisteArno/typebot.io/commit/0861d635af017443a1045d884cb0dfb864c40de1)]
- ✨ Introduce Blink block [[615f9b0](https://github.com/baptisteArno/typebot.io/commit/615f9b0d6d5958562957558752a8c162014761bb)]
- ✨ Add format options in number input block ([#2080](https://github.com/baptisteArno/typebot.io/issues/2080)) [[f515ef1](https://github.com/baptisteArno/typebot.io/commit/f515ef108ed2e5340cadfd2e01e236dfc821358a)]
- ✨ Add Cards Input [[b61b5f5](https://github.com/baptisteArno/typebot.io/commit/b61b5f5e4eda38592df1ae19442c18ade128c625)]
- ✨ Add Deepseek block ([#2046](https://github.com/baptisteArno/typebot.io/issues/2046)) [[812ece0](https://github.com/baptisteArno/typebot.io/commit/812ece0ae0937f292ca4da37526f739644696c4c)]

### UI/UX Improvements

- 🚸 Upgrade AI SDK and simplify model selection for OpenAI and Mistral [[904bf82](https://github.com/baptisteArno/typebot.io/commit/904bf82bd3163f740396e1eedb1948cb4d777ac5)]
- 🚸 Improve list pasting in buttons [[e74b95f](https://github.com/baptisteArno/typebot.io/commit/e74b95fd65064b7e1c37f7fb789c316deb601d36)]
- ⚡ Add &quot;Device type&quot; set variable option [[8771fd3](https://github.com/baptisteArno/typebot.io/commit/8771fd3c5383af7b1c77f2184cf84f4251f38aa5)]
- 🚸 Add internal values option in choice inputs ([#2098](https://github.com/baptisteArno/typebot.io/issues/2098)) [[e8c2f17](https://github.com/baptisteArno/typebot.io/commit/e8c2f1746fb3138a8eab0834d285b5bf7ee704e6)]
- 🚸 Make entire screen scrollable when chat container is disabled [[8049880](https://github.com/baptisteArno/typebot.io/commit/80498808ffb495e567cc8bb343e5e1269a41d41f)]
- 💄 (cards) Fix UI when getting non scrollable total cards [[98dffad](https://github.com/baptisteArno/typebot.io/commit/98dffad8e0a9c240a2402d42b8171bf77e8b2a78)]
- 🚸 Attempt to parse URL with extension when downloaded publicly from WhatsApp [[e03e7b8](https://github.com/baptisteArno/typebot.io/commit/e03e7b84c0247922b4b118f0df88f10789afb1f4)]
- 🚸 Add replyTo host email for guest and workspace invitations [[4151804](https://github.com/baptisteArno/typebot.io/commit/415180422f822a16375b9f2997414f2553ef5164)]
- 🚸 Allow for custom text in OpenRouter and Together blocks [[bbb5a79](https://github.com/baptisteArno/typebot.io/commit/bbb5a791a1eb6ce02f297aa7976107dded9eaeeb)]
- 🚸 Add network error system messages ([#2084](https://github.com/baptisteArno/typebot.io/issues/2084)) [[2a554cb](https://github.com/baptisteArno/typebot.io/commit/2a554cbe861f11567a86cd284c716fcb83688db9)]
- 🚸 Avoid displaying custom domains dropdown if user is not writer [[7cca1cd](https://github.com/baptisteArno/typebot.io/commit/7cca1cde69c0785e633eaebf21c32905d3589119)]
- ⚡ Add prompt and completion tokens to the save dropdown ([#2070](https://github.com/baptisteArno/typebot.io/issues/2070)) [[9a7624b](https://github.com/baptisteArno/typebot.io/commit/9a7624bf48bd92c785958180a49994deb6e66cbd)]
- 🚸 Improve auto scroll to bottom decision [[c760528](https://github.com/baptisteArno/typebot.io/commit/c760528bc9ad8cbf8a46a022e1e5d75c654472a1)]
- 🚸 Update GroupFocusToolbar to conditionally render copy and delete buttons based on read-only state [[a52f74c](https://github.com/baptisteArno/typebot.io/commit/a52f74c006fabd8d19d5c3dc9888056dbc2a3015)]
- 🚸 Enhance PlaceholderNode with hitbox extension [[5d15b70](https://github.com/baptisteArno/typebot.io/commit/5d15b7021ff43317d9ae61b67cb24a6f13cf8191)]
- 🌐 Add more translations ([#2051](https://github.com/baptisteArno/typebot.io/issues/2051)) [[d1215c6](https://github.com/baptisteArno/typebot.io/commit/d1215c6a467e7367c353bb4d2699f17919deef33)]
- 💄 Fix shrinking base URL in share page when entering edit [[2417897](https://github.com/baptisteArno/typebot.io/commit/2417897f5160ad5b8422813d1829ac7b41f2810b)]
- 🚸 Try to parse stringified array before loading them in as dynamic items [[75814ef](https://github.com/baptisteArno/typebot.io/commit/75814efe0e9d271e970a3f52862e7a1876ebfa19)]
- 🚸 Persist language preference in database for better cross device experience ([#2043](https://github.com/baptisteArno/typebot.io/issues/2043)) [[ffd40e0](https://github.com/baptisteArno/typebot.io/commit/ffd40e0dd5f811e9e4f2ccf2d23778833728aebe)]

### Fixed

- 🐛 Fix Forge CLI creation to use src directory [[39f6b61](https://github.com/baptisteArno/typebot.io/commit/39f6b61fd0279651fbad258f6229a6c6d2a92bcd)]
- 🚑 Remove forgotten debug writeFilySyncs [[411fb9f](https://github.com/baptisteArno/typebot.io/commit/411fb9fca73ab6d0fe637ca32455d14ed879dbaf)]
- 🐛 (whatsapp) Add contacts incoming message type [[1796cf5](https://github.com/baptisteArno/typebot.io/commit/1796cf5ea17ed34fddeb9f92673a53f0c3dde090)]
- 🐛 Fix legacy openai empty messages issue [[9d08b4b](https://github.com/baptisteArno/typebot.io/commit/9d08b4b758afe691e764d1441930613e3e222633)]
- 🚑 Fix matchByIndex function to use strict equality for index matching [[6488df6](https://github.com/baptisteArno/typebot.io/commit/6488df64ff3b5c9c4101a072e5b9540a9e8b6bf4)]
- 🐛 Fix auth failing when given unknown fields on account linking [[ca8c482](https://github.com/baptisteArno/typebot.io/commit/ca8c4826918f417f1ed5de210280786bf2aa7a89)]
- 🐛 Fix image expansion overflowing issue in bubble [[0040575](https://github.com/baptisteArno/typebot.io/commit/00405755844c3c20d6e5538aca50f544a6a8cb58)]
- 🐛 Fix new forged block constants injection [[78194c1](https://github.com/baptisteArno/typebot.io/commit/78194c1219089e898a4110fbfb138f11494f548a)]
- 🐛 Make the &quot;Device type&quot; function work in iframes as well [[74c8860](https://github.com/baptisteArno/typebot.io/commit/74c8860207190f9613a51ae6dab10ea8f1779017)]
- 🐛 Fix redirect popup toast invisible UI [[f897694](https://github.com/baptisteArno/typebot.io/commit/f897694ac7318c14a97f3cdf34d31a032162c0f0)]
- 🐛 Add check for empty allowed origins in origin validation logic [[54612a2](https://github.com/baptisteArno/typebot.io/commit/54612a2d5e5395e2485c84ed24a236eebdc208eb)]
- 🐛 Make allowed origins stricter and prevent the bot being consumable from public URL as mentioned in the docs [[7f44ca4](https://github.com/baptisteArno/typebot.io/commit/7f44ca4410850c0f644e02468ca35db4e0d2ede5)]
- 🐛 Fix help document URL for AB Test block [[c9b57f5](https://github.com/baptisteArno/typebot.io/commit/c9b57f58bfbc1613823cac7f3073fe74dbbd8d05)]
- 🐛 Fix &quot;Pick an image&quot; popover going behind ([#2099](https://github.com/baptisteArno/typebot.io/issues/2099)) [[0606fa3](https://github.com/baptisteArno/typebot.io/commit/0606fa3d8b435fea243c0ff66a7d32c15a6de149)]
- 🚑 Fix chat chunks spacing [[ce163b4](https://github.com/baptisteArno/typebot.io/commit/ce163b448be61ef3ac36d534e476c72d63d5e32b)]
- 🐛 Fix pause flow in WhatsApp runtime [[ecb94e3](https://github.com/baptisteArno/typebot.io/commit/ecb94e3a53dab9fc2a2733867cbd4a9963ed95fc)]
- 🐛 Correctly reset state when streaming fails [[413e29b](https://github.com/baptisteArno/typebot.io/commit/413e29bc9e86e493455ed6aa03ea0f47811f48e2)]
- 🐛 (cards) Fix dynamic cards duplication [[0c531af](https://github.com/baptisteArno/typebot.io/commit/0c531aff66b7ac3d0ee004638754908bd74d9f81)]
- 🐛 Prevent blocks sidebar closure when mouse exits left side of the screen [[4a9efaa](https://github.com/baptisteArno/typebot.io/commit/4a9efaa66920eba4c8c1ff584dcb5f4940ae5dae)]
- 🐛 Fix copy pasting Jump blocks in a new typebot [[68aab60](https://github.com/baptisteArno/typebot.io/commit/68aab6089d4fcc373fb354f54f8009e75a122aa5)]
- 🐛 Increase workspace modal width to fix truncation on some languages [[c9519cb](https://github.com/baptisteArno/typebot.io/commit/c9519cb4462fcd06a6cf65a4a78ad1a8dfe792a9)]
- 🐛 Fix emoji and icon display in bot [[b0bed92](https://github.com/baptisteArno/typebot.io/commit/b0bed92de26576051925f26de5b9dc3504b26287)]
- 🐛 Implement back optimistic user updates [[b4029dc](https://github.com/baptisteArno/typebot.io/commit/b4029dce96d93e6c48e7b927cc1fe2f6f0d43a42)]
- 🐛 Fix typebot icon popover behind blocks sidebar [[03a8531](https://github.com/baptisteArno/typebot.io/commit/03a8531bce96a62d0d83f42c7850f4144d2da49f)]
- 🐛 Update file input accept types to include AVIF format for image uploads [[74ccd9c](https://github.com/baptisteArno/typebot.io/commit/74ccd9c2e6d75cddcf2842ac2e6fe279177364e1)]
- 🐛 (editor) Fix block dropping on same group not detected [[275d987](https://github.com/baptisteArno/typebot.io/commit/275d9876d8965e672cd85fa519a8ba311196fea0)]
- 🚑 Fix number validation when equals to 0 [[9153337](https://github.com/baptisteArno/typebot.io/commit/915333792406ad2ae3289c7bdcb4a11b4da51f14)]
- 🚑 Avoid formatting number on reply parsing [[e10d448](https://github.com/baptisteArno/typebot.io/commit/e10d448bf89ea0a9b44327164848e20ba8c1a035)]
- 🚑 Upgrade embed libs [[793e174](https://github.com/baptisteArno/typebot.io/commit/793e1742a15aa68d728ccd75ed7590e3e3badab0)]
- 🚑 Re-apply default value to number input ([#2082](https://github.com/baptisteArno/typebot.io/issues/2082)) [[4cea601](https://github.com/baptisteArno/typebot.io/commit/4cea6010adaee5d87d3885f841500e4bf2090048)]
- 🚑 Upgrade embed libs [[fd20942](https://github.com/baptisteArno/typebot.io/commit/fd2094222f066bbd4355cd74fdd10d5caf914652)]
- 🐛 Tie globals object for each session [[42d974f](https://github.com/baptisteArno/typebot.io/commit/42d974f20086c588749f17a9944d2905f8d86ec1)]
- 🐛 Improve GhostableItem validation and error logging [[0003e72](https://github.com/baptisteArno/typebot.io/commit/0003e729e30b10bccc1263c20db1cc90e6fb9e21)]
- 🐛 Fix variable list transformation logic [[e9ac1fd](https://github.com/baptisteArno/typebot.io/commit/e9ac1fd295490e501992d54c6f43d20bfa9955fd)]
- 🐛 Fix GhostableItem detection in StackWithGhostableItems [[1512da0](https://github.com/baptisteArno/typebot.io/commit/1512da050dfaadd96b45e57b003ed8c0351b5c3d)]
- 🐛 Improve error handling in StackWithGhostableItems [[09e80d9](https://github.com/baptisteArno/typebot.io/commit/09e80d9a1cc6b250790e5e6d46223698fd2bf26c)]
- 🐛 Correctly save streaming error in logs [[9e7e24b](https://github.com/baptisteArno/typebot.io/commit/9e7e24b96a8ea67cf9fa2c55ab8c1c699b9d1a33)]
- 🐛 Fix sheets builder API endpoint should use workspaceId [[ef94ba7](https://github.com/baptisteArno/typebot.io/commit/ef94ba7487c32a82b3c98f19c704eb8368d1bfcd)]

### Content

- 📝 Update condition documentation to clarify list handling with Greater and Less operators [[ca46139](https://github.com/baptisteArno/typebot.io/commit/ca461396946dfe6e639b9a26bfcf34f61e7b5f9b)]
- 📝 Add contribution guidelines [[4d65bfc](https://github.com/baptisteArno/typebot.io/commit/4d65bfc5de4a873695063d1ca34d060bf3cb9340)]
- 📝 Update local installation guide to include information about minio instance for file uploads [[9fe956b](https://github.com/baptisteArno/typebot.io/commit/9fe956b223f0733f6291c88a9db47d7075055c3d)]
- 📝 Update local installation guide with simplified commands and authentication options [[0b77bd4](https://github.com/baptisteArno/typebot.io/commit/0b77bd4c53eee85c37153cd9d2fb9e5e9d1bb91c)]
- 📝 Add Mindeo logo to companies marquee [[8c6839c](https://github.com/baptisteArno/typebot.io/commit/8c6839c9cc3bf2a03945ccca04c3158722bff1a8)]
- 📝 Add command event documentation image [[9237337](https://github.com/baptisteArno/typebot.io/commit/92373377bb5d201da4a889928d0a37a68e476d60)]
- 📝 Add &quot;React website builders&quot; blog post ([#2044](https://github.com/baptisteArno/typebot.io/issues/2044)) [[0980788](https://github.com/baptisteArno/typebot.io/commit/098078875cda7d215b02a9ba78570cf421f91bbc)]
- 📝 Add &quot;How to accept payment on WhatsApp Business&quot; blog post ([#2042](https://github.com/baptisteArno/typebot.io/issues/2042)) [[d9636a2](https://github.com/baptisteArno/typebot.io/commit/d9636a210f4ff28828c66401a48ecddd3e7eae7f)]

### Internal

- 🔥 Remove deprecated &#x60;edgeIdToTriggerWhenDone&#x60; prop in typebotsQueue [[bd4520c](https://github.com/baptisteArno/typebot.io/commit/bd4520c5c80860a97fb0f3410f60f11e385873ce)]
- 🔧 Add @ark-ui/react dependency to typebot UI package [[e5b22d1](https://github.com/baptisteArno/typebot.io/commit/e5b22d1b3f4283405c5f01c891c210a1d2134c2f)]
- 🔧 Migrate to bun.lock and update Dockerfile to use prune with bun [[6ab3c95](https://github.com/baptisteArno/typebot.io/commit/6ab3c955a77b99fd2ab9cc73cfb64d2c0d2c8fb1)]
- ♻️ Move blink block code to src folder [[074687e](https://github.com/baptisteArno/typebot.io/commit/074687ebda0e0b36835fab2babdfe637997122aa)]
- 🔧 Introduce &#x27;isShared&#x27; property to Typebot model&quot; [[d8b3b84](https://github.com/baptisteArno/typebot.io/commit/d8b3b8484e0f8531b7477e58f2dc503850061728)]
- 🔧 Introduce &#x27;isShared&#x27; property to Typebot model [[18459bc](https://github.com/baptisteArno/typebot.io/commit/18459bc4d31f8b24ff1577c1455eec8755ebdd72)]
- 🔒 Improve brand badge CSS protection [[1518033](https://github.com/baptisteArno/typebot.io/commit/1518033f03a8a42bb57c1af3c365571fd83af76e)]
- 🔧 Improve error details extraction [[cb93198](https://github.com/baptisteArno/typebot.io/commit/cb931988e4ecef4e35013b5cc1edb80dfca63b64)]
- 🔧 Fix default docker compose file, add db to same network [[d79dfbb](https://github.com/baptisteArno/typebot.io/commit/d79dfbb5a776b3ca884aec7b01cfa4f48418242a)]
- 🔧 Add debug logging for error details in WhatsApp message handling [[ee0aaa9](https://github.com/baptisteArno/typebot.io/commit/ee0aaa9715565fe18a4b6ed692bb101913e2c9af)]
- ♻️ Add display names for StackWithGhostableItems components [[f4b43c0](https://github.com/baptisteArno/typebot.io/commit/f4b43c07025242a1223a86d8d64445157d7b4d9d)]
- 🔧 Improve new results tracking only tracking non-zero, per typebot [[3d3f192](https://github.com/baptisteArno/typebot.io/commit/3d3f192c0d683dc303a6c229a83b9ca4e0059ee3)]


<a name="3.5.0"></a>
## 3.5.0 (2025-03-03)

### New features

- ✨ Add Perplexity block ([#2022](https://github.com/baptisteArno/typebot.io/issues/2022)) [[172e17d](https://github.com/baptisteArno/typebot.io/commit/172e17d83b664b120d950e26ffca321e8bcb50c1)]
- ✨ (dify.ai) Add Query Knowledge Base action [[49a17e6](https://github.com/baptisteArno/typebot.io/commit/49a17e67c3d054adac497a016cd3ef81f62adb6a)]

### UI/UX Improvements

- 🚸 Added host image bubble expansion on click ([#2035](https://github.com/baptisteArno/typebot.io/issues/2035)) [[de6ae74](https://github.com/baptisteArno/typebot.io/commit/de6ae74f6771ea62c31a0180d04c7f79af9ce328)]
- 💄 (lp) Change UseCases layout. Bigger product screenshots [[4f55518](https://github.com/baptisteArno/typebot.io/commit/4f555187b2505ab4c242e60cc87ef1997151923e)]
- 🚸 Properly handle viewer 404 [[decc19a](https://github.com/baptisteArno/typebot.io/commit/decc19abc93e9b3b4aac62736e8630c14dfa8b7a)]
- 🌐 Update payment collect label translations [[fb3eda4](https://github.com/baptisteArno/typebot.io/commit/fb3eda4e87796570bd1e8b8def7eb65a7aafdcb6)]
- 🚸 (googleSheets) Properly catch updateRow errors [[2597742](https://github.com/baptisteArno/typebot.io/commit/2597742521cc4313ccfd103af79b8aef0c01aa93)]
- 🚸 Improve error handling with AI streaming [[a6714ef](https://github.com/baptisteArno/typebot.io/commit/a6714ef1ab34584fc8cba4cfe73695d485a26bb4)]
- 🚸 Add error logging for OpenAI assistant stream creation [[f46cc47](https://github.com/baptisteArno/typebot.io/commit/f46cc47e86449908928626ff8bd6402c18657d0f)]
- 🚸 Add error logging for unconfigured forged blocks [[f07cf79](https://github.com/baptisteArno/typebot.io/commit/f07cf79aba08e21a1fcce433464207338ce5cddb)]
- 🚸 Improve error handling in AI generation functions [[a634bb3](https://github.com/baptisteArno/typebot.io/commit/a634bb3076ca46a1f1ba6772c102cdd7ef189705)]
- 🚸 Gracefully handle google doc authentication with missing credId or spreadsheetId [[d6b5578](https://github.com/baptisteArno/typebot.io/commit/d6b55781b32434466fadecfde3c2b0bb8f5ff024)]
- 🚸 Gracefully handle and display createSpeech error [[49e246a](https://github.com/baptisteArno/typebot.io/commit/49e246a7acd62c42ffcc0dde3d00d12c8ce7477f)]
- 🚸 Handle more known error codes from WA preview webhook [[a91b49b](https://github.com/baptisteArno/typebot.io/commit/a91b49b1da8471eaacc327094aeb7ca0f1d3d7d0)]
- 🚸 Improve WhatsApp setup client toast errors [[971ab56](https://github.com/baptisteArno/typebot.io/commit/971ab56be188514578610fab27208d085ba6cc81)]
- 🚸 Improve Google Sheets picker to filter spreadsheet files [[e70ddd9](https://github.com/baptisteArno/typebot.io/commit/e70ddd95d27df066e20b8e68fbb08362bfd192b0)]
- 🚸 Persist time filter state in URL in results tab [[39a1408](https://github.com/baptisteArno/typebot.io/commit/39a1408ffb83eb32fd96fdcdd291967f6be0f032)]
- 💄 Change export results progress bar color [[8ea15d5](https://github.com/baptisteArno/typebot.io/commit/8ea15d5bb880e39573ffdad4a6eb9bc847b0cee7)]
- 🚸 Improve credentials label explanations [[8b329fe](https://github.com/baptisteArno/typebot.io/commit/8b329feaea431f5775ef691425a9c9021e97d021)]
- 🚸 Improve File upload settings layout and explanation [[a48f20f](https://github.com/baptisteArno/typebot.io/commit/a48f20f92c721801224da2a0e6b97195a9854a17)]
- 💄 Remove question mark on switch labels [[4cb0574](https://github.com/baptisteArno/typebot.io/commit/4cb0574c4f8e99c988045e68a5c67c4c8747021a)]
- 🚸 Unify captured logs for better error reporting [[d9df90c](https://github.com/baptisteArno/typebot.io/commit/d9df90c9b1434a285347223a23e857bf1671a9fc)]
- 🚸 Improve toasts consistency and UI [[c5025db](https://github.com/baptisteArno/typebot.io/commit/c5025db35e057d0026a0d6efc0bc4bc75ffd6a59)]
- 🚸 Ignore update typebot conflict in builder [[ab3caeb](https://github.com/baptisteArno/typebot.io/commit/ab3caeba276d897ce062708ae8d75a082e163bc2)]
- ⚡ Improve group title gen default prompt and add docs [[983f71c](https://github.com/baptisteArno/typebot.io/commit/983f71c0a9745ab1b73ba820230126ff7575d430)]
- 💄 Limit max height for set variable expression block content [[89a77e4](https://github.com/baptisteArno/typebot.io/commit/89a77e4be16328aefc327e3f8319ad2d4ce39349)]
- 💄 Enhance UI for create typebot and duplicate typebot pages [[868dc53](https://github.com/baptisteArno/typebot.io/commit/868dc533ca0a2ff2ef997ed288559d753c56dce1)]
- 💄 Improve sign-in page and form UI [[19a9f74](https://github.com/baptisteArno/typebot.io/commit/19a9f743c409abce1c8ed097c89f36403ab86f60)]

### Fixed

- 💚 Fix getCredentials incompatible with legacy viewer API [[e98c7c2](https://github.com/baptisteArno/typebot.io/commit/e98c7c20878eab33b867605e26d11a1d7fa12f8c)]
- 💚 Fix sentry config type error [[179e60b](https://github.com/baptisteArno/typebot.io/commit/179e60b9d8230b01639a165051191d1d2ab5d912)]
- 🐛 Make saveClientLogs retro compatible [[a67204c](https://github.com/baptisteArno/typebot.io/commit/a67204c8dce820bdc2033febed5489927fe1c4dd)]
- 🐛 Improve schema validation for optional number and variable types [[9ce25de](https://github.com/baptisteArno/typebot.io/commit/9ce25de430f716a2a6f5f696b5c0d04ae1ebf8fb)]
- 🐛 Adjust schema validation for optional number and variable types [[bd3dc6e](https://github.com/baptisteArno/typebot.io/commit/bd3dc6e3a7eca17df71cfb4dfc8b79fd2be77584)]
- 🐛 Attempt to fix published typebot refetch with null typebotId [[c236c29](https://github.com/baptisteArno/typebot.io/commit/c236c29931914c5d91a4c10f036dd3415f2655e3)]
- 🐛 (whatsapp) Accept system messages and optional metadata [[26559f1](https://github.com/baptisteArno/typebot.io/commit/26559f16c60ba3c3824aab8e05a2b02ded8a0f89)]
- 🐛 Preprocess number or variable type to avoid unwanted validation crash [[ccd794a](https://github.com/baptisteArno/typebot.io/commit/ccd794a82f269e6c365c5283ce70adff018e5fb3)]
- 🐛 Add support for WhatsApp sticker incoming messages [[9afbf62](https://github.com/baptisteArno/typebot.io/commit/9afbf62f358e49bdfb35c8f317042ddcbaccaff8)]
- 🐛 Add sendCommand method to Typebot web embed [[dccb9e8](https://github.com/baptisteArno/typebot.io/commit/dccb9e814c4cc97caf416cbdb4a0def5c95630d9)]
- 🐛 (remember) Properly save avatars history in storage [[7509c5f](https://github.com/baptisteArno/typebot.io/commit/7509c5fed749582415a6db1ead150af77f53232a)]
- 💚 (whatsapp) Fix type error with new incoming schema def [[385856e](https://github.com/baptisteArno/typebot.io/commit/385856ef1f0007ccdb5005dfa5b1f739b7cc3b9d)]
- 🐛 Fix potential crash on empty action in forged block [[84f20ff](https://github.com/baptisteArno/typebot.io/commit/84f20ff2ed948f658fa4ba4d95ea34fee42d8261)]
- 🐛 Fix HTTP error parsing when json body is empty [[f45f565](https://github.com/baptisteArno/typebot.io/commit/f45f56508113983e4e2d6d7089408810b09d1ce9)]
- 🐛 Add support for incoming list reply [[a4358d6](https://github.com/baptisteArno/typebot.io/commit/a4358d6e21198a964ab7683dec10d1321d644c4b)]
- 🐛 Fix submit event type in PaymentForm [[35cf88d](https://github.com/baptisteArno/typebot.io/commit/35cf88d9a66fbc93afa23ee8668653a64dea6dad)]
- 🚑 Fix chat remembered state restoration [[40aa716](https://github.com/baptisteArno/typebot.io/commit/40aa716d94e9fec17de30df028b1015b548cb86d)]
- 🐛 (webhook) Fix block not working when bot is embedded [[95b7e28](https://github.com/baptisteArno/typebot.io/commit/95b7e28b9bf52d392bfa8fd4e5893b86d4812041)]
- 🚑 Fix typebot link not resuming [[37c7669](https://github.com/baptisteArno/typebot.io/commit/37c7669245c86622f8a272e85dcda0fe9d7dc903)]
- 🐛 (whatsapp) Add &quot;unsupported&quot; incoming message type [[bbb90b5](https://github.com/baptisteArno/typebot.io/commit/bbb90b529b2a57fe9bcbb128780fad240be4f664)]
- 🐛 Remove currentUserMode from getTypebots query [[a6c639a](https://github.com/baptisteArno/typebot.io/commit/a6c639aaf02b5bf65b947f3010a9a8d5d1219a6c)]
- 🐛 Ignore WhatsApp message reactions in webhook handlers [[b4ce205](https://github.com/baptisteArno/typebot.io/commit/b4ce205f702ec5e7e82cbe07e88cf39f80351904)]
- 🐛 Fix export results progress calculation using total starts [[6ee18f2](https://github.com/baptisteArno/typebot.io/commit/6ee18f2c3199e4e1c9d1ca99a36e0a094897f324)]
- 🐛 Handle missing WhatsApp message gracefully [[7ce7b7a](https://github.com/baptisteArno/typebot.io/commit/7ce7b7ab29ffd2503a80c1521e11a0c2ecb2f8b3)]
- 🐛 Fix invalid auth token req [[7da65db](https://github.com/baptisteArno/typebot.io/commit/7da65db003c8ad90e323db8c022f7ed5215326a3)]
- 🐛 Fix potentially invalid call to getPublishedTypebot [[5da2971](https://github.com/baptisteArno/typebot.io/commit/5da2971bafb0eafbf6bf7a209c0c5e52f69d37f9)]
- 🐛 Fix error parsing with response field [[f2512eb](https://github.com/baptisteArno/typebot.io/commit/f2512eb471f574d6d366954be86745b961183a07)]
- 🐛 Fix group gen onboarding video toggling on check off [[5c43109](https://github.com/baptisteArno/typebot.io/commit/5c43109c7818f7188616e8123473a261cf4fb091)]
- 💚 Attempt to fix lp build [[c7e9f6d](https://github.com/baptisteArno/typebot.io/commit/c7e9f6d5cdaf5a9ab59803eaaa525c2ff5aaa87b)]
- 🚑 Fix streaming message stuck [[8c8efc4](https://github.com/baptisteArno/typebot.io/commit/8c8efc43567176c93f7c424c47b90543e75569ff)]
- 🐛 Avoid sending useless queries when not having the rights [[d3c4a53](https://github.com/baptisteArno/typebot.io/commit/d3c4a535cc904098a4d6f2c2426860220349d6f8)]
- 🐛 Enable dynamic theme for bot background [[b7a8a9e](https://github.com/baptisteArno/typebot.io/commit/b7a8a9ed5ac97fb75dd17e4ca74ca0a39bff8c05)]
- 🐛 Prevent wheel event default behavior in Firefox graph [[20c3449](https://github.com/baptisteArno/typebot.io/commit/20c344977f9ad42e0ba6294a5ec552e24cdb9592)]
- 🐛 Duplicate media objects on typebot import [[6ff81b9](https://github.com/baptisteArno/typebot.io/commit/6ff81b93fdeccc5dd6acc1b41e3e4f2cd04a841d)]
- 🐛 Avoid country code reset on phone input emptying ([#2000](https://github.com/baptisteArno/typebot.io/issues/2000)) [[f20a2ed](https://github.com/baptisteArno/typebot.io/commit/f20a2ed9c30c16c8bceb4ced018ec1ade11ef856)]
- 🐛 Fix Pop and shift variable side effect not working for string [[ff0732e](https://github.com/baptisteArno/typebot.io/commit/ff0732ef2a4ac6d13f08fbaa7e9d1c4b80868b4d)]
- 💚 Update remaining shutdownAsync method calls [[c703162](https://github.com/baptisteArno/typebot.io/commit/c70316263d423055c715be558ae0a0c4cae37c62)]
- 💚 Update PostHog client shutdown method [[39b9c47](https://github.com/baptisteArno/typebot.io/commit/39b9c478f66ed524ef8d8e74902d84b151b58938)]
- 🐛 (anthropic) Fix system message not taken into account in message stream [[cc4c2bd](https://github.com/baptisteArno/typebot.io/commit/cc4c2bd98421a7944a3545d576c95d86fd07dba0)]

### Content

- 📝 Update self-hosting deployment docs with database migration steps [[0c3ce76](https://github.com/baptisteArno/typebot.io/commit/0c3ce76c6ae5befb3f11080e878eae14875c1eac)]
- 📝 Update blog post publication dates [[481a338](https://github.com/baptisteArno/typebot.io/commit/481a338c7b74fed267fb76236034ce8ed8971918)]
- 📝 Add &quot;WhatsApp AI Agent&quot; blog post [[eb5e5ab](https://github.com/baptisteArno/typebot.io/commit/eb5e5abb5df04bd497a36b5badac2523f0af1071)]
- 📝 Add &quot;AI Chabot with custom knowledge&quot; blog post [[5b73d5b](https://github.com/baptisteArno/typebot.io/commit/5b73d5b521c204f784de8054d371dd8a04f0c1d4)]
- 📝 Add &quot;FAQ chatbot&quot; blog post [[317a91b](https://github.com/baptisteArno/typebot.io/commit/317a91b0e7c0b37b45654b7688a3d76c0585f75c)]
- 📝 Add &quot;Flowise alternatives&quot; blog post [[a6325f9](https://github.com/baptisteArno/typebot.io/commit/a6325f9afe2d24ace1bf07886cd685845c8ee13b)]
- 📝 Add &quot;Best chatbot builder&quot; blog post [[a5b5862](https://github.com/baptisteArno/typebot.io/commit/a5b5862416e9bd8850930a0713868f2b6438d0ee)]
- 📝 Add &quot;WhatsApp chatbot use cases&quot; blog post [[3262a28](https://github.com/baptisteArno/typebot.io/commit/3262a28f229e6fc2a9a54bedf6a57746e280d54e)]
- 📝 Add &quot;Typeform vs Google Form&quot; blog post [[eb96eba](https://github.com/baptisteArno/typebot.io/commit/eb96ebaa67a734cdb8c0b23ad27009f670e31196)]
- 📝 Add Blink integration instructions [[a54b27c](https://github.com/baptisteArno/typebot.io/commit/a54b27cfbded6ea13831c472276983790a4387fe)]
- 📝 Add upcoming schema changelog [[4599862](https://github.com/baptisteArno/typebot.io/commit/4599862a4161c4f0cfd4127b2066633f4d3db2d2)]
- 📝 Improve docker-compose examples ([#2004](https://github.com/baptisteArno/typebot.io/issues/2004)) [[2f57984](https://github.com/baptisteArno/typebot.io/commit/2f5798402a0e7048e37b6a0c7b04f1b1e5f5e599)]
- 📝 Add command event page [[dcc716c](https://github.com/baptisteArno/typebot.io/commit/dcc716cf4d814fbad779ebbf67d4d4dea7a29b6e)]
- 📝 Add troobleshooting section on portainer network issues ([#2025](https://github.com/baptisteArno/typebot.io/issues/2025)) [[7f3118e](https://github.com/baptisteArno/typebot.io/commit/7f3118e5c760c0b6b5706c66cec9cd64050359a7)]
- 📝 Add developer hiring paragraph to Shopify ai chatbot article [[10a337a](https://github.com/baptisteArno/typebot.io/commit/10a337a8ebb5d64c3d74ab16f9f15ba311eb94ea)]
- 📝 Add inapp group titles video [[e565c17](https://github.com/baptisteArno/typebot.io/commit/e565c1762fbaa7ec65b5b279dfcd21a4f44cc9f9)]

### Internal

- 🔥 Remove workspaceId optionnality in chat session state [[8d86535](https://github.com/baptisteArno/typebot.io/commit/8d86535e424bebe45791cc85beea63817c468c7c)]
- 🔧 Ignore Googlebot errors in Sentry [[7c04667](https://github.com/baptisteArno/typebot.io/commit/7c046679026eaa12ceb37a586a1ca5bb36971ca4)]
- 🔒 (typebotLink) Make sure fetched linked bot has matching workspaceId [[1b281c6](https://github.com/baptisteArno/typebot.io/commit/1b281c6b542b18af6f52da008b3f9e6903905377)]
- ♻️ Lift right side bar state to the URL [[07e1eb4](https://github.com/baptisteArno/typebot.io/commit/07e1eb41c3551a4fc7a751edd3c336569bdbe57f)]
- 🔧 Add Sentry typebotId tagging in chat API [[61e401c](https://github.com/baptisteArno/typebot.io/commit/61e401cedc5d06655a7b623270300926f911953c)]
- 🔒 Respond 404 for suspended bots [[748252b](https://github.com/baptisteArno/typebot.io/commit/748252b19e5e36abc0f440f113e83a282ac615b8)]
- ♻️ Upgrade next-auth and clean up config [[ce3c3ae](https://github.com/baptisteArno/typebot.io/commit/ce3c3aeae69afc6657b323aeea4b31a4d9b5b6e8)]
- 🔧 Filter out more known errors/message from Sentry [[fcef3da](https://github.com/baptisteArno/typebot.io/commit/fcef3da4422bfae8575e2bbcf74470ed27b8c847)]
- 🔧 Standardize error handling across AI and forge blocks [[d8a08c8](https://github.com/baptisteArno/typebot.io/commit/d8a08c89e5c5164e80988931dc8df35575f37700)]
- 🔧 Fix WhatsApp reaction message schema [[0b20650](https://github.com/baptisteArno/typebot.io/commit/0b20650639b4eb6d2a94ed9b04baf57cecc29f40)]
- 🔧 Improve Sentry error filtering with case-insensitive matching [[74c69d9](https://github.com/baptisteArno/typebot.io/commit/74c69d966053d23f8267cfa14a4da4c202653f3e)]
- ♻️ Rename LogError to ClientToastError [[c33ba97](https://github.com/baptisteArno/typebot.io/commit/c33ba97b360444bdd331a2186986a0bbd0930045)]
- 🔧 Refine WhatsApp error logging and Sentry reporting [[fd9e0c9](https://github.com/baptisteArno/typebot.io/commit/fd9e0c997e46fabffd620791751554aba131ae51)]
- 🔧 Enhance WhatsApp error handling and Sentry integration [[1f3ee6a](https://github.com/baptisteArno/typebot.io/commit/1f3ee6ac58777f1c5468b15b571eb79540738f00)]
- 🔧 Improve Sentry error filtering for tRPC messages [[96eee2d](https://github.com/baptisteArno/typebot.io/commit/96eee2d9f7735e07780cacad7f1898af99bf8fbe)]
- 🔧 Improve Sentry error management [[31bc698](https://github.com/baptisteArno/typebot.io/commit/31bc698f5ff79cc33bca3b4451471cfd99cbc28d)]
- 🔧 Add Sentry ignore error messages [[57ef00c](https://github.com/baptisteArno/typebot.io/commit/57ef00c240d37d7ef356b01807812a9d84a78ba7)]
- 🔥 Remove new version popup and related version check [[11c1a32](https://github.com/baptisteArno/typebot.io/commit/11c1a326099fcda930a74308f5c997e3e7240dea)]
- ♻️ Add sendMessage utility for webhook notifications [[ce965e0](https://github.com/baptisteArno/typebot.io/commit/ce965e0a4d0a1c638170eb3c059a7be3ea122498)]

### Miscellaneous

-  👷 Attempt to fix hourly results report retry mechanism [[388ba31](https://github.com/baptisteArno/typebot.io/commit/388ba31e8e72dfe395e16713b7992b4becfef28a)]
- 🧑‍💻 Add configurable ToS URLs [[8ad53de](https://github.com/baptisteArno/typebot.io/commit/8ad53debef16c49067528ac668468b4df80ea56e)]
-  👷 Add PostHog environment variables to daily workflow [[d9e23c1](https://github.com/baptisteArno/typebot.io/commit/d9e23c1d1b2964a87bb206454e8548f412c5dea7)]
-  👷 Improve hourly results tracking and error handling [[6e889ec](https://github.com/baptisteArno/typebot.io/commit/6e889ec14c43858fb438003dd63c12f75960a469)]
-  👷 Enable daily results tracking and reporting [[10b466b](https://github.com/baptisteArno/typebot.io/commit/10b466b4da4286b664b2313c8704038a49c3a864)]
-  👷 Auto retry hourly cron on failure [[1f3afb5](https://github.com/baptisteArno/typebot.io/commit/1f3afb5460598c9001c56654e60f34bbb6fb995e)]
-  👷 Renovate cron jobs [[b406f6c](https://github.com/baptisteArno/typebot.io/commit/b406f6c620d48a2fec445e50cfc465fa10732182)]
- 🥅 Catch sheet permission error [[57adf62](https://github.com/baptisteArno/typebot.io/commit/57adf620c1498e418e0b12ef31eb6fd8409c970b)]
- 🥅 Filter out ClientToastError from Sentry [[c99003c](https://github.com/baptisteArno/typebot.io/commit/c99003cccab517557330ee30cfd98c924c6dcea5)]
-  Add Command event ([#2017](https://github.com/baptisteArno/typebot.io/issues/2017)) [[c93b4f4](https://github.com/baptisteArno/typebot.io/commit/c93b4f4ce7ef608bf2e4e3d464b92264ec59d40a)]
- 🧑‍💻 Option to disable email rejection on registration [[2f2064c](https://github.com/baptisteArno/typebot.io/commit/2f2064cb684c5826d398c31e70bd17d72475fe6d)]


<a name="3.4.2"></a>
## 3.4.2 (2025-02-05)

### Fixed

- 🚑 Fix forge block select fetch not working [[9918201](https://github.com/baptisteArno/typebot.io/commit/9918201d66151ab768a6fbd37ac491353fe57697)]

### Content

- 📝 Add credentials documentation [[c0954da](https://github.com/baptisteArno/typebot.io/commit/c0954dad34925c39951ed87254102a9445cfd809)]
- 📝 Add delete account documentation [[ab556cd](https://github.com/baptisteArno/typebot.io/commit/ab556cd7af37873975f7a702f4fdc8f323dee8ba)]


<a name="3.4.1"></a>
## 3.4.1 (2025-02-04)

### Fixed

- 🐛 (anthropic) Fix ignored system message [[322bd07](https://github.com/baptisteArno/typebot.io/commit/322bd07f9e7362276e85aa855716b07a81cdeacd)]


<a name="3.4.0"></a>
## 3.4.0 (2025-02-04)

### New features

- ✨ Add custom model and prompt for group title gen [[547fa92](https://github.com/baptisteArno/typebot.io/commit/547fa92e79b708afcc1db777254549164d5e7cb7)]
- ✨ Add error variable saving for Set Variable block with code expression [[8061585](https://github.com/baptisteArno/typebot.io/commit/806158541fbea22070aa30fa6b42a1498516aefd)]
- ✨ Add buttons input layout customization option [[5198800](https://github.com/baptisteArno/typebot.io/commit/5198800c8589d4910b2f4007bf2102d90407405a)]
- ✨ Add option to customize system messages [[789b38e](https://github.com/baptisteArno/typebot.io/commit/789b38ea3f510ccdf216011eda679389117ced16)]
- ✨ Add &quot;Additional Instructions&quot; field to &quot;Ask assistant&quot; action [[14581e3](https://github.com/baptisteArno/typebot.io/commit/14581e3ec2649f6700c303405bf0b99f4ddde2df)]
- ✨ Add WhatsApp Referral predefined values in Set variable block [[4e075af](https://github.com/baptisteArno/typebot.io/commit/4e075af50d134ed8dda2727ed60ca7fc204105c2)]
- ✨ Add Time input block ([#1978](https://github.com/baptisteArno/typebot.io/issues/1978)) [[b565a63](https://github.com/baptisteArno/typebot.io/commit/b565a63bf31f948ffb84f594c40083161cada25f)]
- ✨ Add PostHog block ([#1960](https://github.com/baptisteArno/typebot.io/issues/1960)) [[6430563](https://github.com/baptisteArno/typebot.io/commit/643056305408999d80310b8dfdcadba7fab34b07)]
- ✨ Add group title AI generation option ([#1864](https://github.com/baptisteArno/typebot.io/issues/1864)) [[9edcbbd](https://github.com/baptisteArno/typebot.io/commit/9edcbbd1accf356ff750e8cb69b53ee3d7514555)]

### UI/UX Improvements

- 🚸 Move group title generation feature to user preferences [[24ac865](https://github.com/baptisteArno/typebot.io/commit/24ac865f177b161652eb2238e161f023da8bec67)]
- 💄 Improve variable label tag text wrapping [[6c6b5b8](https://github.com/baptisteArno/typebot.io/commit/6c6b5b8a17223da3231beb962911c518a1f3679c)]
- 🚸 Add select all keyboard shortcut for groups [[51fbb26](https://github.com/baptisteArno/typebot.io/commit/51fbb267770770ccecfeed4618484a736f83503a)]
- 🚸 Add backspace shortcut to delete edge [[30a045e](https://github.com/baptisteArno/typebot.io/commit/30a045ef2a4f377bb82cd360ef5c9e15157941b9)]
- 💄 Improve variable creation look in side bar [[0f3fc62](https://github.com/baptisteArno/typebot.io/commit/0f3fc62fa55e1218382caf7c8545c3ecfa6870e7)]
- 💄 Update variables button icon [[857beeb](https://github.com/baptisteArno/typebot.io/commit/857beeb9caf29b51cf494a7cdcc68ffaf7e08c95)]
- 🚸 Save sidebar locked state in local storage ([#1956](https://github.com/baptisteArno/typebot.io/issues/1956)) [[d4d922d](https://github.com/baptisteArno/typebot.io/commit/d4d922dbf0e9badbd58f6e8e8436fcecfa0bf1eb)]
- 🚸 (builder) prevent auto opening block settings for buttons types [[5ceaa96](https://github.com/baptisteArno/typebot.io/commit/5ceaa961a1eade131e29b3563e99d2db9bedba78)]
- 🚸 (builder) improve buttons plus hitzone [[a0dca29](https://github.com/baptisteArno/typebot.io/commit/a0dca297fd6ab04207a379666a27d9a9da55b4b7)]
- 🚸 (builder) Increase max zoom out [[ee4fcfc](https://github.com/baptisteArno/typebot.io/commit/ee4fcfcc8142e14fdc163a81a5d0162fe91085c4)]
- 💄 (lp) Adjust main features video margin in mobile [[dfbbe50](https://github.com/baptisteArno/typebot.io/commit/dfbbe50362a0ae69b0d62230622a8e6b7878b0f3)]
- 💄 Update Made with Typebot logo [[ebda670](https://github.com/baptisteArno/typebot.io/commit/ebda670e36e56b359e8f3cde38328b9597f610a6)]
- 💄 Update Typebot logo in unauthenticated header [[2810617](https://github.com/baptisteArno/typebot.io/commit/28106177dc630229512536fce234af597abd2845)]
- 💄 Adjust font weight for slate-bold class [[7ffd918](https://github.com/baptisteArno/typebot.io/commit/7ffd9187f6111911776acc5e69fb015d52f668d9)]
- 💄 fix main features video glitch on change [[3cef322](https://github.com/baptisteArno/typebot.io/commit/3cef322aa5c6fad239012f58b96e7c4d0adadbcc)]
- 💄 fix custom bubble button image roundeness [[d7e505c](https://github.com/baptisteArno/typebot.io/commit/d7e505c26db4cc9ca98e73afebb3c1fd2e225baa)]
- ⚡ (buttons) Add option to hide searchable buttons initially ([#1927](https://github.com/baptisteArno/typebot.io/issues/1927)) [[47d6f98](https://github.com/baptisteArno/typebot.io/commit/47d6f98d27e40a431ff85d3e5221198f2821bd46)]
- ⚡ (wp) compute excluded path on server side [[56a4d5e](https://github.com/baptisteArno/typebot.io/commit/56a4d5ef52cde4cc68fbe0a972b283826dc87406)]

### Fixed

- 💚 Update release workflow to support multi-arch Docker builds [[e378996](https://github.com/baptisteArno/typebot.io/commit/e378996b7152f96f5840d43aeb1ae1d548323a60)]
- 💚 Add dom lib to js embed tsconfig [[4770ab9](https://github.com/baptisteArno/typebot.io/commit/4770ab9ddd7ab0f48c30514c0d953556ebcbf36e)]
- 💚 Add missing packages and clean up unused packages [[27366dd](https://github.com/baptisteArno/typebot.io/commit/27366dde5a9e597d0f49c7fcf359d3a560f4dc7d)]
- 💚 Update actions/checkout to v4 [[043e80c](https://github.com/baptisteArno/typebot.io/commit/043e80cdd2fe6f69039af6ddc95e050e2217d015)]
- 🐛 Fix markdown list items no new line on WhatsApp messages [[8762da8](https://github.com/baptisteArno/typebot.io/commit/8762da8292a9de25111669542b78c2c3e1a63019)]
- 🐛 Fix some template preview errors [[b1aa946](https://github.com/baptisteArno/typebot.io/commit/b1aa9460f5872a3e5b734a9620cf6c3f4a76b724)]
- 💚 Fix SetVariableContent expression [[d48e436](https://github.com/baptisteArno/typebot.io/commit/d48e436e9a07ca6c154876663f0ad52f73ac3e18)]
- 🐛 Fix default initial display on searchable buttons [[893c684](https://github.com/baptisteArno/typebot.io/commit/893c68472f4d589306bd1ac2bb085079117e9762)]
- 🚑 Fix backspace on bot preview not working [[8df643e](https://github.com/baptisteArno/typebot.io/commit/8df643e6aad45793229cdc36adfe40b7d2735446)]
- 🐛 Fix auto gen groups not instantly updating [[d23658d](https://github.com/baptisteArno/typebot.io/commit/d23658d1d64cd4faf99d7e656e5b8f44f181cab0)]
- 💚 fix incompatible ts package error [[57f7228](https://github.com/baptisteArno/typebot.io/commit/57f7228c0f39ca7b78d26480e01eed63f771b59f)]
- ✏️ Fix intro doc typos ([#1971](https://github.com/baptisteArno/typebot.io/issues/1971)) [[e6579d2](https://github.com/baptisteArno/typebot.io/commit/e6579d2a1c588bb57df155fe4804ef6d6bf67b60)]
- 🐛 isolate z-index on department card to avoid overlapping with header [[33e8bf1](https://github.com/baptisteArno/typebot.io/commit/33e8bf129712a181844bb9cb1ada2e3b0b578f59)]
- 🚑 fix spreadsheet oauth connection [[f2842fb](https://github.com/baptisteArno/typebot.io/commit/f2842fb24f8a34b09ab8f5ddf57164843deae915)]
- 🚑 fix lib URL extension in WP embed [[54bf16c](https://github.com/baptisteArno/typebot.io/commit/54bf16c66e9ea7dfe4a94c21a0a4a41e517a8ab1)]

### Internal

- 🔧 Add author metadata in blog posts [[db6d908](https://github.com/baptisteArno/typebot.io/commit/db6d908cf49beb986c621eb24b199d28a5c6046c)]
- ♻️ Rename &quot;account&quot; feature folder to &quot;user&quot; [[2d00c10](https://github.com/baptisteArno/typebot.io/commit/2d00c109a9352c2d2d155d741b19e842e9610b44)]
- ♻️ Upgrade ai SDK and refacto shared functions [[b4901fa](https://github.com/baptisteArno/typebot.io/commit/b4901fa04ab4e027084c8aa2f3d93b555507ccaa)]
- 🔥 Remove unused theme file [[47a799d](https://github.com/baptisteArno/typebot.io/commit/47a799d4f49315dbd3ca2c60a3cc4ea3332cdb7b)]
- 🔧 Remove remaining references fields in tsconfigs [[6f97fcb](https://github.com/baptisteArno/typebot.io/commit/6f97fcb3573507b255c50487a0ec19afc24f2694)]
- 🔧 Add DATABASE_URL_READ_REPLICA env to turbo.json [[9afb7aa](https://github.com/baptisteArno/typebot.io/commit/9afb7aa6ec45736d1f10b937aecb9d386120617e)]
- 🔧 Add rewrite for _server landing page path [[31a842c](https://github.com/baptisteArno/typebot.io/commit/31a842c60d702e9f1939c73e02acf804f67fcf11)]
- 🔧 Add DATABASE_URL_REPLICA env to github workflows [[5c420fb](https://github.com/baptisteArno/typebot.io/commit/5c420fb806897ada6984d88a2a89ed342e4e9280)]
- 🗃️ Add chatsHardLimit workspace field [[21f55dc](https://github.com/baptisteArno/typebot.io/commit/21f55dc429cd236de0dc907b70ac8ac56856b866)]
- ♻️ (wordpress) Refactor modal instructions to use 0.3 library version and update plugin metadata to v4.0.2 [[542c43d](https://github.com/baptisteArno/typebot.io/commit/542c43d37eb32fda11d356010b80bed62b7df5e8)]

### Miscellaneous

-  Revert &quot;build: add ts references for better DX&quot; [[aae6caa](https://github.com/baptisteArno/typebot.io/commit/aae6caaa0a0651653856d3ff36a9c6a632ac71f1)]
-  feat: add workspaceId in session state for credentialsId check [[0acb655](https://github.com/baptisteArno/typebot.io/commit/0acb655f33f917f3999c346ef97eeaab86e21c22)]
-  refactor: centralize credentials in credentials package [[61615d8](https://github.com/baptisteArno/typebot.io/commit/61615d8bd6700c5090e61e9d548be26277cd23c8)]
-  refactor: add chat-session package and migrate related files from bot-engine [[846b8bc](https://github.com/baptisteArno/typebot.io/commit/846b8bcc0b3a4bd8956cf4f46717ce176159f442)]
-  refactor: move computeTypingDuration to settings package [[7bbb7fb](https://github.com/baptisteArno/typebot.io/commit/7bbb7fb6616f21e11f49cc664d6812e54f2902b9)]
-  refactor: move encryption functions to credentials package [[d97913a](https://github.com/baptisteArno/typebot.io/commit/d97913ac15ab78063ef687f32d3ca6471dec132b)]
-  build: add ts references for better DX [[b8ffad0](https://github.com/baptisteArno/typebot.io/commit/b8ffad015992b7a4ab7c935b23f407941ce22774)]
-  build: upgrade root packages [[1bfaf08](https://github.com/baptisteArno/typebot.io/commit/1bfaf08e4eae6103822b879e2da3d4bbeb306d74)]
-  fix: make autoplay work for embed videos [[3aee7bd](https://github.com/baptisteArno/typebot.io/commit/3aee7bd59e7b85f94c5e89876cecc635562db465)]
-  fix: adjust max height and width for SVG images [[42d8208](https://github.com/baptisteArno/typebot.io/commit/42d8208082858153d093e1ea9db8d7e44c024412)]
-  docs: fix forged block docs URLs [[cd593c2](https://github.com/baptisteArno/typebot.io/commit/cd593c2da9475c263b3079b99b7df8b0977d9335)]
-  fix(bot-engine): reduce variable value to empty array when shifting or popping a string [[cccd8a9](https://github.com/baptisteArno/typebot.io/commit/cccd8a92099f9083ab8982917ba23c9a8bbd079e)]
-  fix(builder): end edge total visit compute if group has an input block [[c531846](https://github.com/baptisteArno/typebot.io/commit/c531846b5691f05d59013238ecd04b28e480868a)]
-  fix(builder): reflect default border thickness and color to bubbles theme settings [[58eafb7](https://github.com/baptisteArno/typebot.io/commit/58eafb791806ec667bd1ac1671dfa8e84c5b23a1)]
-  fix(builder): update typebot window tag name to TYPEBOT-BUBBLE [[c748b7e](https://github.com/baptisteArno/typebot.io/commit/c748b7eb82b54b1bafc5bf1ec741233cf7571cb4)]
-  feat: only log function execution error in dev [[321d56c](https://github.com/baptisteArno/typebot.io/commit/321d56c1cf34c720b2e1591396d636f7e8a8658a)]
-  chore: update openapi schemas [[3a78b80](https://github.com/baptisteArno/typebot.io/commit/3a78b80962d85b8693adc941b94e241ea35fc349)]
-  feat(builder): add current workspace in dropdown [[5e2982b](https://github.com/baptisteArno/typebot.io/commit/5e2982bc27714d27912ee43d89f11a73a79b60f2)]
-  fix(builder): replace noOfLines with isTruncated on workspace dropdown [[949ae9e](https://github.com/baptisteArno/typebot.io/commit/949ae9e083d6cd4cbf4754dc94285fb1951c991d)]
-  style(builder): use break-all word break on variable tags [[7f29c58](https://github.com/baptisteArno/typebot.io/commit/7f29c5822cc4e627bb7f8895d34720b825f2c413)]
-  ops: update docker image to use Node 22 and Bun 1.1.42 [[5b9b726](https://github.com/baptisteArno/typebot.io/commit/5b9b72605d76ef4f51212704bb204dc7836c0628)]
-  style(builder): update new version popup colors [[3ef488d](https://github.com/baptisteArno/typebot.io/commit/3ef488dd773579070a60491466e0a8288f0475f9)]
-  fix(landing-page): remove duplicate padding in pricing page [[1ef7754](https://github.com/baptisteArno/typebot.io/commit/1ef77541fcd8257fa2e3bf85d8399b4bdfd4b2f8)]
-  fix(landing-page): adjust marquee gap and animation duration [[fcbfbb0](https://github.com/baptisteArno/typebot.io/commit/fcbfbb08b8d25fc8ece2808dd850897351a7326a)]
-  fix(landing-page): hide desktop header when scrolling back up [[db8dcf9](https://github.com/baptisteArno/typebot.io/commit/db8dcf90520a72037626d94f8591d05231e74d37)]
-  style: update favicon [[233e846](https://github.com/baptisteArno/typebot.io/commit/233e846ba4aea3fd2e7e7945169c3fa157ba91d9)]
-  fix(landing-page): prevent scroll reset when closing mobile header and tiers modal [[22f9a5c](https://github.com/baptisteArno/typebot.io/commit/22f9a5cefa6fe20952c5779bfea20f80389bf770)]
-  refactor(landing-page): simplify header intersection observer logic [[158a2f7](https://github.com/baptisteArno/typebot.io/commit/158a2f7b1144154cc77fc075d21fc5e196dddb1a)]
-  chore: update packages [[351d5d0](https://github.com/baptisteArno/typebot.io/commit/351d5d0e55a17b9f9a59a59bd93b8afdb3d24abb)]
-  style(landing-page): only enable hero animation when reduce motion is off [[8697057](https://github.com/baptisteArno/typebot.io/commit/86970576f1127231591b608152365ed80cf39438)]
-  ops(viewer): remove legacy rewrites [[6bbbceb](https://github.com/baptisteArno/typebot.io/commit/6bbbceb2f733a31deb279da6da6a97677daa9b7d)]
-  fix(landing-page): fetch ossFriends data in server fn [[16697b3](https://github.com/baptisteArno/typebot.io/commit/16697b3ce1a5b2c5386bb7c79a328045bc975d74)]
-  docs(landing-page): update copyright year from 2024 to 2025 [[677807c](https://github.com/baptisteArno/typebot.io/commit/677807cc4c20cf3d19aa31bf30ba6edea953ce12)]
-  style(landing-page): adjust margin and size for feature video container [[717b036](https://github.com/baptisteArno/typebot.io/commit/717b03632d6ba544c069b415d63c9517e2cd3b18)]
-  style(landing-page): typo in perk item [[3065f85](https://github.com/baptisteArno/typebot.io/commit/3065f858a8ec1764d6b80206f2669aeacbde0378)]
-  style: update fav icons [[a14fd6f](https://github.com/baptisteArno/typebot.io/commit/a14fd6fd73ca4125700004fed254a92059ee6588)]
-  fix(landing-page): add link to sign up buttons [[a0e6190](https://github.com/baptisteArno/typebot.io/commit/a0e61902484c5a2bb960521f24fbf2a18922e78e)]
-  fix(docs): update font URLs in mint.json to point to the new location [[32e0fef](https://github.com/baptisteArno/typebot.io/commit/32e0fef1215cf22e21b947b89a45a2af26731b15)]
-  style(landing-page): add border to bubble window [[d68ce56](https://github.com/baptisteArno/typebot.io/commit/d68ce5605532438a785894aae0557649315494e9)]
-  docs: update README banner [[f2836e9](https://github.com/baptisteArno/typebot.io/commit/f2836e91b1e677e31235231fa1b34c369ccb4279)]
-  fix(landing-page): remove aspect-ration prop on main features video [[c3dbc3e](https://github.com/baptisteArno/typebot.io/commit/c3dbc3e4c899986bcd41bdc18a9c57a0df1c40ff)]
-  style(landing-page): give all feature cards the same height [[69e27d2](https://github.com/baptisteArno/typebot.io/commit/69e27d25d5d8dce605380e9849be50a0ca55a7d9)]
-  fix(landing-page): update mobile header height calculation to use 100dvh [[dec202e](https://github.com/baptisteArno/typebot.io/commit/dec202efc2534b2fd2da284beb66909ad177c52d)]
-  style(landing-page): text links underline only on hover [[5c3f405](https://github.com/baptisteArno/typebot.io/commit/5c3f40579ea3b8d877ddabff183365425cc9089a)]
-  style(landing-page): simplify product principles heading [[0b4e6f4](https://github.com/baptisteArno/typebot.io/commit/0b4e6f45b2873051fdfbdc017f865f4c805958aa)]
-  style(landing-page): change made for devs labels so that they have the same length [[27a6aa8](https://github.com/baptisteArno/typebot.io/commit/27a6aa83d29b64df12a8bf5c4398a9962e956913)]
-  fix: simplify viewer rewrites for landing page [[fe7d315](https://github.com/baptisteArno/typebot.io/commit/fe7d31513b6eb902788ab06448e668c4e2ebe30d)]
-  feat: integrate new brand ([#1935](https://github.com/baptisteArno/typebot.io/issues/1935)) [[06e6faa](https://github.com/baptisteArno/typebot.io/commit/06e6faa9d5046ba71967a15442a0be1efa1ba4a4)]
-  docs: fix typos in create-block.mdx ([#1967](https://github.com/baptisteArno/typebot.io/issues/1967)) [[2541a13](https://github.com/baptisteArno/typebot.io/commit/2541a1308fd1b380cdf998aa9cbbebcead1956b5)]


<a name="3.3.0"></a>
## 3.3.0 (2025-01-06)

### UI/UX Improvements

- ⚡ (conditions) Add &gt;&#x3D; and &lt;&#x3D; comparison operators ([#1938](https://github.com/baptisteArno/typebot.io/issues/1938)) [[b2865c6](https://github.com/baptisteArno/typebot.io/commit/b2865c61527f5e10671d1a213e14b2cfa4ed5548)]
- ⚡ (buttons) filter unique items from dynamic buttons variable ([#1926](https://github.com/baptisteArno/typebot.io/issues/1926)) [[b409c96](https://github.com/baptisteArno/typebot.io/commit/b409c962bed419b2c4784696879acde086aeaf4d)]
- ⚡ Add Pi theme in gallery [[8518a52](https://github.com/baptisteArno/typebot.io/commit/8518a527871836eedec66679873ed0896d6e159e)]
- 🚸 (setVariable) Add timezones select input ([#1925](https://github.com/baptisteArno/typebot.io/issues/1925)) [[d714e31](https://github.com/baptisteArno/typebot.io/commit/d714e316c24e88e7fbf1cb4b1b91815faf6710f5)]

### Fixed

- 🐛 (webhook) Fix condition to check for parsed webhook data [[7c0d349](https://github.com/baptisteArno/typebot.io/commit/7c0d3496aace442e0dc1868b4926deada5b48e72)]
- 🐛 (webhook) Accept empty body webhook block request [[03e881b](https://github.com/baptisteArno/typebot.io/commit/03e881b593e51d7ba51cf14674753579d167c9b1)]
- 🐛 Improve remember state recovery and fix potential stuck state [[2875b1b](https://github.com/baptisteArno/typebot.io/commit/2875b1bc72b0e6af939d4020fa99ab3faf69d194)]
- 🐛 Release isolate&#x27;s context on each function execution to avoid memory limit error [[460883c](https://github.com/baptisteArno/typebot.io/commit/460883cb6bc90b40f477ff10b436a4f77f2a611a)]
- 🐛 Make BottomSpacer height&#x27;s dynamic to fix auto scroll with small containers [[11503dc](https://github.com/baptisteArno/typebot.io/commit/11503dc3e6b914ca7dbf00b57c057778c0a0ec4b)]
- 🚑 Check if state has currentBlockId defined before autocontinuing [[4d7423e](https://github.com/baptisteArno/typebot.io/commit/4d7423ed3aa2bb163d0249430f817346e7fc3da5)]
- 🐛 Refacto autoStart logic and use it also if session was only registered [[5a82ee4](https://github.com/baptisteArno/typebot.io/commit/5a82ee46d0a6b690f4f5dad96340866635abec0e)]
- 🐛 Fix drop off rates especially with buttons inputs [[247d805](https://github.com/baptisteArno/typebot.io/commit/247d805d24ac357e37b7bbb13122424271a8f4bb)]
- 🐛 adjust BlockCardLayout min height to avoid layout shift [[417f33b](https://github.com/baptisteArno/typebot.io/commit/417f33bc5da141de9a4f33a98970d8fcfb01c003)]
- 🐛 Fix invalid findResult return type causing crash when existingResults was archived [[23578ec](https://github.com/baptisteArno/typebot.io/commit/23578ec784923a3b9a6649a4d832c49d547c052f)]

### Content

- 📝 Add &quot;marketing automation&quot; blog post ([#1924](https://github.com/baptisteArno/typebot.io/issues/1924)) [[aba3496](https://github.com/baptisteArno/typebot.io/commit/aba34964dbb6e9a4323eba1b7eeb962117540dd8)]
- 📝 Clarify urgent support request criteria [[16501cc](https://github.com/baptisteArno/typebot.io/commit/16501cc57c46d0803de088fbc345a54f4344bb21)]
- 📝 Add &#x27;Ai chabot for hotels&#x27; blog post ([#1915](https://github.com/baptisteArno/typebot.io/issues/1915)) [[1bfcbf4](https://github.com/baptisteArno/typebot.io/commit/1bfcbf498142b144505528dfa6e8ee324df6570e)]
- 📝 Add deployment doc for Alibaba Cloud ([#1901](https://github.com/baptisteArno/typebot.io/issues/1901)) [[ab78f4a](https://github.com/baptisteArno/typebot.io/commit/ab78f4ad3cab3099ab7369f02af794a30ae1373f)]

### Internal

- ♻️ Add distinctId to groupIdentify methods [[5233c79](https://github.com/baptisteArno/typebot.io/commit/5233c794e0bc88d6594c5f6a28751a8ea0160702)]
- ♻️ Include autoContinueChat function in startBotFlow [[16b7776](https://github.com/baptisteArno/typebot.io/commit/16b7776283c4d05a5dc52cb3a5920ca9c9de0906)]

### Miscellaneous

- 🧑‍💻 Add ignoreTLS option to SMTP configuration ([#1943](https://github.com/baptisteArno/typebot.io/issues/1943)) [[ec7b221](https://github.com/baptisteArno/typebot.io/commit/ec7b2215f9fc391a9420c025da714f8325b2f314)]
- 🛂 Add &#x60;accessRight&#x60; prop in listTypebots endpoint response [[5a770d3](https://github.com/baptisteArno/typebot.io/commit/5a770d30f201ab689cb43318f4363e94a419bb6f)]


<a name="3.2.0"></a>
## 3.2.0 (2024-12-06)

### UI/UX Improvements

- ⚡ Store existing isolated in global and reuse it ([#1914](https://github.com/baptisteArno/typebot.io/issues/1914)) [[9d62d9d](https://github.com/baptisteArno/typebot.io/commit/9d62d9dbe0be28a5c2b825a261e9bb445ba6fd5a)]
- ⚡ Add optionnal &#x27;id&#x27; argument to target specific instances in embed commands [[1a1aa3c](https://github.com/baptisteArno/typebot.io/commit/1a1aa3c8249acfa76d6b15bd5c7f55498b1e65b6)]

### Fixed

- 🐛 Add explicit react import in emails package to avoid not found bug in CI [[1d6eca4](https://github.com/baptisteArno/typebot.io/commit/1d6eca4c0c448e59e269f15a925e2b0ec7323585)]
- 🐛 Attempt to fix &quot;react not found&quot; in ci script [[c19d208](https://github.com/baptisteArno/typebot.io/commit/c19d208f54f1c50b7f4c99a2bc8c1590f20dede0)]
- 🐛 Rename updateTypebot script function to updateWorkspace [[ecb1056](https://github.com/baptisteArno/typebot.io/commit/ecb1056efa809c2ade20375ba5fbea7973b242ca)]
- 🚑 Fix retro compat and introduce new generateUpload route version [[c6b09f6](https://github.com/baptisteArno/typebot.io/commit/c6b09f68440018d238372b578a4cfc83dd3fff86)]
- 🐛 Add blockId prop for file upload to ensure unique URLs [[d6dc242](https://github.com/baptisteArno/typebot.io/commit/d6dc242906fee20d178fea5470af1393c21207ea)]
- 🐛 (phoneInput) Fix phone country prefix not changing when already set ([#1895](https://github.com/baptisteArno/typebot.io/issues/1895)) [[676fe94](https://github.com/baptisteArno/typebot.io/commit/676fe940b6a9ed81cd8a93aa3426b4bc3d5852b9)]
- 🐛 (difyAi) Remove timeout in createChatMessage requests [[f8642ec](https://github.com/baptisteArno/typebot.io/commit/f8642ec9f38a1e89490ea984cf65f0f662677c4c)]

### Content

- 📝 Add &#x27;Meta Workplace Alternatives&#x27; blog post ([#1908](https://github.com/baptisteArno/typebot.io/issues/1908)) [[9114ee4](https://github.com/baptisteArno/typebot.io/commit/9114ee465c5d85fee1796016ad770a192e8e6f3a)]
- 📝 Add &#x27;best no code website builder&#x27; blog post ([#1904](https://github.com/baptisteArno/typebot.io/issues/1904)) [[42a1669](https://github.com/baptisteArno/typebot.io/commit/42a1669c834410758c83cd1dce057f7e3689805e)]

### Internal

- 🔥 (fileInput) simplify duplicate names logic [[9d7651d](https://github.com/baptisteArno/typebot.io/commit/9d7651dea391714babbdbc4283b48798d1c0448e)]
- ♻️ (paymentInput) Use stripe-js/pure to lazy load Stripe [[4dc636d](https://github.com/baptisteArno/typebot.io/commit/4dc636dcc529a951274f231a5028f4ab08de6412)]

### Miscellaneous

- 🛂 Only send limit reached email warning to Free workspaces [[8779982](https://github.com/baptisteArno/typebot.io/commit/8779982647d1930b7835ecbc7ff4a80ace24dfee)]
- 📦 Add react dependency scripts package json [[8c5e612](https://github.com/baptisteArno/typebot.io/commit/8c5e6123e84bfdb3bd7bd5d8d53675c633d083c9)]


<a name="3.1.2"></a>
## 3.1.2 (2024-11-23)

### UI/UX Improvements

- ⚡ Remove currency parameter from billing API [[6088a56](https://github.com/baptisteArno/typebot.io/commit/6088a56d3160003d1271780a30c8f622d4d986cb)]
- 🚸 Add currency selection in precheckout form [[05cc23e](https://github.com/baptisteArno/typebot.io/commit/05cc23efb1cf0a9549a5c73dad2529e48bd7a264)]
- ⚡ Change setVariable to accept a list of variables [[28ebb37](https://github.com/baptisteArno/typebot.io/commit/28ebb374f69291d4706fd003d6a8825298194c47)]

### Fixed

- 🚑 (whatsapp) Rename &#x27;origin&#x27; parameter to &#x27;callFrom&#x27; in webhook handlers and related functions [[4089831](https://github.com/baptisteArno/typebot.io/commit/4089831df038632b4a7e2774ac49b857c47003b7)]
- 🐛 Update UploadButton to use unique IDs for file input elements [[4a4e198](https://github.com/baptisteArno/typebot.io/commit/4a4e1982a713074c9c519fbb113400af09441a95)]
- 🐛 Add onPreviewMessageDismissed prop to Bubble component [[8016085](https://github.com/baptisteArno/typebot.io/commit/8016085a5a875493452c022110932d796ae270fe)]
- 🐛 (fileUpload) De-duplicate file names in multi upload [[5546d11](https://github.com/baptisteArno/typebot.io/commit/5546d112b35cf094b8817ba68de56e4aa208e6a3)]
- 🐛 Fix markdown escaping for markdown API response format [[0029f67](https://github.com/baptisteArno/typebot.io/commit/0029f67c20743164ca58c6203b5210cb332d68e5)]

### Content

- 📝 Add &quot;livechat vs chatbot&quot; blog post ([#1882](https://github.com/baptisteArno/typebot.io/issues/1882)) [[13551a3](https://github.com/baptisteArno/typebot.io/commit/13551a3385a90878342ce91f3de3d3011451f0d8)]
- 📝 Add CHAT_API_TIMEOUT parameter to configuration documentation [[ca1fb59](https://github.com/baptisteArno/typebot.io/commit/ca1fb59e2cfa841d08059bd3644dd35494c8bbe9)]
- 📝 Update set variable documentation to include Pop/Shift operations [[badad22](https://github.com/baptisteArno/typebot.io/commit/badad223f105b01bf4225db3dc12188a88074816)]


<a name="3.1.1"></a>
## 3.1.1 (2024-11-10)

### UI/UX Improvements

- 🚸 (openai) Refine model filtering to exclude audio and realtime models [[d092d13](https://github.com/baptisteArno/typebot.io/commit/d092d1310f9d3d8cc8c379485885305f76764f98)]
- ⚡ (anthropic) Add Claude 3.5 Haiku model [[d4c94ba](https://github.com/baptisteArno/typebot.io/commit/d4c94bafc18b02b5f2d8634a0c907afc96ff5499)]

### Fixed

- 🚑 Introduce global state management for email sending limits [[933a417](https://github.com/baptisteArno/typebot.io/commit/933a4173995d361cfec12eabe8fdb1d6c774dd1a)]
- 🐛 Update generateVariable extraction to use nullish instead of optional to not throw on null values [[345bfac](https://github.com/baptisteArno/typebot.io/commit/345bfac51993071257f7905d31eff55ca612396d)]

### Content

- 📝 Remove NEXTAUTH_URL_INTERNAL parameter from self-hosting configuration documentation [[b32ecb1](https://github.com/baptisteArno/typebot.io/commit/b32ecb1dd01b9e6c14a59557ad36227c9980ab6c)]

### Miscellaneous

-  👷 Use faster arm GH action vcp [[69bfa6c](https://github.com/baptisteArno/typebot.io/commit/69bfa6cc082f8ad44b36e947c68c4f5c20314dfb)]
- 🛂 (radar) Re-inforce scam keywords detection by parsing set variable blocks value [[a9b7441](https://github.com/baptisteArno/typebot.io/commit/a9b7441cadc18921fc2a2850a6dbcca0133a6398)]
- 🛂 Enable SEO for custom domains [[6b41dcc](https://github.com/baptisteArno/typebot.io/commit/6b41dcc6ff792ac7bc0c7b8781aaf026dadab3f0)]
- 🛂 Update chat and seat limit functions to prioritize custom limits [[954151e](https://github.com/baptisteArno/typebot.io/commit/954151e422fff25e5f251e4ab1efc25e87a48675)]


<a name="3.1.0"></a>
## 3.1.0 (2024-10-29)

### New features

- ✨ (lp) Update Tailwind CSS configuration to include blog feature files [[2834f2e](https://github.com/baptisteArno/typebot.io/commit/2834f2e85a3b10155974d278980b1b9fb27ee899)]
- ✨ Add script template that reads CSV file and process things [[5fb10d2](https://github.com/baptisteArno/typebot.io/commit/5fb10d2ffbecb1d4cbab64204d0cda8274e6a14f)]
- ✨ Add Webhook block ([#1815](https://github.com/baptisteArno/typebot.io/issues/1815)) [[59c0ea0](https://github.com/baptisteArno/typebot.io/commit/59c0ea03cfbf0d1cab0d21881206b3ee7534a98f)]

### UI/UX Improvements

- 🚸 Make sure bubble is closing when other chat widget opens up [[b31f305](https://github.com/baptisteArno/typebot.io/commit/b31f30528b3c263bec5a804c88c19b7e45821df4)]
- ⚡ Update session handling to continue bot flow when start message is present and no messages to display [[5ab08b5](https://github.com/baptisteArno/typebot.io/commit/5ab08b50fb72a3df0c655485085d36369d237ffd)]
- ⚡ (auth) Attempt to fix issue with link openers in corporate setups ([#1819](https://github.com/baptisteArno/typebot.io/issues/1819)) [[d3a8694](https://github.com/baptisteArno/typebot.io/commit/d3a869498eae47af2cefeac4e0d24dbf37337f52)]

### Fixed

- 🐛 Import open and close command from embed lib [[b734c60](https://github.com/baptisteArno/typebot.io/commit/b734c60287d31e530fbd3cb4b63240b476987c04)]
- 🐛 Fix issue in credentials modal to properly update value ([#1866](https://github.com/baptisteArno/typebot.io/issues/1866)) [[e642c0c](https://github.com/baptisteArno/typebot.io/commit/e642c0c3b8bfa8b9c89a562a7c356d607f108567)]
- 🐛 Remove unnecessary credentialsId check in sanitizeBlock function [[6a02942](https://github.com/baptisteArno/typebot.io/commit/6a029424ae5a0b09ae973087ad65f2c3c3192c60)]
- 🐛 Make onScriptExecutionSuccess work on script block [[96af708](https://github.com/baptisteArno/typebot.io/commit/96af708bc20e9c58ba386d298a14fe46319012bd)]
- 🐛 Fix validateNumber to correctly parse max option [[305e711](https://github.com/baptisteArno/typebot.io/commit/305e711c8f85243bf0aa3c4b433cd6efb7f0713b)]
- 🚑 Make executeFunction return any type of output to make it work with setVariable [[2d876ad](https://github.com/baptisteArno/typebot.io/commit/2d876ad16060fb85bb2d208f112e888614e3dee6)]
- 🚑 Fix set variable return injection for multi line statements [[caa397d](https://github.com/baptisteArno/typebot.io/commit/caa397d2553d8bd9fa5a0f36fe547f7782ddc5c4)]
- 🐛 Refactor getDeepKeys to improve key parsing logic [[4fdc80f](https://github.com/baptisteArno/typebot.io/commit/4fdc80f528ac725da189f197884e8583bbcde694)]
- 🐛 Fix credentials data not updated [[b3c43b1](https://github.com/baptisteArno/typebot.io/commit/b3c43b1551bb2af426d2322bd466d9a01337f023)]
- 🐛 Fix blog og image parsing [[37948b2](https://github.com/baptisteArno/typebot.io/commit/37948b2db0415ceaee75cf5a1aa65530de0852e4)]
- 🐛 Remove unwanted error toast for guests in dashboard [[6b6283f](https://github.com/baptisteArno/typebot.io/commit/6b6283fac4ac0196282c36256a79fe039d8efc3e)]
- 🐛 Escape HTML brackets before sanitizing in Streaming bubble [[91fc9eb](https://github.com/baptisteArno/typebot.io/commit/91fc9eb7c18f812ed9e85d516fd1496dd96f58f5)]
- 🐛 Prevent keyboard shortcut to be triggered when typebot viewer is focused [[b33e2ee](https://github.com/baptisteArno/typebot.io/commit/b33e2eeab0b3bdb7383a738724db03f4bfa14b45)]
- 🐛 Update executeSetVariable to use executeFunction and accept async [[d08b6d5](https://github.com/baptisteArno/typebot.io/commit/d08b6d5cab727bbd73b7854f34f18543def31e00)]
- 🐛 Move all packages to to devDependencies to bundle them in embed lib [[24d6b51](https://github.com/baptisteArno/typebot.io/commit/24d6b5168b9291ac1c4815c7cd6e9a369404612c)]
- 🐛 Fix Share page X overflow [[a241772](https://github.com/baptisteArno/typebot.io/commit/a2417729cfafffc4331b167b04d33bccda46d3a0)]
- 🐛 (blog) Migrating to @next/mdx [[4c0d3fb](https://github.com/baptisteArno/typebot.io/commit/4c0d3fb7cb941d21b50ee22c9a52a34c4cf6c5f1)]
- ✏️ Update Fair Source link in landing page content [[bf09ce0](https://github.com/baptisteArno/typebot.io/commit/bf09ce09256e97668646fa98c72cb5fdc8757501)]
- 🚑 Fix default condition operator evaluation [[3e73fba](https://github.com/baptisteArno/typebot.io/commit/3e73fbafc477dde52d4ce5a28e687cfc07cd4960)]
- 💚 Update bun to version 1.1.30 and use bun publish [[cc7367f](https://github.com/baptisteArno/typebot.io/commit/cc7367f78803a15f3b1d66d6ef1ef76272841547)]
- 🐛 Fix button shrink in some embed setup [[f51258a](https://github.com/baptisteArno/typebot.io/commit/f51258a79616bb565b945735e6866ab398a30399)]
- 💚 Consistent package.json fields accross workspace [[72e64ae](https://github.com/baptisteArno/typebot.io/commit/72e64aec00cd487dbe08146e7b8c4861481846f9)]
- 💚 Fix exit code handling in partykit deploy action [[e47cffa](https://github.com/baptisteArno/typebot.io/commit/e47cffad58471f314d3f0679dbe05f0c6cd93c3f)]
- 💚 Fix error handling in deploy workflow and update condition for deploying PartyKit [[606a68c](https://github.com/baptisteArno/typebot.io/commit/606a68ce20c607e5124c89e1c71f6fd4d0e61cb8)]
- 💚 Fix partykit deploy ci [[19a67a5](https://github.com/baptisteArno/typebot.io/commit/19a67a592df6f369b6b959bad847bb2ed4b5ccf8)]

### Content

- 📝 Add &#x27;WhatsApp business API pricing&#x27; blog post ([#1858](https://github.com/baptisteArno/typebot.io/issues/1858)) [[14833d5](https://github.com/baptisteArno/typebot.io/commit/14833d5830691067a34b11fa048b4474fc7132f0)]
- 📝 Update installation commands to remove unnecessary peer dep install [[84edf64](https://github.com/baptisteArno/typebot.io/commit/84edf64cee5f575dc6339fd90ad7eedd8a4e34d7)]
- 📝 Add onScriptExecutionSuccess callback to chat widget documentation [[bce9141](https://github.com/baptisteArno/typebot.io/commit/bce9141224bd070cf20d03b99ad817683d873afc)]
- 📝 Add &#x27;Free Webflow Templates&#x27; blog post ([#1847](https://github.com/baptisteArno/typebot.io/issues/1847)) [[c0aa3a9](https://github.com/baptisteArno/typebot.io/commit/c0aa3a986cbd42d30d50edb6ae577cd2dd387094)]
- 📝 Add &quot;Real estate AI chabot&quot; blog post ([#1830](https://github.com/baptisteArno/typebot.io/issues/1830)) [[2e6d758](https://github.com/baptisteArno/typebot.io/commit/2e6d758e28904f8778e4872e65bebb55a6d1c32a)]
- 📝 Add guide on splitting AI messages into multiple blocks [[2bfb836](https://github.com/baptisteArno/typebot.io/commit/2bfb836e78cca7be6c42a4d384b05f644513721e)]
- 📝 (webhook) Add PartyKit configuration instructions [[1f6a72b](https://github.com/baptisteArno/typebot.io/commit/1f6a72ba800887bc8c411e136b8f0527715ed94f)]
- 📝 (auth) Enhance email authentication flow with a redirect page [[7b22e3f](https://github.com/baptisteArno/typebot.io/commit/7b22e3fe91c83aa693342ab256b5d8c4d3db5431)]
- 📝 Add &#x27;ManyChat alternatives&#x27; blog post ([#1818](https://github.com/baptisteArno/typebot.io/issues/1818)) [[c55655a](https://github.com/baptisteArno/typebot.io/commit/c55655a7f2bbf59912b3bf1307a1f606e07d16a4)]
- 📝 Add Webhook test app suggestion ([#1813](https://github.com/baptisteArno/typebot.io/issues/1813)) [[45a586e](https://github.com/baptisteArno/typebot.io/commit/45a586e752c401d104bad36a42b3eb90169fc583)]
- 📝 Fix typo docker-compose command ([#1816](https://github.com/baptisteArno/typebot.io/issues/1816)) [[18e882a](https://github.com/baptisteArno/typebot.io/commit/18e882a4d075bb4175068efa9f71f3593b569ef7)]

### Internal

- 🔧 Configure bunfig instead of individual npmrc files [[d2e4ad8](https://github.com/baptisteArno/typebot.io/commit/d2e4ad8b24c431fbd90a0ac25ee827f4e9843a1f)]
- 🔧 Add npmrc file to authenticate properly for publishing [[13c2dd5](https://github.com/baptisteArno/typebot.io/commit/13c2dd51b6e316a9c83bca9dc64d19e6288d2314)]
- 🔧 Add version filed in package json files [[698eda7](https://github.com/baptisteArno/typebot.io/commit/698eda70792b66627f6623afef7c46fc6f60fb4b)]
- 🔥 Remove as const on updateOptions [[9d3537e](https://github.com/baptisteArno/typebot.io/commit/9d3537ef5d224f9b6d0e7bb6c8727419f1ecdea4)]
- 🔧 Upgrade Stripe API version and dependencies [[6ec8f71](https://github.com/baptisteArno/typebot.io/commit/6ec8f71cac9506c0ae05f565b635200cf664e7be)]

### Miscellaneous

-  👷 Revert to using js lib as peer dep for proper types resolving [[569b19c](https://github.com/baptisteArno/typebot.io/commit/569b19c3e176b3b05176649e8976f7b5cdb8d734)]
-  👷 Build js embed lib with tsup [[c6e8594](https://github.com/baptisteArno/typebot.io/commit/c6e85942ceb42186eebdbb46c063b76f161d2cff)]
- 🛂 Prevent duplicate email sends and limit to 5 max email sending in one go [[a6db54c](https://github.com/baptisteArno/typebot.io/commit/a6db54c441ca9d82d4dd94afe8a2f0cb87f284f3)]
- 🛂 Remove default SMTP creds for free workspaces [[cda7f2d](https://github.com/baptisteArno/typebot.io/commit/cda7f2d456468c2b9e590d991002622a6e5a1300)]


<a name="3.0.1"></a>
## 3.0.1 (2024-10-01)

### Content

- 📝 Update local installation instructions [[088678b](https://github.com/baptisteArno/typebot.io/commit/088678bd26326814304a80a71d50a88a96558263)]

### Internal

- 🔧 Add back the db:migrate turbo task [[9928388](https://github.com/baptisteArno/typebot.io/commit/9928388a4b12f6354a7d70eaa172bfb7501da4cf)]


<a name="3.0.0"></a>
## 3.0.0 (2024-10-01)

### New features

- ✨ Add Zendesk block ([#1794](https://github.com/baptisteArno/typebot.io/issues/1794)) [[8ced42d](https://github.com/baptisteArno/typebot.io/commit/8ced42d5c7c25ebf11af973cc8a0b2072de539f1)]

### UI/UX Improvements

- 🚸 (zendesk) Migrate web widget key to block settings [[706a095](https://github.com/baptisteArno/typebot.io/commit/706a09535c880aa73d11b8a78096b945c701eec4)]
- 🚸 Fix editable overflowing in the variables drawer ([#1791](https://github.com/baptisteArno/typebot.io/issues/1791)) [[b03fd77](https://github.com/baptisteArno/typebot.io/commit/b03fd77d4078d119078bab80c4dc3c50f8f1db46)]

### Fixed

- 🐛 (radar) Fix radar regex bug in prod env [[96ed700](https://github.com/baptisteArno/typebot.io/commit/96ed7009cccc573754a3582fe017452f4f20c2f9)]
- 🐛 Fix invalid Google env name in lib [[e3aa613](https://github.com/baptisteArno/typebot.io/commit/e3aa6138617b95dcc8502213d5293c11a847b9b0)]
- 🚑 Rename Google Sheets API keys in viewer [[ba789bb](https://github.com/baptisteArno/typebot.io/commit/ba789bb7706a41d44936aa41a39a8a68fbdc7908)]
- 🐛 Rename Google API keys for better clarity and granularity across auth, Sheets, and Fonts integrations. [[a94f0f7](https://github.com/baptisteArno/typebot.io/commit/a94f0f7ce7bcb2a9a3c71656f345487c8d3764b9)]
- 🐛 Update DropdownList key prop to use getItemValue [[c54e674](https://github.com/baptisteArno/typebot.io/commit/c54e674d77e57f0c81f8c5da07c738ac8d14b7f7)]
- 🐛 Fix Google Font bold weight in injectFont function [[32690cb](https://github.com/baptisteArno/typebot.io/commit/32690cbd8074b3049f4c031f61cc64eb8f81a413)]
- 🐛 Refactor searchRecords to use isNotDefined for valid field check [[0d782f7](https://github.com/baptisteArno/typebot.io/commit/0d782f7a0076b247f311d014ecee4824b6a108c2)]
- 🐛 Remove typebot variable reset in resetSessionState [[34fe006](https://github.com/baptisteArno/typebot.io/commit/34fe006515277a3a412c38fcabb73143d957548e)]
- 🐛 Update routerProgressBar styles for fixed positioning and z-index adjustments [[47fe4e4](https://github.com/baptisteArno/typebot.io/commit/47fe4e4199a7cc2e21ca668ee1f2db9555a99cb5)]
- 🐛 Re-introduce css imports in _app builder [[047d328](https://github.com/baptisteArno/typebot.io/commit/047d328028641cbd33f18669ac42ad9e13b11731)]
- 🐛 Fix persistence issue when user remembered [[ec24db2](https://github.com/baptisteArno/typebot.io/commit/ec24db21bd3adb374772768763be9c4562996029)]
- 🐛 Fix scripts exec [[12fdfe7](https://github.com/baptisteArno/typebot.io/commit/12fdfe7fdf65aa7602519e19341ed724e1bc686d)]
- 🐛 (smtp) allow for non-email username [[dc870fc](https://github.com/baptisteArno/typebot.io/commit/dc870fcfadb948fd3eb4d6c5af56832a9725ab54)]
- 🐛 Fix variable creation when filtered items not empty [[6d350a9](https://github.com/baptisteArno/typebot.io/commit/6d350a9b69fa659ea0b2a21d8a1910c23d3de8b5)]
- 🐛 Make sure files are not broken in preview if visibility is Private [[3f15c26](https://github.com/baptisteArno/typebot.io/commit/3f15c262ec804013afe7f7bf20f01ccef0bc9d13)]
- 🐛 (sendEmail) Fix private attachments not working [[19b3148](https://github.com/baptisteArno/typebot.io/commit/19b3148372202342fef9ce00b625f5714788357d)]
- 🐛 Fix dollar sign prefixed variables in text bubbles [[3c07041](https://github.com/baptisteArno/typebot.io/commit/3c07041f2f0a03852138b953a51838b81b077895)]
- 🐛 (rating) Fix icons fill color [[d5484f9](https://github.com/baptisteArno/typebot.io/commit/d5484f936675ef49d482f2e895f8ac8668c8fe6f)]
- 🐛 (setVariable) Fix transcription in loop [[c26ab77](https://github.com/baptisteArno/typebot.io/commit/c26ab77786ff77140dfd373eae100d60d8ae2682)]
- 🐛 (number) Accept number with commas on WA [[8a28c84](https://github.com/baptisteArno/typebot.io/commit/8a28c84415b2d3f34836e68ea8cb85da026b8748)]
- 🐛 Fix blocks search bar not adapting to block labels [[445196e](https://github.com/baptisteArno/typebot.io/commit/445196e37d3eaff1b26bad2ec8def19e42a6354e)]

### Content

- 📝 Add FAQ about license [[c1aa68a](https://github.com/baptisteArno/typebot.io/commit/c1aa68aeef10f49098aee0fe3679874f2002856e)]
- 📝 Improve webhook field subscription instruction [[5c4be51](https://github.com/baptisteArno/typebot.io/commit/5c4be51260255d433edf35577fb4fd327d063064)]
- 📝 Add fair source blog post [[7fb8a80](https://github.com/baptisteArno/typebot.io/commit/7fb8a80a4cf003bee51092c25202fefb0cb22e21)]
- 📝 Add all settings for each embed [[9af6210](https://github.com/baptisteArno/typebot.io/commit/9af62101591f6dcdddede9bca8a49b5dda4c2f0d)]
- 📝 Add &quot;Add chatbot to webflow&quot; blog post ([#1807](https://github.com/baptisteArno/typebot.io/issues/1807)) [[25a79af](https://github.com/baptisteArno/typebot.io/commit/25a79af81d3ecbb7a65b9ccddc253db7cb474a22)]
- 📝 Enable message streaming in Docker deployment config [[301ffd1](https://github.com/baptisteArno/typebot.io/commit/301ffd1247abf350b0ba8e1fd85bddd31ba78d13)]
- 📝 Add &#x27;Chatbot best practices&#x27; blog post ([#1800](https://github.com/baptisteArno/typebot.io/issues/1800)) [[8ee00ad](https://github.com/baptisteArno/typebot.io/commit/8ee00ad6e406925a86a32a010afe12cc3ccf31f1)]
- 📝 Add &quot;AI open source tools&quot; blog post ([#1770](https://github.com/baptisteArno/typebot.io/issues/1770)) [[d3fc404](https://github.com/baptisteArno/typebot.io/commit/d3fc404af8851af3be0ff6c1f73547a43251f8dd)]
- 📝 Add &quot;webflow popup contact form&quot; blog post ([#1783](https://github.com/baptisteArno/typebot.io/issues/1783)) [[77b3acb](https://github.com/baptisteArno/typebot.io/commit/77b3acb2d79c36ce8edaa2a9c903e5e6e5cd2908)]
- 📝 Add &quot;How to create loops&quot; guide [[86c23bf](https://github.com/baptisteArno/typebot.io/commit/86c23bfed9d79e3bf59c1d483e07a11569ffc259)]
- 📝 Add limitations section in Sheets doc [[7cacf0c](https://github.com/baptisteArno/typebot.io/commit/7cacf0cad74e899acbf4f97f1e45a272243cdd6b)]
- 📝 Add message stream API instructions [[192989b](https://github.com/baptisteArno/typebot.io/commit/192989ba92ed55d9bcc08786cff67f9e78a6c277)]
- 📝 (results) Add time filter section in Results page [[ae31fe8](https://github.com/baptisteArno/typebot.io/commit/ae31fe8f4880ce3a21d0e739d096f7443b243c9f)]

### Internal

- ♻️ Use bun, biome, better ts config, new license and remove all barrel files ([#1801](https://github.com/baptisteArno/typebot.io/issues/1801)) [[10750f5](https://github.com/baptisteArno/typebot.io/commit/10750f54d10a0d96c77371a7f244fad94471abc0)]

### Miscellaneous

- 🔀 Add biome zed settings [[f167015](https://github.com/baptisteArno/typebot.io/commit/f1670150fa0946516676e8f7cd3fdeec9bded7bc)]
-  👷 Refactor bun command in check-and-report-chats-usage.yml [[3498df6](https://github.com/baptisteArno/typebot.io/commit/3498df6309a261a2df7d93b7f02cc345df209160)]
-  👷 Update npm authentication in publish workflows [[230b026](https://github.com/baptisteArno/typebot.io/commit/230b026dcf2e44cb26a3db23f47396d9d87c1e7a)]
- 🧑‍💻 (forge) Pass creds and variables to web parsers [[f613ce3](https://github.com/baptisteArno/typebot.io/commit/f613ce366bf048eda9c4d29b37a5f4327814be3e)]


<a name="2.28.2"></a>
## 2.28.2 (2024-09-06)

### Fixed

- 🚑 (forge) Fix select inputs [[06bf188](https://github.com/baptisteArno/typebot.io/commit/06bf18805220f0b4a22a64351f610ad47695b377)]


<a name="2.28.1"></a>
## 2.28.1 (2024-09-04)

### Fixed

- 🐛 Allow scripts to be executed in WA env [[a7c83af](https://github.com/baptisteArno/typebot.io/commit/a7c83af5bce00efc74a78c063cc8526e88ab624a)]
- 🐛 (ai) Enable multi urls for vision [[3b87801](https://github.com/baptisteArno/typebot.io/commit/3b87801c922bcdc53ddbab2e5435f885b717f692)]
- 🐛 (s3) Skip object removals when S3 not configured [[fa14029](https://github.com/baptisteArno/typebot.io/commit/fa14029fed1e63ce2e2df93abdab42042f6e5b47)]
- 🐛 (openai) Fix custom base url model fetching [[5fa946c](https://github.com/baptisteArno/typebot.io/commit/5fa946c0eb99ed5aa087fdaa5596374518b9580b)]
- 🐛 (forge) Fix incompatible auth schemas when finding fetchers [[18c6381](https://github.com/baptisteArno/typebot.io/commit/18c6381a77c2fc7ba35e3a0ea971c9e2fc04d289)]
- 🐛 (fileUpload) Fix private file upload URLs [[2a767e0](https://github.com/baptisteArno/typebot.io/commit/2a767e02b0c7696f077b3980f301e8d33566ded9)]


<a name="2.28.0"></a>
## 2.28.0 (2024-09-02)

### New features

- ✨ Add Groq block [[6a7877d](https://github.com/baptisteArno/typebot.io/commit/6a7877dc9b38086088539486dcbb4d9406f02316)]
- ✨ Add audio clips option on text input block [[135251d](https://github.com/baptisteArno/typebot.io/commit/135251d3f7349d6b3d7fdbe0f96c19a1bfa1d57f)]
- ✨ (openai) Add &quot;Create transcription&quot; action [[984c2bf](https://github.com/baptisteArno/typebot.io/commit/984c2bf38780dd6215c649d8f9095e986cc351c3)]
- ✨ Add Segment block ([#1672](https://github.com/baptisteArno/typebot.io/issues/1672)) [[29ab812](https://github.com/baptisteArno/typebot.io/commit/29ab8125129c94acd3b11076ea26b916e2a30026)]
- ✨ Implement Pexels videos option to media popover ([#1636](https://github.com/baptisteArno/typebot.io/issues/1636)) [[09277c2](https://github.com/baptisteArno/typebot.io/commit/09277c264c02bbbcd89c58fd8592955b85e376a8)]
- ✨ (credentials) Add credentials management menu in workspace settings [[c6005c4](https://github.com/baptisteArno/typebot.io/commit/c6005c49a207918ba0e9fcbc0e02f3ac0f485231)]

### UI/UX Improvements

- 💄 Fix audio element UI overflow on Firefox [[d51cf00](https://github.com/baptisteArno/typebot.io/commit/d51cf00f690fb9afca944d5e74dbdcc2b7be2896)]
- ⚡ (openai) Allow for custom base URL when adding new creds [[72517a1](https://github.com/baptisteArno/typebot.io/commit/72517a1ec2c4dc76ad1b721f01eb1c193eef8a51)]
- 🚸 (elevenlabs) Remove default timeout [[6d47f3e](https://github.com/baptisteArno/typebot.io/commit/6d47f3efed7fdf53843c8f8c82b066e800e272ea)]
- 🚸 Improve audio clip status change and feedback [[37ef8fe](https://github.com/baptisteArno/typebot.io/commit/37ef8fe240a979899fa0d8030b8d0a36aa32cd3b)]
- 🚸 (condition) Show &quot;AND&quot; label when default unchanged [[2275c69](https://github.com/baptisteArno/typebot.io/commit/2275c6961ed02eb1aba2a0c217f59234748e2201)]
- ⚡ Reset remembered state if the typebot is updated ([#1675](https://github.com/baptisteArno/typebot.io/issues/1675)) [[17684ee](https://github.com/baptisteArno/typebot.io/commit/17684ee5b712e11cb83ca1ab5ef18a3a8b48ee3d)]
- ⚡ Add search input in blocks sidebar ([#1677](https://github.com/baptisteArno/typebot.io/issues/1677)) [[98b2837](https://github.com/baptisteArno/typebot.io/commit/98b2837576d76d3b0b050d5797a38d0a61f937f2)]
- 🚸 (sheets) Auto set credentials after oauth… [[431e29b](https://github.com/baptisteArno/typebot.io/commit/431e29b41e3b8f45191e12028f0aefaa8fa5556b)]
- 🚸 Improve feedback when variable input did … [[1f71b86](https://github.com/baptisteArno/typebot.io/commit/1f71b86f091258c2beb28cb4c9537b0c5155e3ef)]
- 🚸 (anthropic) Add placeholder in models enum [[db628cd](https://github.com/baptisteArno/typebot.io/commit/db628cd0519b5e4227720d600fafcf3a21141f8b)]
- 🚸 (http) Allow for query params list [[8e15472](https://github.com/baptisteArno/typebot.io/commit/8e15472e826b8b7cb4229b99478abc49cb62eaa3)]

### Fixed

- 🐛 (chatNode) Remove default timeout on Send Message exec [[b5ba862](https://github.com/baptisteArno/typebot.io/commit/b5ba862cd26841f7fb122c1fc8613136ab61b788)]
- 🐛 Fix background image popover closing on variable select [[64b3439](https://github.com/baptisteArno/typebot.io/commit/64b3439521ac1c7ef1f99b8c65a70609fc03cc39)]
- 💚 Fix invalid pnpm lock file [[f537052](https://github.com/baptisteArno/typebot.io/commit/f53705268c4cf82ebbda24a7e963880ad92d1461)]
- 🐛 (audioClips) Fix empty metadata on recorded file [[a3a9d58](https://github.com/baptisteArno/typebot.io/commit/a3a9d58be9afabe39aaa7a02bd11af5eb659d546)]
- 🐛 (setVariable) Improve how set variable is evaluated [[97a3212](https://github.com/baptisteArno/typebot.io/commit/97a3212356878c239e5ddc376f74354e9b527405)]
- 🐛 (audioClip) Fix audio clip UI on Safari [[b2c8ef9](https://github.com/baptisteArno/typebot.io/commit/b2c8ef941ba3b2e9fbc7f486f874e80396d83145)]
- 🚑 Fix audio clip not saving properly [[e67f3bc](https://github.com/baptisteArno/typebot.io/commit/e67f3bc9e9780e4407aa405906070c7d3a88b0f8)]
- 🐛 (transcript) Revert incorrect recursive set variable at same block [[58d3955](https://github.com/baptisteArno/typebot.io/commit/58d3955e01f0d792dfe45b174aa8ffdb0112323d)]
- 🐛 (nocodb) Fix filter when variable is empty [[2ac543a](https://github.com/baptisteArno/typebot.io/commit/2ac543a4a89de6ac911ba50252a3b28c47a90294)]
- 🐛 Fix input answer empty if filled from set variable [[b4a6e42](https://github.com/baptisteArno/typebot.io/commit/b4a6e427ad5a4713089f310b573752b179f4b597)]
- 🐛 Fix inline code parsing on text with multi vars [[d4e612a](https://github.com/baptisteArno/typebot.io/commit/d4e612a28557c400d3cf9479f340c579d1462073)]
- 🐛 (transcript) Fix shift answers is not immutable [[9218ef8](https://github.com/baptisteArno/typebot.io/commit/9218ef801da3d5a283f45347399fde643ddddc88)]
- 🐛 (ai) Fix vision on URL that contains whitespaces [[5a0a133](https://github.com/baptisteArno/typebot.io/commit/5a0a133429aadde92b55067c146f58784d2bd54a)]
- 🐛 (whatsapp) Fix start condition failure [[a9f2b49](https://github.com/baptisteArno/typebot.io/commit/a9f2b49251334cbd4057dd555a8b6ea493c33e49)]
- 🐛 Fix smtp error details not displaying [[38fa88f](https://github.com/baptisteArno/typebot.io/commit/38fa88f6d6c0915682ccdb54b9fd78612a17db1e)]
- 🐛 Fix append values bug when value contains &quot;&#x60;&quot; [[22953a3](https://github.com/baptisteArno/typebot.io/commit/22953a3445f701eebe65ed4035811febae801f31)]
- 💚 Fix error message invalid type [[77daab8](https://github.com/baptisteArno/typebot.io/commit/77daab8a5fb148becc34af99a00dd7b0e840340c)]
- 🐛 (transcript) Make sure to set all the set variables that matches the same block [[91de79b](https://github.com/baptisteArno/typebot.io/commit/91de79b502ef46f32d23081d582afb4e796beb00)]
- 🐛 Fix credentials listing when getting deleted creds [[94ca8ac](https://github.com/baptisteArno/typebot.io/commit/94ca8ac39fc162e6a7092676457b939ae86e2f2a)]
- 🐛 Fix empty placeholder ignored [[0237c6f](https://github.com/baptisteArno/typebot.io/commit/0237c6f835dbf088041b6b2bb9b540e4635cc1ec)]
- 🐛 (editor) Fix share popover behind Test drawer [[71d09cd](https://github.com/baptisteArno/typebot.io/commit/71d09cdf7c997e6774981285fd4e84dfbb22f135)]
- 🐛 Fix openai total tokens variable set when streaming [[c6645d4](https://github.com/baptisteArno/typebot.io/commit/c6645d4505732be3cc05d8968e4e3737b5c271df)]
- 🐛 (credentials) Fix credentials not listing when workspace has legacy zemantic [[bd6921b](https://github.com/baptisteArno/typebot.io/commit/bd6921b90ca36085f88ac86351ce0ef783918fbb)]
- 🐛 Fix nextjs package broken dynamic import [[2a5fb14](https://github.com/baptisteArno/typebot.io/commit/2a5fb14726ce26152acb1b0c1ed5e1a9be6556db)]
- 💚 Fix cleanDatabase github script turbo exec [[94ed572](https://github.com/baptisteArno/typebot.io/commit/94ed5724d8372fd0d25323f9e59a9dcf2847b6c9)]
- 🐛 Fix remember user streaming messages [[f4cd1d5](https://github.com/baptisteArno/typebot.io/commit/f4cd1d5ba3f8cee5d3d923301aec0bffb137b938)]
- 💚 Fix landing page redirects env ignored [[a4fb8b6](https://github.com/baptisteArno/typebot.io/commit/a4fb8b6d1072c7f3831cc9787368ca0d3f9d1838)]
- 💚 Fix checkAndReportChatsUsage script env [[952ff20](https://github.com/baptisteArno/typebot.io/commit/952ff20b52c43920e04a1580ee8ca39085796e74)]

### Content

- 📝 Add Generate variables docs section [[0c7d2af](https://github.com/baptisteArno/typebot.io/commit/0c7d2afd5164f6e3d7955fb3bd91c1f9f25b3f18)]
- 📝 Add OAuth scopes URL for Sheets config ([#1732](https://github.com/baptisteArno/typebot.io/issues/1732)) [[53104a4](https://github.com/baptisteArno/typebot.io/commit/53104a4a5ea59aa7fe7471dea9eeb4b64ee9d943)]
- 📝 Add docs for audio clips and update audio chat gpt template [[503060c](https://github.com/baptisteArno/typebot.io/commit/503060cb4dc15a86303d7a79748ae68d348412b1)]
- 📝 Add &quot;Chatbot script examples&quot; blog post ([#1707](https://github.com/baptisteArno/typebot.io/issues/1707)) [[c2c2ef7](https://github.com/baptisteArno/typebot.io/commit/c2c2ef74582d2bff69654cd35539eb062f61e64b)]
- 📝 Update run forge documention with new specs [[e649e49](https://github.com/baptisteArno/typebot.io/commit/e649e49572feb9b5f80df7be07af4215836db178)]
- 📝 Add WA limitation notice on Execute on client option [[ac79134](https://github.com/baptisteArno/typebot.io/commit/ac791349738e3ae84df97a4edfe638bc20071f89)]
- 📝 Add variable result saving notice [[089332e](https://github.com/baptisteArno/typebot.io/commit/089332ecf197ca8376f4b99e52d2a17d0e7479db)]
- 📝 Add &quot;open source chatbots&quot; article ([#1685](https://github.com/baptisteArno/typebot.io/issues/1685)) [[578e4a4](https://github.com/baptisteArno/typebot.io/commit/578e4a4d0058cc870c2c4f788c5ada74bfba55f9)]
- 📝 Add issue and feature request template ([#1694](https://github.com/baptisteArno/typebot.io/issues/1694)) [[b5eab4d](https://github.com/baptisteArno/typebot.io/commit/b5eab4db7515fc6dd3e7a7c3909c63709e42e409)]
- 📝 Remove enterprise discovery plan link for commercial license [[d49e006](https://github.com/baptisteArno/typebot.io/commit/d49e006df08283a7ada7853e15566e1019fe8026)]
- 📝 Add proper NODE_OPTIONS in env.dev.example [[85f2c07](https://github.com/baptisteArno/typebot.io/commit/85f2c0739a9055e22f2f6cc69da7a52ecff8f8b1)]
- 📝 Add proto header in reverse proxy instructions [[a79f41e](https://github.com/baptisteArno/typebot.io/commit/a79f41e3c6509b67100574195366ae1c3034208d)]
- 📝 Add &quot;benefits ai chatbot&quot; article ([#1674](https://github.com/baptisteArno/typebot.io/issues/1674)) [[7210df4](https://github.com/baptisteArno/typebot.io/commit/7210df4d796d838a1ba63374749780b5476c5c19)]
- 📝 Add &quot;Chatbot.com alternatives&quot; blog post ([#1663](https://github.com/baptisteArno/typebot.io/issues/1663)) [[3ba0e39](https://github.com/baptisteArno/typebot.io/commit/3ba0e393af34fd222936d8c03c082a1ae61e85c8)]
- 📝 Add &quot;Ecommerce chatbot&quot; blog post ([#1653](https://github.com/baptisteArno/typebot.io/issues/1653)) [[929863f](https://github.com/baptisteArno/typebot.io/commit/929863f09bed9aedbee4551eb5dc4b2672d2d654)]
- 📝 Add &#x27;React Chatbot&#x27; blog post ([#1633](https://github.com/baptisteArno/typebot.io/issues/1633)) [[2e016e9](https://github.com/baptisteArno/typebot.io/commit/2e016e90441517369a43169f2bfb138425ffb1c1)]
- 📝 Remove WABA ID requirement instruction [[90cc8c8](https://github.com/baptisteArno/typebot.io/commit/90cc8c8054e29e1dc96f3e4640c2dad938de8fc3)]

### Internal

- 🔧 Avoid rollup bundle crash when dev mode [[b0d86bf](https://github.com/baptisteArno/typebot.io/commit/b0d86bf38292a6811abd51995f54c4334867388a)]
- 🔧 Remove importHelpers from lib package [[eb9c3b6](https://github.com/baptisteArno/typebot.io/commit/eb9c3b600310a85d66602b1ccfa41808b33ef1a9)]
- 🔧 Migrate Tolgee from self-hosted to cloud [[0ee820b](https://github.com/baptisteArno/typebot.io/commit/0ee820b4da887f9f446beb78f3d05e706a0ff9b3)]
- ♻️ (wp) Improve wp escape attr [[867041e](https://github.com/baptisteArno/typebot.io/commit/867041e7d8e374ef93d78097cdb478313a2e26d3)]

### Miscellaneous

- 🧑‍💻 (s3) Correctly delete the files when deleting resources [[041b817](https://github.com/baptisteArno/typebot.io/commit/041b817aa07b5118dd208d049527ab9d9d411023)]
- 🧑‍💻 Improve apiOrigin detection [[86263f0](https://github.com/baptisteArno/typebot.io/commit/86263f07228ff8be88862ee673ec348c8bec9f87)]
-  Update issue templates ([#1699](https://github.com/baptisteArno/typebot.io/issues/1699)) [[09890a7](https://github.com/baptisteArno/typebot.io/commit/09890a756e54d03793f537f74ca64a5c8de78398)]
- 🧑‍💻 Provide SMTP error details in toast [[da908ff](https://github.com/baptisteArno/typebot.io/commit/da908ffe90ec80883dd545a74b3f2d8646600c49)]
- 🐳 Add required NODE_OPTIONS by default [[0239eec](https://github.com/baptisteArno/typebot.io/commit/0239eec2cd8624eebc213283bea02e715278b046)]


<a name="2.27.0"></a>
## 2.27.0 (2024-07-11)

### New features

- ✨ Add attachments option to text input ([#1608](https://github.com/baptisteArno/typebot.io/issues/1608)) [[6db0464](https://github.com/baptisteArno/typebot.io/commit/6db0464fd7580443a3b705d45b8958e1461c606c)]
- ✨ Add &quot;Generate variables&quot; actions in AI blocks [[76fcf7e](https://github.com/baptisteArno/typebot.io/commit/76fcf7ee93ba3f0fac1404b0af2e002dda3217bf)]
- ✨ Support Vision for compatible AI models [[ee83499](https://github.com/baptisteArno/typebot.io/commit/ee834999e61c533271fe2c6320dedf133706b641)]

### UI/UX Improvements

- ⚡ Option to disable controls and autoplay on videos ([#1631](https://github.com/baptisteArno/typebot.io/issues/1631)) [[c7263a1](https://github.com/baptisteArno/typebot.io/commit/c7263a17eb973de2bb3c2e77c790a12bfa4339b4)]
- ⚡ (anthropic) Add Claude 3.5 model&quot; [[1d74bce](https://github.com/baptisteArno/typebot.io/commit/1d74bce7045ada6d60a111be3bf83e357d814961)]
- ⚡ (anthropic) Add Claude 3.5 model [[99eae33](https://github.com/baptisteArno/typebot.io/commit/99eae33187c8a143e232d5c188769db0d7b31c9b)]
- ⚡ (setVariable) Add Pop and Shift items [[8ec0fbd](https://github.com/baptisteArno/typebot.io/commit/8ec0fbdebf8c47c8bfa47151bb3ff8773ecb138b)]
- ⚡ (embed) Option to add a wait event for the embed bubble [[918836d](https://github.com/baptisteArno/typebot.io/commit/918836d6cf26022921da9b37c37ef65c2ac112d7)]
- 🚸 Automatically create variables when pasting groups to a new typebot [[4ab1803](https://github.com/baptisteArno/typebot.io/commit/4ab1803d3985c214bcc6c9d448349e6beef9808e)]
- 🚸 (nocodb) Clean up error messages [[0f2f4d2](https://github.com/baptisteArno/typebot.io/commit/0f2f4d2130e7f92499ba631c3f29dbab34998c19)]
- 🚸 Display error toast when script or set vari… [[233ff91](https://github.com/baptisteArno/typebot.io/commit/233ff91a570f2f56288a8ad885a377dbcf2f3e9c)]
- 🚸 (onboarding) Introduce new onboarding floating videos mechanism [[c55973f](https://github.com/baptisteArno/typebot.io/commit/c55973fac0ae3c799ad86ffa60349c4216c11ce3)]
- 🚸 (openai) Raise assistants select limit to 100 [[4a45e5e](https://github.com/baptisteArno/typebot.io/commit/4a45e5e1f149c82bd6bb28a04496caaec20a7f55)]

### Fixed

- 🐛 (wp) Fix XSS vuln shortcode attributes [[6049aad](https://github.com/baptisteArno/typebot.io/commit/6049aad6aaa5fec031c406fb5fd7c66dbc5d2d27)]
- 🐛 Use custom domain origin for API calls [[cbaa7e7](https://github.com/baptisteArno/typebot.io/commit/cbaa7e783000d8bf9bd17f10bbe0e85755542cd3)]
- 🐛 Fix http req body type issue [[d838c2c](https://github.com/baptisteArno/typebot.io/commit/d838c2c816855699f990a725bc5b4f2b6f72a504)]
- 🐛 (http) Accept body content other than json and form-data [[c5794a0](https://github.com/baptisteArno/typebot.io/commit/c5794a0461da3c4bd633d6bf61e5c775281b50ec)]
- 🐛 (upload) Fix file upload generated URL in preview [[85e9a0c](https://github.com/baptisteArno/typebot.io/commit/85e9a0c5e73fe7963c5e2538696056dde7a63b09)]
- 💚 Upgrade pnpm action setup [[7d44967](https://github.com/baptisteArno/typebot.io/commit/7d4496790cb6cfe22a3907481a482e2371acf289)]
- 🚑 (billing) Fix checkout session email check [[be28d9d](https://github.com/baptisteArno/typebot.io/commit/be28d9d96a2954271fa55ab0a4520f632b3956e5)]
- 🐛 (sheets) Make sure update cells do not overwrite existing… [[1431898](https://github.com/baptisteArno/typebot.io/commit/1431898b82ba812cdc605197ca9b01cec2d1208e)]
- 🐛 (attachments) Fix attachments on mobile and fix long text… [[898ed52](https://github.com/baptisteArno/typebot.io/commit/898ed529b0369e13e837710093de132af90634f1)]
- 🚑 Fix reply resume chat [[baa5f5f](https://github.com/baptisteArno/typebot.io/commit/baa5f5f6f34f8721eac55f7111b515321975a6e6)]
- 🚑 Fix embed web.js file mentioning &quot;process&quot; [[b08e374](https://github.com/baptisteArno/typebot.io/commit/b08e374e3e4c493b801450066459d8ab8b025301)]
- 🐛 (transcript) Fix variable ids for history detection [[dd191e3](https://github.com/baptisteArno/typebot.io/commit/dd191e35257f88299f1cae883a4c9cbc88df671f)]
- 🚑 Fix youtube URL detection regex [[3b405dc](https://github.com/baptisteArno/typebot.io/commit/3b405dc7d5e028462728b695bce7ee6e1b9b20d7)]
- 🐛 (payment) Fix payment redirection [[6af47a8](https://github.com/baptisteArno/typebot.io/commit/6af47a8cfe0238007864ab16d8e3cb1acdb4af66)]
- 🐛 (lp) Fix image size in blog on mobile [[80da7af](https://github.com/baptisteArno/typebot.io/commit/80da7af4f1e33c66146ae06ccd20867e46255cdf)]
- 🐛 (text) Fix text bubble content parsing when starting with variable [[7790cf4](https://github.com/baptisteArno/typebot.io/commit/7790cf4f2741725ea155eda7603d1198e08c2177)]
- 🐛 (video) Parse youtube start time query param [[b10383e](https://github.com/baptisteArno/typebot.io/commit/b10383e02716fa24673c9829db7df97a22cc8267)]
- 🐛 (embed) Fix iframe embed when referrer is empty [[8a8a3c5](https://github.com/baptisteArno/typebot.io/commit/8a8a3c58688f35a0c8ea76bbf6ac6ec81fdeef04)]
- 🚑 Fix variable search button input not auto opening [[990ff0f](https://github.com/baptisteArno/typebot.io/commit/990ff0f4ca72cc54998b378c32e1e18e4a0cbc18)]
- 🐛 Fix allowed origins when embedded in iframe [[67f37c0](https://github.com/baptisteArno/typebot.io/commit/67f37c02a4a000ab04391e8b32ff9020417fabeb)]
- 🐛 (theme) Remove variables button from Custom CSS editor [[36c9846](https://github.com/baptisteArno/typebot.io/commit/36c984643aec800e1dc41728bdbc9a5b6a05f7a2)]
- 🐛 (nocodb) Automatically ignore trailing slash for baseURL [[ff16706](https://github.com/baptisteArno/typebot.io/commit/ff16706d7dd22619e2d572255949b11d7ff895b9)]
- 🐛 (editor) Fix groups paste when edge is not copied [[9869973](https://github.com/baptisteArno/typebot.io/commit/98699738d7fc3e8125d2aac5e4ee9f159344bf1a)]
- 🐛 (sendEmail) Fix body HTML parsing invalid escape [[f38af0d](https://github.com/baptisteArno/typebot.io/commit/f38af0d90b5b10e878f178aee36b084767537ca7)]
- 💚 Fix pnpm lock file [[d80b3ea](https://github.com/baptisteArno/typebot.io/commit/d80b3eaddb343f9a09109e8f9f8172a69663f25f)]
- 🐛 (setVariable) Fix setVariable array parsing when executed on client [[ad6894e](https://github.com/baptisteArno/typebot.io/commit/ad6894e110dd931429ac2c219456e4b95ef22e0f)]
- 🐛 Fix date parsing with european format [[209cec3](https://github.com/baptisteArno/typebot.io/commit/209cec34b961a794c0c906da01604bf75910355d)]
- 🐛 Fix SMTP auth without creds [[abc35a8](https://github.com/baptisteArno/typebot.io/commit/abc35a86952edc8578fc7d396d38b3b12e3d2844)]

### Content

- 📝 Add &#x27;WhatsApp business benefits&#x27; blog post ([#1628](https://github.com/baptisteArno/typebot.io/issues/1628)) [[1bc217d](https://github.com/baptisteArno/typebot.io/commit/1bc217d3ad6e69bdfefce5787368df87724810f8)]
- 📝 Update local-installation documentation for landing page ([#1627](https://github.com/baptisteArno/typebot.io/issues/1627)) [[e545c60](https://github.com/baptisteArno/typebot.io/commit/e545c60ca7b8402e6c1182f96ffb5d98b1e246e7)]
- 📝 Add &#x27;upsell using ai chatbots&#x27; blog post ([#1612](https://github.com/baptisteArno/typebot.io/issues/1612)) [[2772d88](https://github.com/baptisteArno/typebot.io/commit/2772d88e1ae88b3651852a29c2892d82d16fdb6f)]
- 📝 Add link to test CC from Stripe ([#1621](https://github.com/baptisteArno/typebot.io/issues/1621)) [[747e989](https://github.com/baptisteArno/typebot.io/commit/747e989b7837165e50369b484f16725a52a6c7df)]
- 📝 Add &#x27;how to add chatbot in wordpress&#x27; blog post ([#1599](https://github.com/baptisteArno/typebot.io/issues/1599)) [[7f82c2f](https://github.com/baptisteArno/typebot.io/commit/7f82c2f9985c739678326c0838d2406f66e9fa44)]
- 📝 Add missing set variable values [[a1b5e59](https://github.com/baptisteArno/typebot.io/commit/a1b5e59124b2b7485880f923749d84e554072741)]
- 📝 Add API deploy doc [[14613b6](https://github.com/baptisteArno/typebot.io/commit/14613b61d32baf8da3914d8a8dea54544a483eea)]
- 📝 Add &#x27;Top 5 best CRM for Shopify&#x27; blog post ([#1571](https://github.com/baptisteArno/typebot.io/issues/1571)) [[9c27ca9](https://github.com/baptisteArno/typebot.io/commit/9c27ca9f4014b0591701fcfc97c70a9c8c17d574)]
- 📝 Update docker.mdx ([#1597](https://github.com/baptisteArno/typebot.io/issues/1597)) [[8e6cee5](https://github.com/baptisteArno/typebot.io/commit/8e6cee5890114d891132ce63bbd2e868d35b9bcb)]
- 📝 Update i18n-ally-custom-framework.yml ([#1595](https://github.com/baptisteArno/typebot.io/issues/1595)) [[0efd7f1](https://github.com/baptisteArno/typebot.io/commit/0efd7f1547163f82d72a75af303340ede3265abd)]
- 📝 Add nocodb block videos into docs [[5565455](https://github.com/baptisteArno/typebot.io/commit/55654550f0dc8afc4cc41769c073188ba9d204d4)]
- 📝 Add Savings Estimator template [[531a1be](https://github.com/baptisteArno/typebot.io/commit/531a1be003cc9a513d030166ebb97bbdea4940c4)]
- 📝 Update high ticket lead template with Generate variable a… [[1380e03](https://github.com/baptisteArno/typebot.io/commit/1380e03b82b2e98119324d6ddfb34e84ab18c2b4)]
- 📝 Add generate upload url endpoint api doc [[033f52e](https://github.com/baptisteArno/typebot.io/commit/033f52e9f305af1c7cc7fedadb435819f04ea320)]
- 📝 Add &#x27;customer success manager job description&#x27; blog post ([#1558](https://github.com/baptisteArno/typebot.io/issues/1558)) [[2e322c5](https://github.com/baptisteArno/typebot.io/commit/2e322c5acc243f4b3e794d9b7ae1cea5ba4ed185)]
- 📝 Add Transcript doc [[fdbd9c0](https://github.com/baptisteArno/typebot.io/commit/fdbd9c08a3c9e41ae4b9a0a7968be7caa75bc430)]
- 📝 Add &quot;chatfuel alternatives&quot; blog post ([#1544](https://github.com/baptisteArno/typebot.io/issues/1544)) [[2b420c4](https://github.com/baptisteArno/typebot.io/commit/2b420c4e44fb935d1e65da7f1b49a982c5ae49a2)]
- 📝 Add &quot;best marketing chatgpt prompts&quot; blog post ([#1543](https://github.com/baptisteArno/typebot.io/issues/1543)) [[edbc5a0](https://github.com/baptisteArno/typebot.io/commit/edbc5a0cef789824f64a754663a018de473adee2)]

### Internal

- 🔧 (billing) New checkout session should work with existi… [[cb0987e](https://github.com/baptisteArno/typebot.io/commit/cb0987e41c628aba074af9641b6291c89ea499d8)]
- 🔧 Fix landing page loading issue with query params [[40ca02d](https://github.com/baptisteArno/typebot.io/commit/40ca02df8c0dfa026af29a85300b164dac68d4e6)]

### Miscellaneous

- 🧑‍💻 Add healthcheck API endpoints on all apps ([#1563](https://github.com/baptisteArno/typebot.io/issues/1563)) [[24db6c5](https://github.com/baptisteArno/typebot.io/commit/24db6c569387bc41860cf79003124c382e3ba0f8)]
- 🧑‍💻 Skip email check if included in ADMIN_EMAIL ([#1537](https://github.com/baptisteArno/typebot.io/issues/1537)) [[d363b23](https://github.com/baptisteArno/typebot.io/commit/d363b23efa905597d261917e3ec900359103ecf3)]


<a name="2.26.1"></a>
## 2.26.1 (2024-06-04)

### Fixed

- 🚑 Fix webhook sample result parsing [[a936bc2](https://github.com/baptisteArno/typebot.io/commit/a936bc206adb446fb4bd469e8681b09dafe3a57a)]

### Content

- 📝 Add v2.26 newsletter [[45aa4c6](https://github.com/baptisteArno/typebot.io/commit/45aa4c6da5f24d12cfa0f0c582f47a32fc28ee05)]


<a name="2.26.0"></a>
## 2.26.0 (2024-06-03)

### New features

- ✨ Add NocoDB block ([#1365](https://github.com/baptisteArno/typebot.io/issues/1365)) [[a17781d](https://github.com/baptisteArno/typebot.io/commit/a17781dfa67b1a8cac23cf265d041b74ffd6338e)]
- ✨ Add &quot;Skin Typology&quot; template [[5680829](https://github.com/baptisteArno/typebot.io/commit/5680829906ee54406848f24fae7f271ca411ac2d)]

### UI/UX Improvements

- 🚸 Properly parse single break lines in streaming bubble [[3d09ad1](https://github.com/baptisteArno/typebot.io/commit/3d09ad18181870cbe15ec369168f1443ddef9d6c)]
- 🚸 (number) Avoid parsing numbers starting with 0 [[3e4e753](https://github.com/baptisteArno/typebot.io/commit/3e4e7531f6241b1b3b9e4434401f19b38a59143f)]
- 🚸 (dify) Improve error display when streaming [[e1f1b58](https://github.com/baptisteArno/typebot.io/commit/e1f1b58c1c68a66b24bfb7de4868ae15074ac39b)]
- 🚸 (url) Improve URL input behavior on web [[3320e1b](https://github.com/baptisteArno/typebot.io/commit/3320e1b809bbc6384e73b41842b11b989f81779d)]
- ⚡ (api) Add textBubbleContentFormat option [[c53ce34](https://github.com/baptisteArno/typebot.io/commit/c53ce349af438676010b7aade9206cf65238ed60)]
- ⚡ (difyAi) Enable streaming with Dify.AI block [[58f2e3b](https://github.com/baptisteArno/typebot.io/commit/58f2e3bdeb5a9f08d60a4fdeb4c8313b8f3cffad)]
- 🚸 Add variables button in forged select input by default [[b71dbdb](https://github.com/baptisteArno/typebot.io/commit/b71dbdb7836e3d9e07b52fd162a2ac568e53a2d0)]
- ⚡ Format email input to lower case ([#1520](https://github.com/baptisteArno/typebot.io/issues/1520)) [[618322e](https://github.com/baptisteArno/typebot.io/commit/618322e13e17fb22c0d7eeb0a3980717d57c6089)]

### Fixed

- 🐛 Fix storage bug when setVariableHistory conflicts [[fa191fd](https://github.com/baptisteArno/typebot.io/commit/fa191fde8ce90a4fad2fc932de0f8e9aabd1a400)]
- 🐛 Fix sample result parsing on complex flows [[409c553](https://github.com/baptisteArno/typebot.io/commit/409c55308e5e7b6bf91f62f722db78cdb04cc0c3)]
- 🐛 (dify) Fix invalid parsing when text delta is multiline [[176e3a5](https://github.com/baptisteArno/typebot.io/commit/176e3a5fcfd367a6d08604a7372f05ee48eb4f8e)]
- 🐛 (script) Fix script exec when one variable is object [[85bcb69](https://github.com/baptisteArno/typebot.io/commit/85bcb699f8707c8b248f68be0923d09f4c2c0b10)]
- 🚑 Fix inline code evaluation [[073c1d4](https://github.com/baptisteArno/typebot.io/commit/073c1d427c84a29b15c65d6a76cbfb349d794114)]
- 🐛 (whatsapp) Fix preview_url parsing [[88d98f0](https://github.com/baptisteArno/typebot.io/commit/88d98f05a0abda2609acacdbc860b0cd2efb3b80)]
- 🐛 (calCom) Fix book callback not working on second attempt [[c2f3c97](https://github.com/baptisteArno/typebot.io/commit/c2f3c9709f19a60aecd0989e68efee176075e3b2)]
- 🐛 (calCom) Fix weekly and column layouts restrained from max-width prop [[10cbf4d](https://github.com/baptisteArno/typebot.io/commit/10cbf4dfbc5daf9f8bd9970bad6e1ab8ba70a105)]
- ✏️ Fix ee README broken image [[06ac93c](https://github.com/baptisteArno/typebot.io/commit/06ac93ce1868b0c0dea75536ced7d8ffc1deb1c9)]
- 🐛 (variables) Fix session only menu bool [[e49d28c](https://github.com/baptisteArno/typebot.io/commit/e49d28ced5f924868343ec42f17f3b327729f31c)]
- 🐛 (wa) Fix session stuck into reply state [[9f39c66](https://github.com/baptisteArno/typebot.io/commit/9f39c6621fd04103d901ee8234eebc42f0fdff37)]

### Content

- 📝 Add &quot;Create whatsapp chatbot&quot; article ([#1502](https://github.com/baptisteArno/typebot.io/issues/1502)) [[e015385](https://github.com/baptisteArno/typebot.io/commit/e015385a7cbc30ba85f04eb2f45f5d243778db0a)]
- 📝 Add &quot;How to train chatbot on your own data&quot; article ([#1516](https://github.com/baptisteArno/typebot.io/issues/1516)) [[29040c6](https://github.com/baptisteArno/typebot.io/commit/29040c67e1cddf63122516c362c34698efa72d80)]
- 📝 Add release section in self-hosting get-started page [[076a950](https://github.com/baptisteArno/typebot.io/commit/076a9503ef566294696b61544ed59183ada2c0ed)]

### Internal

- 🔥 Remove useless check for group id before saving … [[b5d0ea4](https://github.com/baptisteArno/typebot.io/commit/b5d0ea422ba55dc37fa098bd1c754c79405c3455)]
- 🗃️ Add createdAt to sort transcript answers [[79ad1f6](https://github.com/baptisteArno/typebot.io/commit/79ad1f63de9ca8d2ebad18cf9811ec27d85eeb86)]
- 🔒 Use isolated-vm [[8d66b52](https://github.com/baptisteArno/typebot.io/commit/8d66b52a3909c245c8da5872e3f7bbb8d4143c67)]
- ♻️ (mistral) Use new ai sdk Mistral core [[15b2901](https://github.com/baptisteArno/typebot.io/commit/15b2901f8a723ce92401ae34282f7ac83cac1fad)]
- 🔥 Remove chat-api app [[e91fced](https://github.com/baptisteArno/typebot.io/commit/e91fced41d313a5597148be3ea2cb8b548310c48)]

### Miscellaneous

- 🐳 Fix docker image build by adding python package install [[9ec3f35](https://github.com/baptisteArno/typebot.io/commit/9ec3f35382ee299aa81f2d1de53057d2789ef51c)]
- 🧑‍💻 Add more convenient classes to typebot elements [[3031d26](https://github.com/baptisteArno/typebot.io/commit/3031d26f03ff7b23efc9a4a73c3d623d1425adb5)]
- 🧑‍💻 Add keycloak auth provider ([#1533](https://github.com/baptisteArno/typebot.io/issues/1533)) [[bb4bbd8](https://github.com/baptisteArno/typebot.io/commit/bb4bbd8f0e5163f48458e220899c58d7f7d2dc1d)]
- 📄 Add Commercial License for ee folder ([#1532](https://github.com/baptisteArno/typebot.io/issues/1532)) [[0eacbeb](https://github.com/baptisteArno/typebot.io/commit/0eacbebbbe4366bf4467c196eb3fa922bc82f628)]
-  :monocle_face: Improve chat session inspection script [[ab9e36f](https://github.com/baptisteArno/typebot.io/commit/ab9e36f68d5458398af2d4bae0a82d00303a4de4)]


<a name="2.25.2"></a>
## 2.25.2 (2024-05-21)

### New features

- ✨ (setVariable) Add Transcription system var ([#1507](https://github.com/baptisteArno/typebot.io/issues/1507)) [[40f2120](https://github.com/baptisteArno/typebot.io/commit/40f21203b50e57c4cdd2b4cc70a6625d35b9cb45)]

### UI/UX Improvements

- 🚸 (whatsapp) Enable embed video thumbnail previ… [[9b8298b](https://github.com/baptisteArno/typebot.io/commit/9b8298b1315506a7bd9233d120b6135725d1b122)]
- 💄 Fix bubble preview image full size [[8151d7f](https://github.com/baptisteArno/typebot.io/commit/8151d7fd907ecf2baa242367a275d18fd9a36f5c)]
- 💄 (bot) Fix bubble max widths and guest avatar shrinking [[3662c0d](https://github.com/baptisteArno/typebot.io/commit/3662c0d631383d3bd2cb24230e9fcc6b3b976999)]

### Fixed

- 🚑 (httpRequests) Fix save variable parsing [[304bfcf](https://github.com/baptisteArno/typebot.io/commit/304bfcf355e62912600bcbaf1414d6908673f3c5)]
- 🐛 (transcript) Fix typebot link incorrect next group [[fa45564](https://github.com/baptisteArno/typebot.io/commit/fa4556450426cf886654596f817f683340702ba2)]
- 🐛 Fix select input displaying id instead of label on refresh [[f211a3e](https://github.com/baptisteArno/typebot.io/commit/f211a3e29fb5e8d47d8064333fe07da87a968764)]
- 🐛 (wa) Fix WhatsApp session stuck if state object is empty [[8351e20](https://github.com/baptisteArno/typebot.io/commit/8351e20fd30a732d51c09bbe2552fbb4edeec872)]
- 🚑 (setVariable) Fix inline code parser [[91603aa](https://github.com/baptisteArno/typebot.io/commit/91603aa6cee6b6effd20ef8a2ab6de1cee0f534c)]

### Internal

- 🗃️ Convert answerv2 content field to Text field [[41ccf24](https://github.com/baptisteArno/typebot.io/commit/41ccf2434853afcc5e7d951dca1f245c50035831)]


<a name="2.25.1"></a>
## 2.25.1 (2024-05-14)

### New features

- ✨ Add variables panel [[1afa25a](https://github.com/baptisteArno/typebot.io/commit/1afa25a01564988933fa82dbac57e2443f8503c4)]
- ✨ Add &quot;OpenAI Assistant Chat&quot; template [[a413d1b](https://github.com/baptisteArno/typebot.io/commit/a413d1bdc4ec981da6b4aa236fff55489dce45ca)]
- ✨ Add &quot;Quick Carb Calculator&quot; template [[04e29ba](https://github.com/baptisteArno/typebot.io/commit/04e29bab084c90ed5a8de853440f0251f8ce8c2f)]

### UI/UX Improvements

- 🚸 (billing) Increase invoices limit list [[e4a7774](https://github.com/baptisteArno/typebot.io/commit/e4a7774c40260b799532724369fd5e5ae0c83f85)]
- 🚸 (elevenlabs) Remove variable button in cred… [[8a27cea](https://github.com/baptisteArno/typebot.io/commit/8a27cea36b5a32cf2e550e3e3fd48b12e41cb96d)]
- ⚡ (variables) Add session option in variables ([#1490](https://github.com/baptisteArno/typebot.io/issues/1490)) [[b4ae098](https://github.com/baptisteArno/typebot.io/commit/b4ae098440fff317fe3f976d95176659c1b29ab1)]

### Fixed

- 🐛 Fix inconsistent updatedAt when timezone is different fro… [[ad4d1a1](https://github.com/baptisteArno/typebot.io/commit/ad4d1a1000575fb3b887c03e5bed3692b3150e3c)]
- 🐛 (blog) Fix referer regex matcher [[1e5e085](https://github.com/baptisteArno/typebot.io/commit/1e5e0851f9f23e2e28123b2315d2a318e645ca41)]
- 🚑 (blog) Replace matching host regex instead of multi value in list [[29d0cae](https://github.com/baptisteArno/typebot.io/commit/29d0caea1c311219c9c417f6285a1c56a1300f76)]
- 🐛 (blog) Fix image not loading when coming from /blog [[30f81c8](https://github.com/baptisteArno/typebot.io/commit/30f81c810a1b620041360280d80d0d17bea9b00d)]
- 🐛 (payment) Fix description variable parsing [[2578335](https://github.com/baptisteArno/typebot.io/commit/2578335cc91503bbafebdfa704bbc2c7665eb388)]
- 🐛 (share) Show duplicate button for authenticated guests [[9b1ff84](https://github.com/baptisteArno/typebot.io/commit/9b1ff8461cb40aa8ac28f391a73ca67311924012)]
- 🐛 Fix webhook default timeout and unoptimized json parser ([#1492](https://github.com/baptisteArno/typebot.io/issues/1492)) [[7d70f02](https://github.com/baptisteArno/typebot.io/commit/7d70f0243bc9a8a861346648c8ba4a3079add9c8)]

### Content

- 📝 (whatsapp) Add position collection example [[e755f08](https://github.com/baptisteArno/typebot.io/commit/e755f08b403cdb4193ce93b1bb02098444f99a89)]
- 📝 (openai) Add Ask Assistant video demo [[86441a5](https://github.com/baptisteArno/typebot.io/commit/86441a5337c3d78d511a441274d0bd752abb73ce)]
- 📝 Add &#x27;best chatbot for wordpress&#x27; blog post ([#1489](https://github.com/baptisteArno/typebot.io/issues/1489)) [[3b3e3fd](https://github.com/baptisteArno/typebot.io/commit/3b3e3fd79245410c6ee34bbc116d50017173cf24)]

### Internal

- 🔒 Use vm instead of Function in Node.js ([#1509](https://github.com/baptisteArno/typebot.io/issues/1509)) [[75c44d6](https://github.com/baptisteArno/typebot.io/commit/75c44d61d5ac249b3bc5dda6fd14f5b234593b74)]
- ♻️ (templates) Update variables isSession props [[218f689](https://github.com/baptisteArno/typebot.io/commit/218f6892690da5c2cb58c4c470b3b8009e6a24f5)]


<a name="2.25.0"></a>
## 2.25.0 (2024-05-01)

### New features

- ✨ (templates) New &quot;Hight ticket follow up&quot; template [[a45e8ec](https://github.com/baptisteArno/typebot.io/commit/a45e8ec8a8e4812bdb20e3ece450fbb5fad96beb)]
- ✨ (theme) Add container theme options: border, shadow, filter ([#1436](https://github.com/baptisteArno/typebot.io/issues/1436)) [[5c3c7c2](https://github.com/baptisteArno/typebot.io/commit/5c3c7c2b640f16788c5ba8816b9262a04d556523)]

### UI/UX Improvements

- 🚸 Fix auto scroll behavior [[0a7d598](https://github.com/baptisteArno/typebot.io/commit/0a7d598a35903c5e913b5133d687e66d0d16f106)]
- 🚸 Improve auto scroll behavior [[a7fc413](https://github.com/baptisteArno/typebot.io/commit/a7fc41316c0f35d63bc0954ec5c38d953bb1be4f)]
- 💄 Show send icon by default on textboxes [[873ba0b](https://github.com/baptisteArno/typebot.io/commit/873ba0bfda84e602d4617542106c77c8afd098e6)]
- 🚸 Improve auto scroll behavior [[5aad10e](https://github.com/baptisteArno/typebot.io/commit/5aad10e937c4c06035dfa1276cfcbd46889f9f42)]
- ⚡ Remove empty strings from variable parsing when possible [[3ca1a2f](https://github.com/baptisteArno/typebot.io/commit/3ca1a2f0d6bfa8f4e268cf55068ddf483f16fcf8)]
- 🚸 (whatsapp) Avoid multiple replies to be sent concurently [[7bec58e](https://github.com/baptisteArno/typebot.io/commit/7bec58e745c7d1812d1cc404a318310f146e651b)]
- 🚸 Improve zapier, make.com block content feedback [[75cd141](https://github.com/baptisteArno/typebot.io/commit/75cd1411388db8ed69f8de3e996d8b3c1febd99a)]
- ⚡ (phoneInput) Add missing Dominican Republic dial codes [[d608a30](https://github.com/baptisteArno/typebot.io/commit/d608a30e477cf847ef7cd7ad7cf2bf5dabccb2d4)]
- ⚡ (wordpress) Add the lib_version attribute to wp admin panel [[f550870](https://github.com/baptisteArno/typebot.io/commit/f5508701fc95c71badae8f8e0576992d636fa536)]
- 🚸 (payment) Improve payment default currency be… [[6594c56](https://github.com/baptisteArno/typebot.io/commit/6594c56adf91daca3a78df0e567750b470ca7410)]
- 🚸 (dify) Only save Conversation ID when not emp… [[ccc7101](https://github.com/baptisteArno/typebot.io/commit/ccc7101dd3b60f1632638108eebc8cae6e794164)]
- 💄 Fix image bubble distortion on Safari [[2f84b10](https://github.com/baptisteArno/typebot.io/commit/2f84b102b0cb3aaad05ce75e7a711a2690acc70b)]
- 🚸 (dify) Auto convert non-md links to md flavoured links [[68ad0f2](https://github.com/baptisteArno/typebot.io/commit/68ad0f2d4c4f3bef455918834737b6d50c3c4928)]
- 🚸 On chat state recover, don&#x27;t execute client side actions [[3aee9e7](https://github.com/baptisteArno/typebot.io/commit/3aee9e7fc8138b700a7f961cfae61c7b39e87d56)]

### Fixed

- 🐛 (httpReq) Properly parse big ints [[7efb79d](https://github.com/baptisteArno/typebot.io/commit/7efb79d58196b1a787c282fb2f787dde0a7c1b86)]
- 🐛 (openai) Fix streaming for legacy OpenAI block config [[49c1c0e](https://github.com/baptisteArno/typebot.io/commit/49c1c0efb29496f5a6c3b3b801419a464e2b2871)]
- ✏️ Fix typo in self-hosting troubleshooting ([#1478](https://github.com/baptisteArno/typebot.io/issues/1478)) [[1c84d29](https://github.com/baptisteArno/typebot.io/commit/1c84d296ca2e0c92c7a021f0abcba49181baabea)]
- 🐛 (forge) Fix CLI auth gen [[72a5f4a](https://github.com/baptisteArno/typebot.io/commit/72a5f4a3002ba4ca7a25def3da5ce2e66b1a2a1d)]
- 🐛 (openai) Fix ask assistant not correctly referencing uploaded f… ([#1469](https://github.com/baptisteArno/typebot.io/issues/1469)) [[dc1929e](https://github.com/baptisteArno/typebot.io/commit/dc1929e15b5f85079c31bab59a7d7d8ac14c86cc)]
- 🐛 Fix bug when removing first message from create chat comp a… [[bc50d62](https://github.com/baptisteArno/typebot.io/commit/bc50d62cf61a850dd10ffb1012aa687474d7fa4d)]
- 🐛 (bot) Fix svg images not being displayed [[c75148c](https://github.com/baptisteArno/typebot.io/commit/c75148c800487b74dd77c7e67c8f5aea199432f5)]
- 🐛 (dify) Fix conversation ID being overwritten randomly [[7f39d5a](https://github.com/baptisteArno/typebot.io/commit/7f39d5ac79ed52a1286b09197c1b1fe5554ad455)]
- 💚 Update lock file [[a09ccd1](https://github.com/baptisteArno/typebot.io/commit/a09ccd15c1a50ba476b23d1a8dad6a0a9087f14e)]
- 🐛 (whatsapp) Enable custom embed blocks [[af01439](https://github.com/baptisteArno/typebot.io/commit/af014394da73729c180c75ae7d036472e23a278f)]
- 🐛 Fix input background not properly set [[94539e8](https://github.com/baptisteArno/typebot.io/commit/94539e8ed38558defe9a31b33344d561c926c8e4)]
- 🐛 (whatsapp) Fix media download [[7e3e05f](https://github.com/baptisteArno/typebot.io/commit/7e3e05fcb2e404340bec60c92993d20f835e9609)]
- 🐛 Fix border color not changing [[dcd3eaa](https://github.com/baptisteArno/typebot.io/commit/dcd3eaa6fdc810e80cbb7e1d2951704f9ae35ae2)]
- 🚑 (condition) Fix not contains condition on list variable [[4982400](https://github.com/baptisteArno/typebot.io/commit/4982400a4f011d0db65f653f4e69bf57297251a2)]
- 🚑 Fix clientSideAction streaming stuck when it contains … [[f9bdcdc](https://github.com/baptisteArno/typebot.io/commit/f9bdcdc7a3e6f83d6c8e193ac822dbd375a5bbab)]
- 🐛 Fix invalid format for code blocks in streaming bubble [[db6d258](https://github.com/baptisteArno/typebot.io/commit/db6d2582fcf00384e726024e8ea8fbf76ae883ec)]
- 🐛 Fix streaming text selection ([#1444](https://github.com/baptisteArno/typebot.io/issues/1444)) [[3f36780](https://github.com/baptisteArno/typebot.io/commit/3f367800df32170fae0eb0b634b7fb3a669026da)]
- 🐛 (condition) Improve contains/not contains on list input [[cae7be4](https://github.com/baptisteArno/typebot.io/commit/cae7be423a3aa6e7636c794e803d91da5cbd0c4d)]
- 🐛 (buttons) Improve buttons matching when dynamic [[d194fbe](https://github.com/baptisteArno/typebot.io/commit/d194fbec4580e89c1c3f3a955f41a1882db6dd07)]
- 🐛 Wipe chat state from storage if disabled [[7d6cf2a](https://github.com/baptisteArno/typebot.io/commit/7d6cf2ad546837efc67b9b7de9a80d0f9485024f)]
- 🐛 (theme) Fix progress bar background color [[51bf5b6](https://github.com/baptisteArno/typebot.io/commit/51bf5b653c90a1e448bb1d4a44cbbbef79911bf4)]
- 🐛 (theme) Fix containers disabled bg should be transparent [[408aeb4](https://github.com/baptisteArno/typebot.io/commit/408aeb4df4538f8e23d4fd677a9592ecec918025)]
- 🚑 Fix no scroll issue on mobile [[8fe856a](https://github.com/baptisteArno/typebot.io/commit/8fe856aff3c462810b1a1c524959f6ea74895e9e)]
- 🐛 Only display export flow option if user is not guest [[ae2350e](https://github.com/baptisteArno/typebot.io/commit/ae2350e167fcc4d7701ff49fc68f896ede163032)]
- 🐛 Fix ky not working due to fetch rewriting by mistral package [[ef10f69](https://github.com/baptisteArno/typebot.io/commit/ef10f69f926d57669c3d9e7b0fc34feef9a86f6f)]
- 🐛 Fix new guessApiHost in editor [[6a4a43e](https://github.com/baptisteArno/typebot.io/commit/6a4a43efb435099566407dea244efd73024a9c0e)]
- 🐛 Fix autocomplete submit [[b5dd12c](https://github.com/baptisteArno/typebot.io/commit/b5dd12c6fe52b3ae1d7a7644cf1b636420412979)]

### Content

- 📝 Add &quot;Best WhatsApp chatbot&quot; blog post ([#1475](https://github.com/baptisteArno/typebot.io/issues/1475)) [[74a0707](https://github.com/baptisteArno/typebot.io/commit/74a07074f4fc93e0bdb67662ab90846e10100234)]
- 📝 Add &quot;Lead Generation Guide&quot; article ([#1465](https://github.com/baptisteArno/typebot.io/issues/1465)) [[5d99e00](https://github.com/baptisteArno/typebot.io/commit/5d99e00f6bf2200b98c030a779ca07a139583950)]
- 📝 Add docker manual image build instructions [[6594723](https://github.com/baptisteArno/typebot.io/commit/6594723dafabc3a810a6fd847a1b44827abe11ef)]
- 📝 (blog) Improve Image MDX component [[5fb20e3](https://github.com/baptisteArno/typebot.io/commit/5fb20e36ebb46e29458c40150d406b8a36b754d8)]
- 📝 Add &quot;Top 5 Alternatives to Landbot&quot; article [[a1da5f2](https://github.com/baptisteArno/typebot.io/commit/a1da5f2cd4aafe24c84cfd729819b356580f3691)]
- 📝 Improve blog capabilities and components [[eb2001c](https://github.com/baptisteArno/typebot.io/commit/eb2001c06b9d638d47d0656b1916f46990c1ad55)]
- 📝 Add new blog structure [[6fe4e28](https://github.com/baptisteArno/typebot.io/commit/6fe4e28bc3f2d3922015a29016c01500c7f697eb)]
- 📝 Update db migration command instructions ([#1410](https://github.com/baptisteArno/typebot.io/issues/1410)) [[b6a31c2](https://github.com/baptisteArno/typebot.io/commit/b6a31c29440f2fbdb3a22fb24382c3782f51f1c7)]

### Internal

- ♻️ Improve thread id saving conditions [[40a10c7](https://github.com/baptisteArno/typebot.io/commit/40a10c72c597c02cf6fb746d8d050c62dc166301)]
- 🔧 (blog) Fix static viewer rewrites for blog posts [[fadcd3a](https://github.com/baptisteArno/typebot.io/commit/fadcd3af22ef6b50161f7fe51981ba216ea7aa21)]
- 🔧 (blog) Fix viewer rewrites for blog styles [[ccc974f](https://github.com/baptisteArno/typebot.io/commit/ccc974f5f9cb4bf06f7322ac1129bdd7a397532a)]
- 🔧 Add blog endpoint to viewer rewrites [[e4e724d](https://github.com/baptisteArno/typebot.io/commit/e4e724d4a11735c0e3d5f9b1bf44984d99000808)]
- ♻️ Migrate from got to ky ([#1416](https://github.com/baptisteArno/typebot.io/issues/1416)) [[d96f384](https://github.com/baptisteArno/typebot.io/commit/d96f384e024254b8bab7734533fdd2da2f55cba1)]
- 🔧 Remove nested prettierignore files [[7aad60c](https://github.com/baptisteArno/typebot.io/commit/7aad60c2dbd55146a7beafaa9c594e5181f1c2fb)]
- 🔧 Add embed lib auto patch script [[69446ad](https://github.com/baptisteArno/typebot.io/commit/69446ad056d0d98e9a2657420295d289553e08d4)]

### Miscellaneous

- 🐳 Fix pnpm install version [[87653f8](https://github.com/baptisteArno/typebot.io/commit/87653f8e10ef2bd29c95c99b28253cb096b7375d)]
- 🧑‍💻 (forge) Make credentials in fetch function optionnal [[988e752](https://github.com/baptisteArno/typebot.io/commit/988e75273690407ae687bea37738ed7cda30b708)]
- 🚀 (theme) Add new aqua glass theme [[fb847e1](https://github.com/baptisteArno/typebot.io/commit/fb847e17dd4c35a20a72c2571bfabfd95c94309d)]
- 🐳 Fix docker build with new prisma version [[40b16ea](https://github.com/baptisteArno/typebot.io/commit/40b16ea902bbcb6d725608e3de1d964c0f6e1c3b)]
- 🧑‍💻 Allow admin email to signup even if disabled [[b5b0788](https://github.com/baptisteArno/typebot.io/commit/b5b0788115bf3aa20b25791901fb41cb0bf80037)]


<a name="2.24.1"></a>
## 2.24.1 (2024-04-03)

### Fixed

- 🚑 (Revert stream condition for self-hosting) [[7237901](https://github.com/baptisteArno/typebot.io/commit/7237901c050548822c554cc871966a2d0dcd01d2)]
- 🐛 (editor) Fix text bubble update conflict when deleting group [[7ce6d73](https://github.com/baptisteArno/typebot.io/commit/7ce6d737f506fe1d4901b88bf364096622fb627d)]

### Content

- 📝 Add v2.24 newsletter [[af4dd95](https://github.com/baptisteArno/typebot.io/commit/af4dd956633bef2961395bd7b45a242e40985cab)]


<a name="2.24.0"></a>
## 2.24.0 (2024-04-02)

### New features

- ✨ Add operators documentation for response field components. ([#1387](https://github.com/baptisteArno/typebot.io/issues/1387)) [[2bd1cb7](https://github.com/baptisteArno/typebot.io/commit/2bd1cb7562f092fa31bb3ea0b6a9512bd1cadae4)]
- ✨ Add Anthropic block ([#1336](https://github.com/baptisteArno/typebot.io/issues/1336)) [[ecec702](https://github.com/baptisteArno/typebot.io/commit/ecec7023b9b73f96674c88bf53352764c376892c)]
- ✨ Add &quot;turn into&quot; option in block context menu [[2fb379b](https://github.com/baptisteArno/typebot.io/commit/2fb379b102a0ee215a3d802ed45b619c998b0a08)]
- ✨ Add OpenRouter block [[84d6c59](https://github.com/baptisteArno/typebot.io/commit/84d6c594af0fa9256610fc2f74669344e43aabc9)]

### UI/UX Improvements

- ⚡ (anthropic) Add sonnet and haiku models [[89dec4a](https://github.com/baptisteArno/typebot.io/commit/89dec4a6dc0ec8503bce29d7f3872f5d9957f686)]
- 🚸 (bubble) Add swipe gesture to close preview… [[1f158e7](https://github.com/baptisteArno/typebot.io/commit/1f158e78c99c8bf7c8592480cf09570b500613f6)]
- ⚡ Fix typebot drag and drop lag [[798e94a](https://github.com/baptisteArno/typebot.io/commit/798e94a8b38a5ec1036ea05383bbd129464b045c)]
- ⚡ Introduce a new high-performing standalone chat API ([#1200](https://github.com/baptisteArno/typebot.io/issues/1200)) [[2fcf83c](https://github.com/baptisteArno/typebot.io/commit/2fcf83c529dd056316e28d7bb1b0c0ef96c5e512)]
- 🚸 Auto disable whatsapp if plan does not have pro… [[7c23b95](https://github.com/baptisteArno/typebot.io/commit/7c23b958c47cb031654756eaf5cc46d6caaca1ad)]
- 🚸 (radar) Don&#x27;t show claim bot if workspace is no… [[c72052c](https://github.com/baptisteArno/typebot.io/commit/c72052cb9d09c8a6e2f1f26c73f76c1e36f4b351)]
- 🚸 Auto focus new blocks and fix text editor close callback [[a797fc0](https://github.com/baptisteArno/typebot.io/commit/a797fc074cf46b8e4b7f2ce8e4f43bc885f3b782)]
- 🚸 Remove debounce on forged block credentials… [[cdbdb35](https://github.com/baptisteArno/typebot.io/commit/cdbdb3546cb0942ef1ac94be08bdc393f8dbdda1)]
- 🚸 (editor) Fix buttons textarea size when con… [[cf73900](https://github.com/baptisteArno/typebot.io/commit/cf739000b5d48f657ebaf005162f30342de4db91)]
- 🚸 Fix select and autocomplete max width [[70cc1f0](https://github.com/baptisteArno/typebot.io/commit/70cc1f0ce3dd361550d37083509e1b8b0a4642b0)]
- 🚸 (calCom) Fix embed responsivity [[968abf5](https://github.com/baptisteArno/typebot.io/commit/968abf52430d467e853f059bb49d4b21814af906)]
- 🚸 (results) Improve time filter so that it takes into account user timezone [[f6d2b15](https://github.com/baptisteArno/typebot.io/commit/f6d2b15a16c30c867299eb162050dcb080c4fa9c)]
- 💄 Fix UI regression on editor menu button [[7e3c1e7](https://github.com/baptisteArno/typebot.io/commit/7e3c1e799984065684d417b21cbc9a874532c509)]
- 🚸 Remove 50 select items initial hard limit [[cbfc980](https://github.com/baptisteArno/typebot.io/commit/cbfc980cf5637424dec04c4ad64ac485162a62a2)]
- 🚸 (billing) Improve upgrade UX for non admin [[1f40a4d](https://github.com/baptisteArno/typebot.io/commit/1f40a4d758534de8a1364743763c29da0cb2fd8b)]
- 🚸 Add aria-label on Bubble close button ([#1344](https://github.com/baptisteArno/typebot.io/issues/1344)) [[a9daac6](https://github.com/baptisteArno/typebot.io/commit/a9daac68baa8bbc0da57a37a5ff53674afff6f44)]
- ⚡ Restore chat state when user is remembered ([#1333](https://github.com/baptisteArno/typebot.io/issues/1333)) [[0dc276c](https://github.com/baptisteArno/typebot.io/commit/0dc276c18fc1070f52f931fa033ff43977e4cf63)]
- 💄 Improve editor header responsiveness [[5dafb64](https://github.com/baptisteArno/typebot.io/commit/5dafb6496339a7885fefd0af8502d644d882966b)]
- ⚡ (calCom) Add additional notes prefill option [[0f96440](https://github.com/baptisteArno/typebot.io/commit/0f96440cf9451938891bed7cf7c6dfa60b707338)]
- 🚸 (results) Improve submitted at field parsing [[77bc138](https://github.com/baptisteArno/typebot.io/commit/77bc138c380720da08a34c3e33811db539cae819)]
- 🚸 (elevenLabs) Only show text-to-speech compatible models [[022a320](https://github.com/baptisteArno/typebot.io/commit/022a320e7e0b31ecedb97d3fab477a1a184d52f7)]
- 💄 (textEditor) Fix floating link inputs color in dark mode [[579e407](https://github.com/baptisteArno/typebot.io/commit/579e4078b98f6d0b4b88b1251018ad5c725c4844)]
- 💄 (bot) Show only loading bubble when current block only has messages [[8846cdb](https://github.com/baptisteArno/typebot.io/commit/8846cdbf6bb36d803c514bad4fd715c3fe275861)]

### Fixed

- 🐛 Fix auto filled input not submittable [[a412a31](https://github.com/baptisteArno/typebot.io/commit/a412a318c028fabbbeac776719547531a14ba51d)]
- 🐛 Fix potential infinite redirect when session is remembered [[50d515c](https://github.com/baptisteArno/typebot.io/commit/50d515cf3745f58df92b04d5d710360bc33c3cbc)]
- 🐛 (textBubble) Fix text bubble not updating when focusing on another one [[c9b7f6a](https://github.com/baptisteArno/typebot.io/commit/c9b7f6a7b635e52928e728df7efac15d2172144d)]
- 🚑 Allow for regex without slashes for retro compat [[2663ca2](https://github.com/baptisteArno/typebot.io/commit/2663ca2e1839f2b87a35da04bd13424f9d5a26f3)]
- 🐛 (conditions) Parse regex flags as well [[a0ba8c5](https://github.com/baptisteArno/typebot.io/commit/a0ba8c5c2a51668350f8a91ee077f61692090356)]
- 🐛 (conditions) Fix regex matching when starting and ending wi… [[76e7fbd](https://github.com/baptisteArno/typebot.io/commit/76e7fbd1c73a4ab4f9de237858ea5d258e0ee2b5)]
- 🐛 Fix edge dropping on condition block when all conditions ar… [[1566f01](https://github.com/baptisteArno/typebot.io/commit/1566f010f73f031fc8331d4d662b5b9f82a7c391)]
- 🐛 (bubble) Fix bubble chat height when custom size [[af941b1](https://github.com/baptisteArno/typebot.io/commit/af941b135336429fa90c0c55c4225e056e9625e9)]
- 🐛 Fix event edges display when navigating in linked typebots [[f646826](https://github.com/baptisteArno/typebot.io/commit/f6468261f519de3b56e82fc2e2282593762f286c)]
- 🐛 Fix typebot and folder name update in dashboard [[a48a211](https://github.com/baptisteArno/typebot.io/commit/a48a21150962e60db465e3ea643f86ea6820716e)]
- 🐛 (typebotLink) Fix n+1 variable fill [[c552fa7](https://github.com/baptisteArno/typebot.io/commit/c552fa7cc35a80ad70323385ec524e2dc09d8873)]
- 🚑 (stream) Fix stream for Vercel hosting [[669f550](https://github.com/baptisteArno/typebot.io/commit/669f55062bb6a90d33ee079c77782e3058d91a88)]
- 🚑 (stream) Re-enable stream on Vercel env [[8e52ee8](https://github.com/baptisteArno/typebot.io/commit/8e52ee800b856ced3d0d0e0a92527bf747475b3b)]
- 🚑 Fix embed fallback api host [[b14ee12](https://github.com/baptisteArno/typebot.io/commit/b14ee1249b4d9eff756a229b06caf0ab6650c4c4)]
- 🐛 Fix absolute URL bug with ky on backend [[e435ead](https://github.com/baptisteArno/typebot.io/commit/e435ead34d5daa5cf4430c82e180c1efa24b84f6)]
- 🐛 Fix experimental chat api enable checking [[6876b48](https://github.com/baptisteArno/typebot.io/commit/6876b486e19f8d37c4c99c93b147245f3002a0a1)]
- 🐛 (editor) Share groups clipboard state across tabs [[5b91767](https://github.com/baptisteArno/typebot.io/commit/5b9176708c844e688fe0f7895ab1580eeb36753d)]
- 💚 Remove unused helper [[97107d4](https://github.com/baptisteArno/typebot.io/commit/97107d4121f2fe56c431137f3946032ce435a56d)]
- 🐛 (pictureChoice) Fix dynamic image only variable saving [[9c86c5e](https://github.com/baptisteArno/typebot.io/commit/9c86c5e76f55a4ca57b322916f27c005ef229b07)]
- 💚 Fix embeds build and create-block CLI [[a4c865c](https://github.com/baptisteArno/typebot.io/commit/a4c865ca26f1cfa73c524deec8a8d57ca524c044)]
- 🐛 Fix bug when adding items in array in forged block [[56a23a1](https://github.com/baptisteArno/typebot.io/commit/56a23a14b68c5768886c3c6920ea70e90bf841b4)]
- 🐛 (fileUpload) Handle duplicate names properly [[26a9282](https://github.com/baptisteArno/typebot.io/commit/26a9282c204bb39b9b30b7a50e045ba9ca983068)]
- 🐛 Fix retry message variable parsing [[782c08b](https://github.com/baptisteArno/typebot.io/commit/782c08b15e349e914ffef4da2c343e139d0ba612)]
- 🐛 (difyAi) Fix chunk parsing [[e035a54](https://github.com/baptisteArno/typebot.io/commit/e035a54cfc25736d3668001cfb54ff48bebf967b)]
- 🐛 (anthropic) Upgrade sdk to fix stream issue [[3ac211d](https://github.com/baptisteArno/typebot.io/commit/3ac211d74a21761ee860dd81523b726bff3d23f9)]
- 🐛 (bot) Fix await processClientActio… [[b53242c](https://github.com/baptisteArno/typebot.io/commit/b53242ce6a98f369be75f820eb6aff581a4d1bb4)]
- 🐛 (anthropic) Fix transform functions when response mapping has Message content [[7d11a7d](https://github.com/baptisteArno/typebot.io/commit/7d11a7dbc881c66ee84731314879928a84b2e83d)]
- 🐛 (bubble) Fix bubble bot window left overflow [[663653e](https://github.com/baptisteArno/typebot.io/commit/663653ec9a2039a25cbb240b03fcb23d068f7142)]
- 🐛 (wait) Parse wait seconds as float instead of int [[e9011ae](https://github.com/baptisteArno/typebot.io/commit/e9011aefd0f46bea908ba08248963dc2f17b9ec6)]
- 🐛 (anthropic) Fix turn into other blocks [[1202f09](https://github.com/baptisteArno/typebot.io/commit/1202f098024c407fb1b1afffdfe0847b19986d9a)]
- 🐛 (editor) Fix multiple text editor focus [[9b9282e](https://github.com/baptisteArno/typebot.io/commit/9b9282e3d97d1f8d480f9816ce65548a56551763)]
- 🐛 (editor) Fix dragging locked when window is blurred while pressing keys [[065a70e](https://github.com/baptisteArno/typebot.io/commit/065a70ea281b2202d2463370fefbbcd3ff1add88)]
- 🚑 Attempt to fix crash related to codemirror [[eaaa840](https://github.com/baptisteArno/typebot.io/commit/eaaa840cbf366ec38ea5cdd2d45944bfb0a77d49)]
- 🚑 Fix auto delete invalid edge when offsets are not loaded [[0309771](https://github.com/baptisteArno/typebot.io/commit/03097718d1b13083c6867eb7bc72939cd61aadbd)]
- 🐛 Fix board menu placement when suspected typebot banner is displayed [[4a7d10f](https://github.com/baptisteArno/typebot.io/commit/4a7d10f57868f6ec6572a3d958a5b1e1fdcb8e90)]
- 🐛 Fix progress bar crash when input is undefined [[bbeb12c](https://github.com/baptisteArno/typebot.io/commit/bbeb12cad2bad3ed9899cc04a70563ef67fdabc6)]
- 🐛 (editor) Improve edge resiliency connected to non-existant blocks [[22fe502](https://github.com/baptisteArno/typebot.io/commit/22fe50268acebd4f407f45c2603f22135c6cf652)]
- 🐛 (whatsapp) Fix auto start when first input is file [[583294f](https://github.com/baptisteArno/typebot.io/commit/583294f90c5a59b2f05f37b654ca22882daec202)]
- 🐛 Fix back button refreshing the page when typebot in folder [[59cf993](https://github.com/baptisteArno/typebot.io/commit/59cf993146df484d95a1e6e31bb9f22e472bdfc4)]
- 🐛 Fix progress bar fixed position on Bubble embed [[b05fafe](https://github.com/baptisteArno/typebot.io/commit/b05fafe518a02e4dc479e1ae8d995860aca12591)]
- 🚑 Fix invalid workspace plan check for support bubble [[8e20d90](https://github.com/baptisteArno/typebot.io/commit/8e20d90081e009fb00a8bdb5d3ef285adbc90c80)]
- 🐛 (textBubble) Fix variable with text styles unwanted break lines [[daaca9f](https://github.com/baptisteArno/typebot.io/commit/daaca9f817251e59f25e987f62a9927c80c74803)]
- 🐛 (analytics) Fix possible analytics crash when groupId can&#x27;t be found [[a043c3e](https://github.com/baptisteArno/typebot.io/commit/a043c3e4b933602a04b74576b6f15b1269ff1cfe)]
- 💚 Fix deprecated sizeLimit option type [[d8924d7](https://github.com/baptisteArno/typebot.io/commit/d8924d7f43bf2d078a3770a63dbe1934e7e9fd32)]
- 🐛 (fileUpload) Fix files deletion on result delete [[f14eb91](https://github.com/baptisteArno/typebot.io/commit/f14eb91d2a8b8731fc46e8149aba08132d44c511)]

### Content

- 📝 Split Google requirements for each APIs: auth, sheets, fonts [[f017219](https://github.com/baptisteArno/typebot.io/commit/f0172198b9231edfbe5af028f5b4d44789ac323d)]
- 📝 Add Anthropic streaming issue notice [[f6a419c](https://github.com/baptisteArno/typebot.io/commit/f6a419c119ecabe4bb2ddcb544cb6b6f07c849d2)]
- 📝 Improve get help doc [[14022fe](https://github.com/baptisteArno/typebot.io/commit/14022fe92f224361fb82ae74b21aefc53f736408)]
- 📝 Add v2.23 newsletter [[ef69b5b](https://github.com/baptisteArno/typebot.io/commit/ef69b5b77cf7ad569b326adc0b3166fea0c06bd4)]

### Internal

- 🔒 Use sanitizeUrl on redirectPath auth param ([#1389](https://github.com/baptisteArno/typebot.io/issues/1389)) [[d0be29e](https://github.com/baptisteArno/typebot.io/commit/d0be29e25732c410b561cbc3c5607c3c1d4b6c8e)]
- ♻️ Include forged blocks schema in typebot schema [[ed5096e](https://github.com/baptisteArno/typebot.io/commit/ed5096e2b6b627adeebed04aa1ee7021be70c38e)]
- ♻️ Remove @typebot.io/schemas from @typebot.io/lib [[5073be2](https://github.com/baptisteArno/typebot.io/commit/5073be2439df88bcd4275b909ad7b20120efbfa7)]
- ♻️ Use at function instead of dangerous direct lookup array index [[4ca613e](https://github.com/baptisteArno/typebot.io/commit/4ca613e83aa43de63c620afecdf3c7658be3156e)]

### Miscellaneous

- 🛂 (radar) Improve radar regex [[dbc8754](https://github.com/baptisteArno/typebot.io/commit/dbc875448b5ebf87e32d11d6caa281761ed521ad)]
- 🛂 Make sure customDomain can&#x27;t be spoofed [[a8a9259](https://github.com/baptisteArno/typebot.io/commit/a8a92594f382962ea6d97d56381851444e2f314c)]
- 🛂 Only show suspicious bot claim for no… [[001e696](https://github.com/baptisteArno/typebot.io/commit/001e696bf6978334bdfecb82e7942d6cf118e2cc)]
- 🛂 Display suspected typebot banner only if workspace is not verified [[712a565](https://github.com/baptisteArno/typebot.io/commit/712a56502f2fa25fb352db20f163cbce270d8b6e)]
- 🧑‍💻 (whatsapp) Option to modify the default interactive split message number ([#1296](https://github.com/baptisteArno/typebot.io/issues/1296)) [[df209a8](https://github.com/baptisteArno/typebot.io/commit/df209a8e9deaf673498d0b1bb68b4558b7d0ff9a)]
- 🛂 Disable direct support for Free users [[6d8a007](https://github.com/baptisteArno/typebot.io/commit/6d8a007f090616f394c41176e62d15ea050c1d9d)]


<a name="2.23.0"></a>
## 2.23.0 (2024-03-02)

### New features

- ✨ Add Together AI block ([#1304](https://github.com/baptisteArno/typebot.io/issues/1304)) [[648ec08](https://github.com/baptisteArno/typebot.io/commit/648ec08a102b6e82348250c7108c08a68943e90c)]
- ✨ (theme) Add progress bar option ([#1276](https://github.com/baptisteArno/typebot.io/issues/1276)) [[2d7ccf1](https://github.com/baptisteArno/typebot.io/commit/2d7ccf17c09bd189617577452350c53bc7ee10dc)]
- ✨ (theme) Custom font option ([#1268](https://github.com/baptisteArno/typebot.io/issues/1268)) [[7cf1a3e](https://github.com/baptisteArno/typebot.io/commit/7cf1a3e26dcae58adaafb1b9a434d37adfa7486e)]
- ✨ Add ElevenLabs block ([#1226](https://github.com/baptisteArno/typebot.io/issues/1226)) [[2f6de8e](https://github.com/baptisteArno/typebot.io/commit/2f6de8e22c120c62ee2664c2f7b3ffc0a852d1ef)]

### UI/UX Improvements

- 🚸 (whatsapp) Remove .mp4 regex restriction for video URLs [[3971e4a](https://github.com/baptisteArno/typebot.io/commit/3971e4a888a97c2017ae243c903c981e9e592900)]
- 💄 Fix dark mode timefilter dropdown in analytics page [[78d3e9b](https://github.com/baptisteArno/typebot.io/commit/78d3e9b1f2ca1553a89dd9d7209247bc63e1e70b)]
- 💄 Improve progress bar UI and make avoid starting at 0 [[229453d](https://github.com/baptisteArno/typebot.io/commit/229453d3d304abc7ff80181f3614d18f2d8f3489)]
- 🚸 (theme) Improve custom font flow by asking for font-face props directly [[33d0fcd](https://github.com/baptisteArno/typebot.io/commit/33d0fcd84224ae0da06f929bd961ca5c075dcb3d)]
- 🚸 (chatnode) Add proper error message handling [[fe98f2a](https://github.com/baptisteArno/typebot.io/commit/fe98f2a9b62e7847958a2e473197bd8522e7b002)]
- 🚸 (fileUpload) Correctly set default item for visibility [[f2b2174](https://github.com/baptisteArno/typebot.io/commit/f2b21746bc9feee276a177c9066947bb10d8b182)]
- 🚸 (buttons) Fix new buttons new line and escape behavior [[508859a](https://github.com/baptisteArno/typebot.io/commit/508859a550f6a0dbfffec2662c2e3307d6801784)]
- 🚸 (buttons) Detect multi items pasting with br… [[927feae](https://github.com/baptisteArno/typebot.io/commit/927feae32b13b87a476f73b206680dcca1c6c588)]
- 🚸 Better embed button size prop now acception … [[54f51b6](https://github.com/baptisteArno/typebot.io/commit/54f51b673758dd17b94e3494f49e2a6e4cc8e1e0)]
- 🚸 Rename &quot;webhook&quot; block to &quot;HTTP request&quot; [[33cbb2b](https://github.com/baptisteArno/typebot.io/commit/33cbb2b25436f4974070301c32702cf9a13bae5c)]
- ⚡ (setVariable) Add timezone option for dates [[3e0d3e7](https://github.com/baptisteArno/typebot.io/commit/3e0d3e7724df3924f5a57249af54bb23850930c5)]
- 🚸 (buttons) Better multiple item parsing [[07240e6](https://github.com/baptisteArno/typebot.io/commit/07240e6d4ba1778e902584a6c8f026f0eae2ccc2)]
- 🚸 (buttons) Parse clipboard items separated wi… [[5d0be9e](https://github.com/baptisteArno/typebot.io/commit/5d0be9ecd98765662c624eade366229b57c60333)]
- ⚡ (dify) Make sure Dify also works with agent assistants [[d171aa6](https://github.com/baptisteArno/typebot.io/commit/d171aa600c9349a83e0b800413634d1ae30b5a51)]
- 🚸 Fix shift key to scroll the graph horizontally [[cd488c2](https://github.com/baptisteArno/typebot.io/commit/cd488c238492c009eb9f279602b2a1adb800097b)]
- 🚸 (editor) Enable groups clipboard accross tabs [[e05580a](https://github.com/baptisteArno/typebot.io/commit/e05580a5de6862f3b5a50945f67e0179f78aa470)]
- 🚸 (url) Less strict URL validation on server [[f7d3d58](https://github.com/baptisteArno/typebot.io/commit/f7d3d58ede2eec7e0839655bd6276fa9e79cba30)]
- ⚡ (dify) Include empty files require field [[1b2876d](https://github.com/baptisteArno/typebot.io/commit/1b2876daef7d5e27b120904787a371c438a9ee08)]
- 🚸 (elevenlabs) Add set variable indication [[d91e212](https://github.com/baptisteArno/typebot.io/commit/d91e212a75c0d051e50a47f4796c5bcb604efb43)]
- 🚸 (results) Add time filter to results table as… [[066fabc](https://github.com/baptisteArno/typebot.io/commit/066fabce06d3a9fedb3bdc0bf8666bcb6e55ccb0)]
- ⚡ (rating) Add start number option in Rating block [[3e2533b](https://github.com/baptisteArno/typebot.io/commit/3e2533b93463dbe013b0298a2b73f17023ea72c7)]
- 🚸 Fix vat input size for better placeholder visibility [[2fb0a4f](https://github.com/baptisteArno/typebot.io/commit/2fb0a4fcc62463d6ae81679d8670928361ecf1c6)]
- 💄 Fix key component in tooltip for dark mode [[5e9dfaa](https://github.com/baptisteArno/typebot.io/commit/5e9dfaaa49fad3b4b821d3db57cb889c21aed0a5)]
- 🚸 (fileUpload) Add success labels cutomization [[9fc05cb](https://github.com/baptisteArno/typebot.io/commit/9fc05cb150f9d9a8ca21168a79654b437bde3a5e)]

### Fixed

- 💚 Remove unused mp4 url check [[3037771](https://github.com/baptisteArno/typebot.io/commit/3037771d1c53bf00890e95251636d77e8b1626d0)]
- 🐛 (bot) Remove SendButton disable state [[dd9b7ee](https://github.com/baptisteArno/typebot.io/commit/dd9b7eebb5abed770f17926bbf0fca146632b958)]
- 🚑 (whatsapp) Fix broken preview [[275ba1b](https://github.com/baptisteArno/typebot.io/commit/275ba1b1c40f4e79d42de7915e02fbe5ed1955b5)]
- 🐛 (chat) Enable prefilledVariables in preview mode [[9b65621](https://github.com/baptisteArno/typebot.io/commit/9b656214d1e569b1cfe0511a088b247e4c84dd6f)]
- 🐛 (theme) Fix custom bg color when type is undefined [[0b19310](https://github.com/baptisteArno/typebot.io/commit/0b193101b972c5a893a230a5ed7fccb45ac785e7)]
- 🐛 (whatsapp) Fix webhook when having 2 phone numbers in same WA account [[ce17ce5](https://github.com/baptisteArno/typebot.io/commit/ce17ce506197f6f2b928ae955f8bb6d97c30b05e)]
- ✏️ Rewrite &quot;optionnal&quot; to &quot;optional&quot; ([#1278](https://github.com/baptisteArno/typebot.io/issues/1278)) [[ddb7ac7](https://github.com/baptisteArno/typebot.io/commit/ddb7ac7915291f7065d5965e14705ed4ba5d8dcd)]
- 💚 Add &quot;next&quot; docker image metadata [[a7eb5cd](https://github.com/baptisteArno/typebot.io/commit/a7eb5cdb5de3f498ae6bce91ff1faf1fc567b359)]
- 🐛 Fix return executeCommand result [[219b229](https://github.com/baptisteArno/typebot.io/commit/219b2295b4b8c805b3d36acc0868d59eaaa562be)]
- 🐛 Allow DATABASE_URL starting with &quot;postgres://&quot; [[5879c89](https://github.com/baptisteArno/typebot.io/commit/5879c89ee6447802154674c31feb83de7a86ace6)]
- 🐛 (whatsapp) Fix image or video bubble before choice input [[18c0445](https://github.com/baptisteArno/typebot.io/commit/18c0445ac93f70712f6f2d161c7fd621c0d04abc)]
- 🐛 (dify) Fix issue when receiving &quot;event&quot; chunk [[6735ecc](https://github.com/baptisteArno/typebot.io/commit/6735eccb507bd5e742e81a9a7afa869249201695)]
- 🐛 Fix missing http request block in side bar [[f3adaa3](https://github.com/baptisteArno/typebot.io/commit/f3adaa3b28d559836a1a9941808203de949fef73)]
- 🐛 (setVariable) Fix timeZone variable parsing [[519f3aa](https://github.com/baptisteArno/typebot.io/commit/519f3aa4f94ccd2b9a14c5f34fafec54192cb35b)]
- 🐛 (editor) Fix groups graphPosition round coordinates saving [[e3470bc](https://github.com/baptisteArno/typebot.io/commit/e3470bccb1cda25c3be0b5f36faf5f408fb9bc64)]
- 🐛 (billing) Fix webhook calls when workspace was deleted [[191aeb0](https://github.com/baptisteArno/typebot.io/commit/191aeb0214e66ad56f36525f3136ad30caa09f7b)]
- 💚 Fix outdated lockfile [[4f924db](https://github.com/baptisteArno/typebot.io/commit/4f924dbb2a063850b3a76eeae03bc376000e322b)]
- 🐛 (editor) Fix changes revert when update call is long [[d653003](https://github.com/baptisteArno/typebot.io/commit/d653003d1a9d304f1f56325b55cb53cacb303b22)]
- 🐛 (dify) Fix Dify error when inputs are empty [[f5bdba5](https://github.com/baptisteArno/typebot.io/commit/f5bdba53b954bcfc0d0b85b7ccbe7040e66e9678)]
- 🐛 Fix default theme colors not appearing [[a0ab3b4](https://github.com/baptisteArno/typebot.io/commit/a0ab3b4d82b535d10f530a3fbe9e65b7d04c002f)]
- 🐛 (editor) Fix lost changes when typebot takes a long time to update [[c648947](https://github.com/baptisteArno/typebot.io/commit/c6489476f93e3e6d322fa0f9a871b4f45052fdec)]
- 🐛 (results) Fix export all results defaulting to &quot;today&quot; time frame [[396ca5b](https://github.com/baptisteArno/typebot.io/commit/396ca5bbdcba0298d098e3ace1d3e6dcb63a7e36)]
- 🐛 (docs) Fix &quot;Get stats&quot; empty api ref [[2cc1b44](https://github.com/baptisteArno/typebot.io/commit/2cc1b445982ae164a60e1ec82448dc33b5789f36)]
- 🚑 (folders) Make sure folders are not all listed in root folder [[fa2eeff](https://github.com/baptisteArno/typebot.io/commit/fa2eeff96e130c443caa0e92f7118ea365ba0fe4)]
- 🐛 (calCom) Make sure Cal.com book event is emitted once per block [[83231e6](https://github.com/baptisteArno/typebot.io/commit/83231e6f13c3664b57f088ac041a4a7b9f20dd59)]
- 🐛 (folders) Make sure to exit folder on workspace change [[c2603d9](https://github.com/baptisteArno/typebot.io/commit/c2603d99b1950ad38025e1deba51521ececa9d5e)]
- 🐛 Revert to got for user created webhook to fix function crash [[9014c4a](https://github.com/baptisteArno/typebot.io/commit/9014c4ab0905fbd2f7081a6147ee2b7c983d1936)]
- 🚑 Fix user creation crashing [[9222da6](https://github.com/baptisteArno/typebot.io/commit/9222da668143f75ec26d5f668cb33200970f0111)]
- 💚 Fix mockedUser default props [[4122d73](https://github.com/baptisteArno/typebot.io/commit/4122d739083fcbbfb670c025201b8c049f9b26d4)]
- 🐛 Make sure variables are parsed in date and picture choice options [[ce79e89](https://github.com/baptisteArno/typebot.io/commit/ce79e897a79ea2b825f2af9d3a583fd52d924c4c)]
- 🐛 (openai) Fix 400 error when tools array empty [[c616117](https://github.com/baptisteArno/typebot.io/commit/c6161179d0dbe6b37cf20b444cbb86a8c4338094)]
- 🚑 Fix inline variable parsing on new line issue [[b660611](https://github.com/baptisteArno/typebot.io/commit/b660611573710c946818a0c89b231f62481b2a21)]
- 🐛 (buttons) Make sure to parse options if button has dynamic items [[be5482c](https://github.com/baptisteArno/typebot.io/commit/be5482c89a78f41d7191a0db408313a90d2bd85f)]
- 🐛 Fix broken skippable file upload input [[3128ebd](https://github.com/baptisteArno/typebot.io/commit/3128ebd4316d392cb82a8af05ee77c155f8f55ca)]
- 🐛 Fix new markdown parser on web runtime [[678e6d5](https://github.com/baptisteArno/typebot.io/commit/678e6d5c49938ef0344c6a795353a57dbdf67bcb)]
- 💚 Move ky package to typebot.io/lib [[3e8e882](https://github.com/baptisteArno/typebot.io/commit/3e8e8829f1a4da64d6d3fb8d6ba26cda8c1cee2d)]

### Content

- 📝 Write notes about creating an issue before contributing [[60f3b13](https://github.com/baptisteArno/typebot.io/commit/60f3b1311b87bb43f573edad732c9a09cba483b7)]
- 📝 Fix secret generation broken link [[ba219b7](https://github.com/baptisteArno/typebot.io/commit/ba219b7e596b1baf55fb9449ecac470b75019dfa)]
- 📝 Remove duplicate pnpm in Vercel deploy docs ([#1261](https://github.com/baptisteArno/typebot.io/issues/1261)) [[3ddc24e](https://github.com/baptisteArno/typebot.io/commit/3ddc24e04fe54670564ae9152025292b6ecd039b)]
- 📝 Add video tuto on custom CSS on buttons [[d67ab75](https://github.com/baptisteArno/typebot.io/commit/d67ab755742efdaec1d8e0d5405b9cab3f16a774)]
- 📝 Fix openapi document filepaths ([#1241](https://github.com/baptisteArno/typebot.io/issues/1241)) [[63dc2e0](https://github.com/baptisteArno/typebot.io/commit/63dc2e062bc4ca03273743c10483dcaf7d489f6d)]
- 📝 Add typebot engine explanation video [[94c3e90](https://github.com/baptisteArno/typebot.io/commit/94c3e90fa3b41706719ca6d56937b99e3ecda2db)]
- 📝 Improve getLocation set variable snippet ([#1213](https://github.com/baptisteArno/typebot.io/issues/1213)) [[5f2ed4b](https://github.com/baptisteArno/typebot.io/commit/5f2ed4bf81de96d30cea934604a12038e17fc00d)]
- 📝 (results) Add results overview introduction [[5a7ec5c](https://github.com/baptisteArno/typebot.io/commit/5a7ec5c9215fe9e4dc6de9cacb1be6aa469e9825)]
- 📝 Add v2.22 newsletter [[272adc0](https://github.com/baptisteArno/typebot.io/commit/272adc0e248c959a8b21c7e5ded2c45bd237b946)]
- 📝 Add geo location set variable example [[11678ac](https://github.com/baptisteArno/typebot.io/commit/11678ac2fe50a92824f37decf32637784873f23b)]

### Internal

- ♻️ Re-organize telemetry package [[92a1d67](https://github.com/baptisteArno/typebot.io/commit/92a1d672fd1bd0e101e5ff2d3a99b8f45db189b6)]

### Miscellaneous

-  :monocle_face: Add deleteChatSession script [[fee6b2d](https://github.com/baptisteArno/typebot.io/commit/fee6b2d151ad6e6118e881bb79ad2ed4898cebf0)]
- 🛂 Make sure to check the domain exists before updating it on typebot [[e4d2ebe](https://github.com/baptisteArno/typebot.io/commit/e4d2ebefccc18bb3e796f8129fe0a1a370d84497)]
-  :monocle_face: Improve inspectTypebot script abort process [[eec5041](https://github.com/baptisteArno/typebot.io/commit/eec50416fb11543acd9936650256108391a67960)]
- 🧑‍💻 Improve sign up error message [[e783bb4](https://github.com/baptisteArno/typebot.io/commit/e783bb4121abc57ee809176fd2c8d60766f45fa8)]
- 🧑‍💻 Rename User ID predefined value to Result ID whic… [[8d50dc9](https://github.com/baptisteArno/typebot.io/commit/8d50dc9dfabf7d2a62a45d0454edae78d7306dbd)]
-  :monocle_face: Better inspectUser script [[5ecc6de](https://github.com/baptisteArno/typebot.io/commit/5ecc6deab750e533591f467ae708b79194ac5a7d)]
- 🧑‍💻 Allow for custom 404 system messages [[5226b06](https://github.com/baptisteArno/typebot.io/commit/5226b06fe111f8ca6c90e665e0fe5721a6488dd3)]
-  :monocle_face: Add redeemCoupon script [[5d38b44](https://github.com/baptisteArno/typebot.io/commit/5d38b4451af517c040e92a5763dd9501af999075)]
- 🧑‍💻 (whatsapp) Set default template language to en_US [[26be94d](https://github.com/baptisteArno/typebot.io/commit/26be94de374b23343b3d769d890a5bccf7465721)]
-  :monocle_face: Update add users to brevo list script [[9a36281](https://github.com/baptisteArno/typebot.io/commit/9a36281f504db4727ae6c099bd1619f7f8d276f2)]
- 🛂 (radar) Improve radar regex [[27b95c1](https://github.com/baptisteArno/typebot.io/commit/27b95c1f0b78776052a0d4e96c3326c8eaea0b78)]
- 🧑‍💻 (folders) Add folder trpc endpoints ([#1218](https://github.com/baptisteArno/typebot.io/issues/1218)) [[84b9aca](https://github.com/baptisteArno/typebot.io/commit/84b9aca40b59c39c5c98bc2d189658b7d1686fad)]


<a name="2.22.0"></a>
## 2.22.0 (2024-01-31)

### New features

- ✨ (analytics) Add time dropdown to filter analytics with a time range [[515fcaf](https://github.com/baptisteArno/typebot.io/commit/515fcafcd8e63bf5709426e8092c74985a458c43)]
- ✨ Add Dify.AI block ([#1183](https://github.com/baptisteArno/typebot.io/issues/1183)) [[0817fba](https://github.com/baptisteArno/typebot.io/commit/0817fbaebbeae60b8c8d1affb6634f0072dbba89)]
- ✨ Add Mistral AI block [[b68f16f](https://github.com/baptisteArno/typebot.io/commit/b68f16f4f7cb0fbed73ba4be32f7969d2786c496)]
- ✨ (settings) Add delay between bubbles option and typing disabling on first message [[f052b4c](https://github.com/baptisteArno/typebot.io/commit/f052b4c8052027cf31e2d926b05bf8ae592f599b)]
- ✨ (editor) Actions on multiple groups [[00dcb13](https://github.com/baptisteArno/typebot.io/commit/00dcb135f3cbbaa30a52642fe0097d003b317374)]
- ✨ (openai) Add tools and functions support ([#1167](https://github.com/baptisteArno/typebot.io/issues/1167)) [[f4d315f](https://github.com/baptisteArno/typebot.io/commit/f4d315fed5a113649c7abf70669232bf0588888c)]
- ✨ Customizable allowed origins [[8771def](https://github.com/baptisteArno/typebot.io/commit/8771def9a1d995c57c083a7c7c0571e2568f8eb7)]
- ✨ (openai) Add &quot;Ask assistant&quot; action [[03258e0](https://github.com/baptisteArno/typebot.io/commit/03258e0f64a109e0577c10186f05b1d28ee66519)]
- ✨ New QR code block ([#1142](https://github.com/baptisteArno/typebot.io/issues/1142)) [[799c694](https://github.com/baptisteArno/typebot.io/commit/799c69452230465f30a7fbd1598d520b06284ae6)]

### UI/UX Improvements

- 🚸 Enable OneDrive video url parsing [[8ad4a09](https://github.com/baptisteArno/typebot.io/commit/8ad4a0996c42939c91df99fb53161d500d8426f9)]
- 🚸 Rewrite the markdown deserializer to improve br… ([#1198](https://github.com/baptisteArno/typebot.io/issues/1198)) [[ff9c472](https://github.com/baptisteArno/typebot.io/commit/ff9c4726cc26c44aa17374835609bb762d96a37b)]
- ⚡ (fileUpload) New visibility option: &quot;Public&quot;, &quot;Private&quot; or &quot;Auto&quot; ([#1196](https://github.com/baptisteArno/typebot.io/issues/1196)) [[6215cfb](https://github.com/baptisteArno/typebot.io/commit/6215cfbbaf50ef8b7a0fd25c9fb2084a60cdd3d0)]
- 🚸 (editor) Avoid editor closing when pressing Enter [[3ab84b7](https://github.com/baptisteArno/typebot.io/commit/3ab84b755551ce7a6e91457259530e83ce331ca6)]
- ⚡ (openai) Add enum support in function tools [[8d363c0](https://github.com/baptisteArno/typebot.io/commit/8d363c0c02bcefe8ced241b210826f5afe159918)]
- 🚸 (editor) Remove blocks pointer events only in analytics [[c23e760](https://github.com/baptisteArno/typebot.io/commit/c23e760b395857bf1eef5d862b611bf3bc58423b)]
- 🚸 (openai) Make sure annotations are removed from assistant replies [[d8e2b74](https://github.com/baptisteArno/typebot.io/commit/d8e2b74f00142508c8b171391614058aa53413c8)]
- 🚸 (editor) Add graph gesture notification [[bf6c258](https://github.com/baptisteArno/typebot.io/commit/bf6c258edce51d25f81bd39a0cdeceadc65b3cf0)]
- ⚡ (editor) Improve graph pan when dragging on groups [[be74ad1](https://github.com/baptisteArno/typebot.io/commit/be74ad103aa754a7db219b71231f33742beaa89e)]
- ⚡ (openai) Enable setVariable function in tools [[42008f8](https://github.com/baptisteArno/typebot.io/commit/42008f8c18430e6194d9552b93c8ec04ec484d6e)]
- 🌐 Add it translations [[29bd5f1](https://github.com/baptisteArno/typebot.io/commit/29bd5f1539bd2d91469f6a1c2e7a098aa3f267ba)]
- ⚡ Receive WhatsApp location ([#1158](https://github.com/baptisteArno/typebot.io/issues/1158)) [[61bfe1b](https://github.com/baptisteArno/typebot.io/commit/61bfe1bb96f61e1c37532e533134b5a73edeb50f)]
- ⚡ (sheets) Reset timeout after Google Sheets execution [[a44857e](https://github.com/baptisteArno/typebot.io/commit/a44857e03b4e30b852a113aa397c54dc1f85bc38)]
- ⚡ (radar) Add radar cumulative keyword alternatives check [[0b00fa7](https://github.com/baptisteArno/typebot.io/commit/0b00fa7533b566b8a0b70b443dd0a0fd3ceece61)]
- 📱 (editor) Fix editor header responsivity [[6d7c811](https://github.com/baptisteArno/typebot.io/commit/6d7c8112bcaf5d903634f67fc41cbc47cc3f2359)]
- 🚸 (results) Add progress bar to export results modal [[5d971f7](https://github.com/baptisteArno/typebot.io/commit/5d971f7b6ff60f87a4c01144da420172c43dd24c)]
- ⚡ (calCom) Add phone prefill option [[73d68f0](https://github.com/baptisteArno/typebot.io/commit/73d68f03c1998246e1c2dedffc294414df56cf68)]
- ⚡ (whatsapp) Improve / fix markdown serializer [[244a294](https://github.com/baptisteArno/typebot.io/commit/244a29423b6d355f55c97bfc4a14ee7a1aa13633)]

### Fixed

- 🐛 Add max wait block timeout on WhatsApp runtime [[26872e2](https://github.com/baptisteArno/typebot.io/commit/26872e2bac0fe3b5ee1d0088392b67b0330911e7)]
- 🐛 Fix listing deleted bots on Zapier and Make.com [[07928c7](https://github.com/baptisteArno/typebot.io/commit/07928c743cf48f6dc1a869d5fb9566d54b99ab27)]
- 🐛 (editor) Fix dragging text bubble after editting [[1ebfc15](https://github.com/baptisteArno/typebot.io/commit/1ebfc15178ccd3177c4f91760d0841499d0d9f6f)]
- 🐛 Fix unexported Popup and Bubble from react lib [[cf101d6](https://github.com/baptisteArno/typebot.io/commit/cf101d6cf622adc339c91467cb440160010b0a8c)]
- 🐛 (share) Fix bubble button default background in embed modals [[f9e0cef](https://github.com/baptisteArno/typebot.io/commit/f9e0cef6fe99d9c99492aa79d727bfb9f4826f13)]
- 🐛 (editor) Fix single block duplication [[b668ac1](https://github.com/baptisteArno/typebot.io/commit/b668ac15f1c5429abd4a108ac79613ad4ccf04db)]
- 🐛 (setVariable) Avoid octal number evalution [[ef05b71](https://github.com/baptisteArno/typebot.io/commit/ef05b7186950e7ab650d94cb37c8d27413a6a4bc)]
- 🐛 Fix templates not properly selected sometimes [[e80f297](https://github.com/baptisteArno/typebot.io/commit/e80f297e74d488bcd5f32524c41703ad73c01358)]
- 🐛 (whatsapp) Fix first message capture regression [[32927e0](https://github.com/baptisteArno/typebot.io/commit/32927e00bfd71caa08d38cb2d3e75d7904d3b67e)]
- 🐛 (calCom) Don&#x27;t delete session if chat reply has custom embed [[5627105](https://github.com/baptisteArno/typebot.io/commit/5627105ce5800f17c18272a778cb594dda0bef2a)]
- 🐛 (webhook) Update zapier and make.com result sample parser [[233e993](https://github.com/baptisteArno/typebot.io/commit/233e99301ee7add8dc36aab75010837802e09fee)]
- 🐛 (web) Dynamic first host avatar not displaying in viewer [[98107ee](https://github.com/baptisteArno/typebot.io/commit/98107ee6369583b403549bd3e1baa4b75ed549a0)]
- 🐛 (cors) Fix cors setting when bot is origin-restricted [[d6f94d3](https://github.com/baptisteArno/typebot.io/commit/d6f94d37d8a2fcb681958e27aff550fae89a5411)]
- ✏️ Fix URL starting with postgres error message [[30d6fcc](https://github.com/baptisteArno/typebot.io/commit/30d6fcc880e4de9c6499b99c3cbff3905f17417e)]
- 🐛 (editor) Fix duplicate group unique key parsing [[1c4c058](https://github.com/baptisteArno/typebot.io/commit/1c4c058e01a90474490a2e23f3e4ad40efb011d2)]
- 🐛 (whatsapp) Fix last char slicing if new line [[5d088b1](https://github.com/baptisteArno/typebot.io/commit/5d088b1e64a238a42245341d8f92d4adb7b7d48d)]
- 🐛 (whatsapp) Fix inline variable serializing [[9b5b277](https://github.com/baptisteArno/typebot.io/commit/9b5b277b5bc72021c43d6da982e95964c14d7a03)]

### Content

- 📝 Add notice for WhatsApp mismatch numbers in preview [[f0cfc20](https://github.com/baptisteArno/typebot.io/commit/f0cfc20eb74e8bf723b0a35db364404383052419)]
- 📝 Add env WHATSAPP_CLOUD_API_URL to possible change https://gr… ([#1170](https://github.com/baptisteArno/typebot.io/issues/1170)) [[47af9a9](https://github.com/baptisteArno/typebot.io/commit/47af9a9a5949e81c5e2f53e55acde89c731a9621)]
- 📝 Add report abuse doc [[8998276](https://github.com/baptisteArno/typebot.io/commit/8998276eac6b49c3baa1bedf059d8744d67b0e23)]
- 📝 (settings) Update wait between messages instruction [[7e9c67a](https://github.com/baptisteArno/typebot.io/commit/7e9c67a47c6e13c012caa6745ff91f49f8cac8d1)]
- 📝 Fix graph pan keys typo [[d85a03f](https://github.com/baptisteArno/typebot.io/commit/d85a03f621cfec75d82677dbc9bb4d02050cb719)]
- 📝 Add Framer embed instructions [[8283179](https://github.com/baptisteArno/typebot.io/commit/8283179ca6727a97e6d8a3a8f30f4f8beb579bf3)]
- 📝 Add warning on manual deployment guide saying that it&#x27;s not for local [[07d349e](https://github.com/baptisteArno/typebot.io/commit/07d349eb754e88fa2766f5ac289e961e0a07cda1)]
- 📝 Add auth callback URL info in custom oauth config [[218abcb](https://github.com/baptisteArno/typebot.io/commit/218abcbc8909e3215628f5b9272f0278cc5169dd)]
- 📝 (sheets) Add additional insights to debug sheets not showing [[3610287](https://github.com/baptisteArno/typebot.io/commit/36102876cebb4f6058ddbe7fc430a1e48b5a8cbc)]
- 📝 (makeCome) Move the return data section above video [[b2f8cd4](https://github.com/baptisteArno/typebot.io/commit/b2f8cd44b8f943685952b403bd0bbac2b937e54c)]
- 📝 Add cal.com incompatible with whatsapp ([#1152](https://github.com/baptisteArno/typebot.io/issues/1152)) [[12af712](https://github.com/baptisteArno/typebot.io/commit/12af7129481873d751edd99f81717ace8b236a72)]
- 📝 (variables) Add &quot;valid value types&quot; section [[e95e31e](https://github.com/baptisteArno/typebot.io/commit/e95e31e22c8d6cfa039ffba0447b2fd1b2f5ecf5)]
- 📝 Add analytics doc [[006b9d6](https://github.com/baptisteArno/typebot.io/commit/006b9d665845404413db0595419e82b253f8cda3)]
- 📝 Add a note on where to find resultId [[2385eaf](https://github.com/baptisteArno/typebot.io/commit/2385eaf7d52a92ad64640690b43e21f749f7a431)]

### Internal

- ♻️ Change overflow:scroll to overflow:auto [[ab01065](https://github.com/baptisteArno/typebot.io/commit/ab010657b2c9e5ff8ade643c136d8fabbadd72bb)]
- 🔧 Allow react lib to be used with v16 [[459dac4](https://github.com/baptisteArno/typebot.io/commit/459dac42240b87228b54d8e75aaca7cf56fbf39e)]

### Miscellaneous

- 🛂 (billing) Disable sub update when workspace is past due [[0f245b8](https://github.com/baptisteArno/typebot.io/commit/0f245b8e57393ab009b9f928a0f9da475e119089)]
-  👷 Update version of copied prisma files in Dockerfile ([#1186](https://github.com/baptisteArno/typebot.io/issues/1186)) [[7baaf59](https://github.com/baptisteArno/typebot.io/commit/7baaf59b528a2a31c6b61e4ad71205d9d9fffe02)]
-  :monocle_face: Add inspectChatSession script [[53e778e](https://github.com/baptisteArno/typebot.io/commit/53e778e0bbde74a236036d8bc6d9738cbd23cf84)]
- 🚀 (whatsapp) Remove beta status [[c08ab3d](https://github.com/baptisteArno/typebot.io/commit/c08ab3d0077b6301540e09f06152b11ea843f656)]
-  fix OpenAi function calling with optional parameters [[2654e72](https://github.com/baptisteArno/typebot.io/commit/2654e7277d071cebc598fd41175490ed4f3b2bbe)]
- 🛂 Enable allowed origins security to depreceated sendMessage endpoints [[b438c17](https://github.com/baptisteArno/typebot.io/commit/b438c174c44ebff12f131777a842868baf3c93a0)]
-  :monocle_face: Improve suspendWorkspace script [[14858cb](https://github.com/baptisteArno/typebot.io/commit/14858cb114e0b2c2d699855425a120cc9da6cfa6)]
-  :monocle_face: Improve inspectUser script [[1f5559f](https://github.com/baptisteArno/typebot.io/commit/1f5559fea18e0a6c1f8291271c7cb438c0110aeb)]
-  :monocle_face: Add updateUserEmail script [[409aeb1](https://github.com/baptisteArno/typebot.io/commit/409aeb12d3ab45332311026fb7dc32fae84ebeb2)]
-  :monocle_face: Add exportResults script [[69b113f](https://github.com/baptisteArno/typebot.io/commit/69b113fc85a04bc6d55045b3bb435b15ce7b323d)]
-  :monocle_face: Add inspectWorkspace script [[2b2e7c7](https://github.com/baptisteArno/typebot.io/commit/2b2e7c72f3f68ca043ee2fe237c021fb14df0cd6)]
- 🛂 (radar) Loosen cumulative keywords check [[c1c053b](https://github.com/baptisteArno/typebot.io/commit/c1c053b0d1076e5a278ede64097af4fc6de7ea6c)]
-  :monocle_face: Improve suspendWorkspace script [[311753f](https://github.com/baptisteArno/typebot.io/commit/311753fd0e2a6702d2c2390d7ae12aaaf4b8f1f4)]
- 🛂 (radar) Enable multiple RADAR_CUMULATIVE_KEYWORDS sets [[56e0342](https://github.com/baptisteArno/typebot.io/commit/56e0342e86f27609dab6ee1f3da38156d0f6c826)]
-  :monocle_face: Add more data inspection scripts [[3775919](https://github.com/baptisteArno/typebot.io/commit/37759195430a4ecd67f650991649ba5ef99a92ea)]
-  :monocle_face: Add data exploration scripts [[7d6c964](https://github.com/baptisteArno/typebot.io/commit/7d6c964a0fcafdf0edc459b4f02d43fc9e6a64e8)]


<a name="2.21.3"></a>
## 2.21.3 (2024-01-04)

### UI/UX Improvements

- ⚡ (webhook) Add custom timeout option [[34917b0](https://github.com/baptisteArno/typebot.io/commit/34917b00efdc2c06362516ac2c28773afef1f019)]

### Fixed

- 🐛 (webhook) Fix test request execution invalid timeout [[f73bc46](https://github.com/baptisteArno/typebot.io/commit/f73bc46208367e2a0db33dbd89f50108d33401e9)]
- 🐛 (webhook) Fix result parsing with same linked typebot [[d247e02](https://github.com/baptisteArno/typebot.io/commit/d247e02cad075fafa30c6eaddd70fb470c451d95)]

### Content

- 📝 Add Contribute docs [[65f4fb0](https://github.com/baptisteArno/typebot.io/commit/65f4fb0d7a869bb61593317cdea38994c6f2bd29)]

### Internal

- 🔧 Muting Vercel bot notifications for viewer [[5266be1](https://github.com/baptisteArno/typebot.io/commit/5266be1a51de49cc0c9878c302ce235d1d20fd85)]


<a name="2.21.2"></a>
## 2.21.2 (2024-01-02)

### Miscellaneous

- 🧑‍💻 (webhook) Disable webhook timeout if CHAT_API_TIM… [[e8b9ef4](https://github.com/baptisteArno/typebot.io/commit/e8b9ef4d6cdb770ba580539452780e0fd1cc57cf)]


<a name="2.21.1"></a>
## 2.21.1 (2024-01-02)

### Internal

- 🔒 (logs) Remove some logs from API response to avoid sensit… [[b5fbba7](https://github.com/baptisteArno/typebot.io/commit/b5fbba70720261da0f8ecc00beb9b93efe1369d8)]


<a name="2.21.0"></a>
## 2.21.0 (2024-01-02)

### New features

- ✨ Introducing The Forge ([#1072](https://github.com/baptisteArno/typebot.io/issues/1072)) [[5e019bb](https://github.com/baptisteArno/typebot.io/commit/5e019bbb224e96a558faee5fbcf06840e13748c9)]
- ✨ Introducing Radar, fraud detection [[4fdc1bf](https://github.com/baptisteArno/typebot.io/commit/4fdc1bfe5c7f97a0dd1ac23f6748d98c0760643a)]

### UI/UX Improvements

- 🚸 (webhook) Stringify inline code for better reliability [[1160f58](https://github.com/baptisteArno/typebot.io/commit/1160f583691704a0ff0c77717e856d1ff9c50917)]
- 🌐 Add translation keys for input blocks ([#1114](https://github.com/baptisteArno/typebot.io/issues/1114)) [[53b702e](https://github.com/baptisteArno/typebot.io/commit/53b702e8b1a061f5c678b305c0f07fb7f5d79160)]
- 🌐 Add theme tab translation keys ([#1119](https://github.com/baptisteArno/typebot.io/issues/1119)) [[5fbbe9d](https://github.com/baptisteArno/typebot.io/commit/5fbbe9d86e52f6fc8370d5fea089781e07ea3043)]
- 🌐 Improve i18n collaboration type and timeSince parsing [[f26eafd](https://github.com/baptisteArno/typebot.io/commit/f26eafd26ffa926d851d333d920a47268a4d2d39)]
- 🌐 Add templates name and description translation keys ([#1120](https://github.com/baptisteArno/typebot.io/issues/1120)) [[5124373](https://github.com/baptisteArno/typebot.io/commit/51243730713cbf3114801d44669cb0ef33c83e0c)]
- ⚡ Attempt to fix tolgee random crash due to provider not detected [[a235a7a](https://github.com/baptisteArno/typebot.io/commit/a235a7accd37720b6176fc5f0d2d029e0be425fa)]
- 🌐 Sync french translations and fix some non-sentence translations [[28b2b1a](https://github.com/baptisteArno/typebot.io/commit/28b2b1a60c8cb56c56c5cb2222d87fd391f0ce5a)]
- 🚸 (webhook) Improve header and query params parsing [[3bbaf67](https://github.com/baptisteArno/typebot.io/commit/3bbaf670a2d888fa245e4b2409e39aea997ca171)]
- ⚡ (bot) Use ky for queries in bot to improve reliability [[a653646](https://github.com/baptisteArno/typebot.io/commit/a6536461e575e14496032c84649fbb1b1d9673a0)]
- ⚡ (sheets) Use Google Drive picker and remove sensitive OAuth scope [[deab1a1](https://github.com/baptisteArno/typebot.io/commit/deab1a12e9d85f8e1c3444baadf79de1eb8b5d88)]
- ⚡ Add dynamic timeout to bot engine api [[957eaf3](https://github.com/baptisteArno/typebot.io/commit/957eaf33dd76bb8fba1741d2a42e3ff28560770a)]
- 🚸 (docs) Open community search docs results in same tab [[61f7f67](https://github.com/baptisteArno/typebot.io/commit/61f7f67bf3ecc5b9e93d657e0a6de61009055194)]

### Fixed

- 💚 Fix arm docker build out of memory error [[a44b0e9](https://github.com/baptisteArno/typebot.io/commit/a44b0e969651b6de0e40866a800a100aad6452e8)]
- ✏️ (docs) Fix docs title suffix [[6246429](https://github.com/baptisteArno/typebot.io/commit/624642974b654975ca1f4fba9fe7e095143e2cf3)]
- 🐛 Fix crash on toast show up due to tolgee provider not defined [[7804ae2](https://github.com/baptisteArno/typebot.io/commit/7804ae25726db044bf27f8f01e42c4670bcb75f4)]
- 🚑 Revert resultId optional in startChat response [[6e076e9](https://github.com/baptisteArno/typebot.io/commit/6e076e9fb8a1b5ce50aff558415690d81d58056c)]
- 🚑 Add back runtimeOptions and fix popup width option [[867e68c](https://github.com/baptisteArno/typebot.io/commit/867e68c4d9e62ac1999e0a20be0384ccabe8c838)]
- 🐛 Chatwoot widget open should not unmount bot if standard or popup [[512bb09](https://github.com/baptisteArno/typebot.io/commit/512bb092827c6d8877f8bb5271a2c36a40f91d15)]
- 🐛 (whatsapp) Fix WA preview not starting and accept audio and documents messages [[780b4de](https://github.com/baptisteArno/typebot.io/commit/780b4dee1811630107b03ee0d5509547df218fe5)]
- 🚑 Fix invalid timeout for long running integrations [[64fc59b](https://github.com/baptisteArno/typebot.io/commit/64fc59bd3a81f21c38d28ca5f226d3ed0a42c30c)]
- 🐛 (results) Fix result modal answers order [[2dec0b8](https://github.com/baptisteArno/typebot.io/commit/2dec0b88c20761a4d1b8053193ca7481b8d9a93a)]
- 🐛 (chatNode) Fix default responseMapping item run [[06b7f40](https://github.com/baptisteArno/typebot.io/commit/06b7f40924482b68045b50a3701a5440e533167b)]
- 🐛 (stream) Fix target attribute being trimmed on message stream [[bf626bb](https://github.com/baptisteArno/typebot.io/commit/bf626bb0a34d6c0f398a441f4d04d66fce23e9dc)]
- 🚑 Release new embed lib version and fix createId dep… [[fbddddc](https://github.com/baptisteArno/typebot.io/commit/fbddddcfa019121d6cadbd84458ba6e18db0b42d)]
- 🐛 Fix next/image not loading in self-hosting [[c373108](https://github.com/baptisteArno/typebot.io/commit/c373108b55ea7175ea3c1d5c2b50620008b6b78e)]
- 🐛 Fix change language not working in the editor [[0b93c2b](https://github.com/baptisteArno/typebot.io/commit/0b93c2b2390a3b19f6466ba70d737c0e45a97eba)]
- 🐛 (sheets) Init OAuth client inside a function to avoid potential conflict [[7fcc4fb](https://github.com/baptisteArno/typebot.io/commit/7fcc4fb7485cddf0cdffff59f55dea962f020d0c)]
- ✏️ Fix invalid ending comma in API instructions [[99c5aaf](https://github.com/baptisteArno/typebot.io/commit/99c5aafec13d9db9dd0d532bb30c7eae939691c0)]
- 🐛 Fix right click in bubble text editor selects the group [[32b2bb6](https://github.com/baptisteArno/typebot.io/commit/32b2bb6a945c7d5282958a7f5209b4b27dd4cd81)]
- 🐛 Fix multiple item dragged issue [[a43d047](https://github.com/baptisteArno/typebot.io/commit/a43d047f60aa34c9bf591e21fdb66b85f7ded597)]
- 🐛 (editor) Fix old typebot flash when changing the typebot [[cb87a72](https://github.com/baptisteArno/typebot.io/commit/cb87a72cca3fe7265a03bb928def114d2c14b0e2)]

### Content

- 📝 Add suggest edits button [[ed7f5c7](https://github.com/baptisteArno/typebot.io/commit/ed7f5c732829f1a8e0edd0ca1fd13a262d99cffd)]
- 📝 Migrate from Docusaurus to Mintlify ([#1115](https://github.com/baptisteArno/typebot.io/issues/1115)) [[1e5fa5a](https://github.com/baptisteArno/typebot.io/commit/1e5fa5a575a20bda66459fd17395f1b092da61f7)]
- 📝 (docs): fix typo in Unsplash description ([#1094](https://github.com/baptisteArno/typebot.io/issues/1094)) [[619a548](https://github.com/baptisteArno/typebot.io/commit/619a548fbaa8ced1ed8c50ba19d649580b5bf5a5)]
- 📝 Add node prerequisite in Contributing guide [[f64784f](https://github.com/baptisteArno/typebot.io/commit/f64784fefd399f12edcc0aaf2339f9d64b9331a0)]

### Internal

- 🔧 Add suspendWorkspace script [[2250622](https://github.com/baptisteArno/typebot.io/commit/22506223a41b23557cc57abe4d35b1fc1706c69a)]
- 🔧 Add disableRequestTimeout param for automation integrations [[cee1373](https://github.com/baptisteArno/typebot.io/commit/cee1373e6a490db97a875d9c34ada94b89e4dccc)]
- 🔧 Add anthropic to long request whitelist [[f4a0935](https://github.com/baptisteArno/typebot.io/commit/f4a0935c795dbbb9bf82f578eccfd23328137281)]
- 🔒 (radar) Add cumulative keywords auto ban [[00f8bbc](https://github.com/baptisteArno/typebot.io/commit/00f8bbc29b1e7ca33bb6b961479cfd29aebb7670)]
- 🔒 (radar) Improve scam detection by analyzing the entire typebot [[7e3edfc](https://github.com/baptisteArno/typebot.io/commit/7e3edfc0f2567d2735fcde57a5d0a58ef0aa4bf1)]
- 🔧 Update main viewer domain to typebot.co [[8819e9e](https://github.com/baptisteArno/typebot.io/commit/8819e9e56770ed26611d6f0c79fff35da09eb7d7)]
- 🔧 Update vercel.json to reflect new api path [[e2abfc6](https://github.com/baptisteArno/typebot.io/commit/e2abfc6bbc1927ee4cf5cb69bd6d20457357eb2f)]
- ♻️ Remove references to old s3 URLs [[c2fc2df](https://github.com/baptisteArno/typebot.io/commit/c2fc2df735c2fb43ad6ac0ee6c6bdcf4e2ccfe46)]

### Miscellaneous

-  Typebots page pt-BR translation ([#1121](https://github.com/baptisteArno/typebot.io/issues/1121)) [[81a70d3](https://github.com/baptisteArno/typebot.io/commit/81a70d3b70fb9c08b4414eda98049af9e9cb90b6)]
-  Add editor header translation keys ([#1110](https://github.com/baptisteArno/typebot.io/issues/1110)) [[d42e4a9](https://github.com/baptisteArno/typebot.io/commit/d42e4a9ce1e9604d46f9b1246180e50d2a61fb79)]
- 🛂 (radar) Correctly block banned IP event when signing in with oauth providers [[74f5a17](https://github.com/baptisteArno/typebot.io/commit/74f5a17de0958aadcd50fc8e0cc9b8c23c227a54)]
- 🩹 (radar) Only check existing risk if typebot was not manually checked [[3919f75](https://github.com/baptisteArno/typebot.io/commit/3919f75a366909bb3500269b50e1e8136590e5ba)]
- 🛂 (radar) Match high risk keyword when not in urls [[f2cccbd](https://github.com/baptisteArno/typebot.io/commit/f2cccbd33f77f244f0644d769018988668127f4f)]
- 🛂 (radar) Add isVerified field in workspace [[655b32e](https://github.com/baptisteArno/typebot.io/commit/655b32ef755bd689d79c31ddc3602ff49c0b0658)]
-  add specific link for ChatNode to TypeBot ([#1106](https://github.com/baptisteArno/typebot.io/issues/1106)) [[8c4eec4](https://github.com/baptisteArno/typebot.io/commit/8c4eec4b20aec40a6c7e81b2a102442ae6a2877d)]
- 🛂 Auto ban IP on suspected bot publishing ([#1095](https://github.com/baptisteArno/typebot.io/issues/1095)) [[fcfbd63](https://github.com/baptisteArno/typebot.io/commit/fcfbd6344313c8f084047f26f83c22777b6810e2)]
-  Update publishTypebot.ts [[248cee8](https://github.com/baptisteArno/typebot.io/commit/248cee886564df0f685b9fd67126c285d934f423)]
- 🛂 Hide workspace members list from guest [[c339130](https://github.com/baptisteArno/typebot.io/commit/c339130e53a466f7f2a37cfaf1c1a87da79a6498)]
- 🛂 (billing) Past due status only for unpaid invoices with additional usage [[b0d7039](https://github.com/baptisteArno/typebot.io/commit/b0d7039577249f51ddfefe1836951c09e5082854)]
- 🧑‍💻 Automatically guess env URLs for Vercel preview deploy… ([#1076](https://github.com/baptisteArno/typebot.io/issues/1076)) [[d89a1eb](https://github.com/baptisteArno/typebot.io/commit/d89a1eb32396b3f8eb87500ed8f2af63df8f49e0)]
-  Updated vercel deployment guide. ([#1075](https://github.com/baptisteArno/typebot.io/issues/1075)) [[c02e4e1](https://github.com/baptisteArno/typebot.io/commit/c02e4e141b679e487df51954a75034552841f925)]
- ⚗️ (docs) Replace Algolia search with Community Search [[c4f5df5](https://github.com/baptisteArno/typebot.io/commit/c4f5df51d56c9423a25d07dcfd7fd271b9bae575)]


<a name="2.20.0"></a>
## 2.20.0 (2023-12-04)

### New features

- ✨ Allow user to share a flow publicly and make it duplicatable [[bb41226](https://github.com/baptisteArno/typebot.io/commit/bb41226a046fe9dccd0ee04d2761c5b96d6001f4)]
- ✨ (openai) Add create speech OpenAI action [[1a44bf4](https://github.com/baptisteArno/typebot.io/commit/1a44bf4935a131010e912e9c7d0ba9127b55be83)]

### UI/UX Improvements

- ⚡ (wordpress) Add lib_version prop in shortcode [[eeac493](https://github.com/baptisteArno/typebot.io/commit/eeac4933870216017806586b9032e8af86ce75dc)]
- 🚸 (fileUpload) Properly encode commas from uploaded file urls [[8d413f0](https://github.com/baptisteArno/typebot.io/commit/8d413f0865c8688ec6999937557db1ce9dfc4f26)]
- 🚸 (redirect) Make sure the redirection is always done on top frame [[6ce43ed](https://github.com/baptisteArno/typebot.io/commit/6ce43ed26fafe85200414b83a2f192ed3977ebc6)]
- ⚡ (billing) Improve past_due workspace checking webhook [[0856c59](https://github.com/baptisteArno/typebot.io/commit/0856c59b500b62cdaa26b25f7d9a5be4a2ac8a9c)]
- 🌐 Add es and ro support [[f6ac389](https://github.com/baptisteArno/typebot.io/commit/f6ac3891f8d11089d81a3cb7be6c715460570f28)]

### Fixed

- 🐛 (share) Fix duplicate folderId issue [[8ce4e48](https://github.com/baptisteArno/typebot.io/commit/8ce4e4808d36133a49a7af8ad61665e9dbbfbc72)]
- 🐛 Fix default webhook body with multi inputs groups [[880ded9](https://github.com/baptisteArno/typebot.io/commit/880ded97d113dd70cea8a97020a30daef573567a)]
- 🚑 (pictureChoice) Fix pic choice multi select parsing [[b7ee800](https://github.com/baptisteArno/typebot.io/commit/b7ee8006494d4a681b813a4bf9ce4e9762b21fcd)]
- 💚 Update broken action-autotag package [[7f914e9](https://github.com/baptisteArno/typebot.io/commit/7f914e9b8c9afd280bd6d5f091b090fc610bce81)]
- 🐛 Fix processTelemetry endpoint not reachable [[30b09e5](https://github.com/baptisteArno/typebot.io/commit/30b09e56a405d1178018ab52bd69f5d2b7415bd2)]
- 🚑 (billing) Fix stripe webhook &quot;invoice.paid&quot; typo [[5b0073b](https://github.com/baptisteArno/typebot.io/commit/5b0073bb61301ea1370b3bf662652648b30a4225)]
- 🐛 (pictureChoice) Fix choice parsing too unrestrictive [[542e632](https://github.com/baptisteArno/typebot.io/commit/542e632472324a4c88cabee2be4f49921e5b28bb)]
- 🚑 (editor) Fix typebot update permission [[8a07392](https://github.com/baptisteArno/typebot.io/commit/8a073928211cda434246f17ba4b18fdbeec0b4ef)]
- 🐛 (chatwoot) Fix email prefill when Chatwoot contact already exist [[94886ca](https://github.com/baptisteArno/typebot.io/commit/94886ca58e684c6229f2438e66a90ff91dd79b1f)]
- ✏️ Fix typebot v7 breaking changes doc typo [[1e64a73](https://github.com/baptisteArno/typebot.io/commit/1e64a73e54c6c841ff292eecf6f2011a2be86eda)]

### Content

- 📝 Add flow share docs [[e228f68](https://github.com/baptisteArno/typebot.io/commit/e228f682f5b92b3e168a5b8fc11d7fdd1edb2af2)]
- 📝 Improve WP prefilled var explanation [[2c203f3](https://github.com/baptisteArno/typebot.io/commit/2c203f3b6d2a59ec7c71a9858678c2daab73e8bd)]
- 📝 Add new start and continue endpoints in the API runtime instructions [[993bc79](https://github.com/baptisteArno/typebot.io/commit/993bc7900ede9fa44189f88724e35852bf5fe032)]

### Internal

- 🔧 Increase builder request max size to 4MB [[4666fd8](https://github.com/baptisteArno/typebot.io/commit/4666fd8fa09052e315d54b9333557daf66e7a5c2)]
- 🔥 Remove VIEWER_URL_INTERNAL variable [[73d2e16](https://github.com/baptisteArno/typebot.io/commit/73d2e165bfa38c014d1b8ae3c5c4701b0d3e7149)]

### Miscellaneous

- 🛂 Allow app admin to read a typebot [[cf8df68](https://github.com/baptisteArno/typebot.io/commit/cf8df681868974db099ee9c5d0b0105c68d46e07)]
- 🛂 (billing) Add isPastDue field in workspace ([#1046](https://github.com/baptisteArno/typebot.io/issues/1046)) [[ca79934](https://github.com/baptisteArno/typebot.io/commit/ca79934ef5c86feaa60cde4d4bc42171149a1f15)]


<a name="2.19.1"></a>
## 2.19.1 (2023-11-17)

### UI/UX Improvements

- ♿ Show scrollbar on searchable items [[7cf64a1](https://github.com/baptisteArno/typebot.io/commit/7cf64a1abbd639ca9f45528f7b3917b93ab7e1aa)]
- 🚸 Auto scroll once picture choice images are fully loaded [[1f19eb8](https://github.com/baptisteArno/typebot.io/commit/1f19eb8763b2553feb849075eda8a3c8adec6fa9)]
- ⚡ Add maxWidth and maxHeight bubble them props [[74dd169](https://github.com/baptisteArno/typebot.io/commit/74dd169b50013ed5603e605ee01aac4dcdf5bf93)]
- ⚡ Add more video supports ([#1023](https://github.com/baptisteArno/typebot.io/issues/1023)) [[dd4de58](https://github.com/baptisteArno/typebot.io/commit/dd4de582a93132d71b8e50fc5352c997633e2671)]
- 💄 Fix multi choice checkbox UI on small screens [[60829b4](https://github.com/baptisteArno/typebot.io/commit/60829b4d0ab318651bf5ac0ee30799a21a07cbdd)]
- 🚸 (typebotLink) Make &quot;current&quot; option work like typebot links instead of jump [[64418df](https://github.com/baptisteArno/typebot.io/commit/64418df3a1bd9ff1d3832eec1ed038eef4515432)]
- ⚡ (chatwoot) Unmount Typebot embed bubble when opening chatwoot [[eed562b](https://github.com/baptisteArno/typebot.io/commit/eed562b47a04676f3067096f61ab11e6c19726bf)]

### Fixed

- 💚 Fix docker build missing ts target in schemas [[8d8b8ee](https://github.com/baptisteArno/typebot.io/commit/8d8b8ee26eac1421b59c65b00a3b06eb40a1060e)]
- 🐛 (editor) Fix AB test items not connectable [[3a47a0f](https://github.com/baptisteArno/typebot.io/commit/3a47a0fcbda4d850509ab304f15d51f3cc17e5f2)]
- 🐛 (typebotLink) Fix variables merging with new values [[e22bd7d](https://github.com/baptisteArno/typebot.io/commit/e22bd7dc9b1dc816f53d203d518d4643a958fbb7)]
- 🐛 (wordpress) Fix version mismatch for self-hosters for Standard embed as well [[eca6d20](https://github.com/baptisteArno/typebot.io/commit/eca6d207bf54499808b098a883cf399485ff3f25)]
- 🐛 Fix typebot parsing for legacy columnsWidth setting [[8d56349](https://github.com/baptisteArno/typebot.io/commit/8d563499f05a939a4deed1fea26f8397f53260f2)]
- 🐛 (fileUpload) Fix results file display if name contains comma [[bd198a4](https://github.com/baptisteArno/typebot.io/commit/bd198a4e0f0437eb5284f094e45e9af83acd3da3)]
- 🐛 (js) Fix default theme values css variables [[fd00b6f](https://github.com/baptisteArno/typebot.io/commit/fd00b6fdd56a2cbc8e7494aec680bc0bb51a4061)]
- 🐛 (billing) Set invoicing behavior to &quot;always invoice&quot; to fix double payment issue [[a1d7415](https://github.com/baptisteArno/typebot.io/commit/a1d7415227647b3fcf72652fb44dda65ce219510)]
- 🐛 (textBubble) Fix variable parsing when starting or finishing by spaces [[23625ad](https://github.com/baptisteArno/typebot.io/commit/23625ad214925db8a16128181dc25e6c2513038f)]
- 🐛 (webhook) Fix legacy webhook {{state}} body parsing [[63233eb](https://github.com/baptisteArno/typebot.io/commit/63233eb7eea6956ea2ce546b09246bb6df62c4f5)]
- 🐛 Fix theme background and font default selection [[e9a10c0](https://github.com/baptisteArno/typebot.io/commit/e9a10c078fbb3a9dd18f5f79ba83edcc72ae04f7)]
- 🐛 Sort variables to parse to fix text bubble parsing issue [[a38467e](https://github.com/baptisteArno/typebot.io/commit/a38467e5b2eb0fd2eed17a2062dd5fe93c0d0e75)]
- 🐛 (editor) Fix edge delete with undefined groupIndex [[647afdb](https://github.com/baptisteArno/typebot.io/commit/647afdb8faae73edfaffd55b0c29937ba2c87ea6)]
- 🚑 (webhook) Fix webhook execution with default method [[14a3716](https://github.com/baptisteArno/typebot.io/commit/14a37160fd7f6048f143a8a5568782a9034db1b1)]
- 🐛 (typebotLink) Fix link to first group with start event [[9bb5591](https://github.com/baptisteArno/typebot.io/commit/9bb559174ad8aabf0f3a43961f821bd78c0d436b)]
- 🚑 (zapier) Fix execute webhook endpoint too strict on block type check [[9eef166](https://github.com/baptisteArno/typebot.io/commit/9eef1665f536eae568970eb07764cd8b4e5f7f99)]
- 🚑 (editor) Fix move block with outgoing edge [[58b9e0b](https://github.com/baptisteArno/typebot.io/commit/58b9e0b3063a88a8873ac2df49b111c10efe8191)]
- 🐛 Fix default initial items in TableList [[b73ca7a](https://github.com/baptisteArno/typebot.io/commit/b73ca7a98a51d5a216730423640dc4f711d04ffc)]
- 🐛 Fix typebot publishing endpoint events parsing [[4b67f9e](https://github.com/baptisteArno/typebot.io/commit/4b67f9e2e2938dadc2c09f413f8aa51d10dd41de)]
- 🐛 (import) Fix import typebot files that does not have name field [[aceba0a](https://github.com/baptisteArno/typebot.io/commit/aceba0abd086426556f55a49f530b285c035e179)]
- 🚑 Fix parsing issue with new events field on ongoing session states [[db17a0f](https://github.com/baptisteArno/typebot.io/commit/db17a0f508a3557072b34fefaa5c6826c722eed3)]
- 🚑 Fix weird env parsing on Firefox making it crash [[eaa9b81](https://github.com/baptisteArno/typebot.io/commit/eaa9b815c40bf710d35268ed2d8d56e768299c27)]

### Content

- 📝 Update Discord invite link [[27e9c1a](https://github.com/baptisteArno/typebot.io/commit/27e9c1adb96cfde57f84e877a945fc6ae514d09b)]
- 📝 Change community URLs, introduce Discord server [[8f224e3](https://github.com/baptisteArno/typebot.io/commit/8f224e32930c931d08b4543d9254714f303b953e)]
- 📝 Add OpenAI Dialogue option in breaking change doc [[c59df18](https://github.com/baptisteArno/typebot.io/commit/c59df18f2127f8c827dbda0ef9d49a6eae70974e)]
- 📝 Add breaking changes and OpenAI block improvements docs [[df57841](https://github.com/baptisteArno/typebot.io/commit/df578417aa6a261e878f62d0c4865ef7d58f77c0)]
- 📝 Add UTM params forwarding video tutorial [[57e4540](https://github.com/baptisteArno/typebot.io/commit/57e454008e85c197ad25c78f069d4a4b97d43c6a)]

### Internal

- ♻️ Introduce typebot v6 with events ([#1013](https://github.com/baptisteArno/typebot.io/issues/1013)) [[35300ea](https://github.com/baptisteArno/typebot.io/commit/35300eaf340c9bcae41f7b004c682bb8939684ff)]

### Miscellaneous

- 🧑‍💻 (chat) Introduce startChat and continueChat endpoints [[084588a](https://github.com/baptisteArno/typebot.io/commit/084588a086c22029e53ffdef7ae1fe81d7e413b7)]
- 🛂 Reduce sendMessage serverless function max memory [[bac2393](https://github.com/baptisteArno/typebot.io/commit/bac2393b5d7d14eb871945e84f260dcca72d3f65)]
-  fix: whole page overflowing on the x axis and displaying a horizontal scrollbar ([#1011](https://github.com/baptisteArno/typebot.io/issues/1011)) [[68e4fc7](https://github.com/baptisteArno/typebot.io/commit/68e4fc71fbee9f45e2869912798304493c75b1b0)]
- 🛂 Update Cache-Control header in generatePresignedPostPolicy [[027c6ff](https://github.com/baptisteArno/typebot.io/commit/027c6ffcef30ff9f091bf9100e584efcc490976b)]
- 📦 Add strict package versioning to avoid incompatibility in workspace [[0c22d85](https://github.com/baptisteArno/typebot.io/commit/0c22d858b749c0f39eb595ad6e8f74a497abc198)]


<a name="2.19.0"></a>
## 2.19.0 (2023-11-02)

### UI/UX Improvements

- ⚡ Add cache-control header on newly uploaded files [[d1502f8](https://github.com/baptisteArno/typebot.io/commit/d1502f8300e85529f9a16e8376f83eb7ef8da556)]

### Fixed

- 🚑 Move cache control header into the post policy [[a855d85](https://github.com/baptisteArno/typebot.io/commit/a855d85d048bf7519699628d0bdf834752a54dbc)]
- ✏️ (billing) Fix plan name typo [[bdf9fae](https://github.com/baptisteArno/typebot.io/commit/bdf9faea78b61817ffbb185b4dcaa11d3b537e62)]
- 🐛 Fix formatted message in input block when input is retried [[a564181](https://github.com/baptisteArno/typebot.io/commit/a5641811a320d99867fef246786fae9980bce1d7)]
- ✏️ Fix CORSRules content typo for S3 config [[585e1d4](https://github.com/baptisteArno/typebot.io/commit/585e1d40749528bc69ffea385d2b6b21bac50ae4)]
- 🐛 (number) Fix number input validation with variables [[7586eca](https://github.com/baptisteArno/typebot.io/commit/7586ecaf139efcd3ab86a277cadd61c1a9d9c72f)]
- 🐛 Fix group duplicate new title bug [[2d1ce73](https://github.com/baptisteArno/typebot.io/commit/2d1ce73931221195c6838a384f64821fc837ccb3)]
- 💚 Fix checkAndReportChatsUsage script sending multiple emails at once [[3f7f094](https://github.com/baptisteArno/typebot.io/commit/3f7f0944e15e09c80e2b0aac9bb5100ab55a3526)]
- ✏️ Fix manual deployment doc start script typo [[a347a27](https://github.com/baptisteArno/typebot.io/commit/a347a2741d1c6671610f1f6431e8be1ab7fb3376)]
- 🐛 Fix graph flickering on high res displays ([#959](https://github.com/baptisteArno/typebot.io/issues/959)) [[f1e3836](https://github.com/baptisteArno/typebot.io/commit/f1e38361842432d0224da13379ea5b985cde555a)]

### Content

- 📝 Add text link section in text bubble doc [[b80bea1](https://github.com/baptisteArno/typebot.io/commit/b80bea11b485707e3a0bbe51549e585f957ac8bf)]
- 📝 Add webhook configuration tuto video [[3e02436](https://github.com/baptisteArno/typebot.io/commit/3e02436d30946ac8732ffbb25acf7a109f9ccff6)]

### Miscellaneous

- 🧑‍💻 Migrate to Tolgee ([#976](https://github.com/baptisteArno/typebot.io/issues/976)) [[bed8b42](https://github.com/baptisteArno/typebot.io/commit/bed8b42a2eb10bd81909ac38a6b3b51a423789c2)]
- 🧑‍💻 Fix type resolution for @typebot.io/react and nextjs [[31b3fc3](https://github.com/baptisteArno/typebot.io/commit/31b3fc311ede7885ff89ee41467308e718c92d4d)]


<a name="2.18.4"></a>
## 2.18.4 (2023-10-25)

### Fixed

- 🚑 Fix can invite new members in workspace bool [[53558dc](https://github.com/baptisteArno/typebot.io/commit/53558dc3036d9839c07f99ab511c707f8a6fb24a)]
- 🐛 (numberInput) Fix input clearing out on dot or comma press [[4b248d5](https://github.com/baptisteArno/typebot.io/commit/4b248d554f54aafef105c1dcb842e3c5e1b28d5f)]
- ✏️ Fix popup blocked toast typo [[1ff5881](https://github.com/baptisteArno/typebot.io/commit/1ff58818a9b7f90eac70680b3af07990c42363e5)]

### Miscellaneous

- 🧑‍💻 (whatsapp) Improve whatsapp start log [[c2a08c4](https://github.com/baptisteArno/typebot.io/commit/c2a08c482efc30322b308880bb377e276f9cedfb)]


<a name="2.18.3"></a>
## 2.18.3 (2023-10-23)

### UI/UX Improvements

- 🚸 (buttons) Trim items content when parsing reply for better consistency [[621fcd5](https://github.com/baptisteArno/typebot.io/commit/621fcd59f10e56e21aa01b84f03da395f711e535)]
- ⚡ (billing) Automatic usage-based billing ([#924](https://github.com/baptisteArno/typebot.io/issues/924)) [[797751b](https://github.com/baptisteArno/typebot.io/commit/797751b4185c871b79afef9827f4f9b9aae83366)]

### Fixed

- 🐛 Fixed pinch zooming mouse issue (with ctrl key) ([#940](https://github.com/baptisteArno/typebot.io/issues/940)) [[2c15662](https://github.com/baptisteArno/typebot.io/commit/2c15662ef2a21fdc40a4eaff4acb79394f1db166)]
- 🐛 Freeze body overflow when opening a Popup embed ([#937](https://github.com/baptisteArno/typebot.io/issues/937)) [[df3a17e](https://github.com/baptisteArno/typebot.io/commit/df3a17efa08696595bf0e16e4aa2b2187115638c)]
- 💚 Fix send email in CI &quot;React is not defined&quot; [[3e06d89](https://github.com/baptisteArno/typebot.io/commit/3e06d89873cd8177a54ffe2bcf75d7d3705ab854)]
- 🐛 (results) Lower the max limit in getResults endpoint to avoid payload size error [[885dcec](https://github.com/baptisteArno/typebot.io/commit/885dcecd8db922ff98c0676c44d9a25e7f7cd8d5)]
- 🚑 (billing) Fix chats pricing tiers incremental flat amou… [[6b0c263](https://github.com/baptisteArno/typebot.io/commit/6b0c263f885c091e81731230e012d33e223f0cfa)]
- 🐛 (webhook) Fix webhook response data key number parsing [[1d0aab7](https://github.com/baptisteArno/typebot.io/commit/1d0aab71f91e82bba77f73669828aae403f66d00)]

### Content

- 📝 Add bounties info in README [[a8c2deb](https://github.com/baptisteArno/typebot.io/commit/a8c2deb258589d458ed9d16cffb3e413612ba89d)]

### Internal

- ♻️ Update import contact to brevo script [[be9daee](https://github.com/baptisteArno/typebot.io/commit/be9daee63ea38533667680fe52d70abefc345f2c)]

### Miscellaneous

- 🩹 Surround logs saving in a try catch block [[b301174](https://github.com/baptisteArno/typebot.io/commit/b3011741066e283013ffba3cb6eded6a46943d5e)]
-  Fix audio content overflow in windows. ([#944](https://github.com/baptisteArno/typebot.io/issues/944)) [[eba52a5](https://github.com/baptisteArno/typebot.io/commit/eba52a5397cd2712fff71b20212283d60466943e)]


<a name="2.18.2"></a>
## 2.18.2 (2023-10-13)

### UI/UX Improvements

- ⚡ (video) Allow changing video height when resolved to an iframe [[ee685f1](https://github.com/baptisteArno/typebot.io/commit/ee685f14f3325a557dd3ef5277219fa3d6f5b4d5)]

### Fixed

- 🐛 (videoBubble) Fix youtube parsing for IDs containing a &quot;-&quot; [[ee7dfbf](https://github.com/baptisteArno/typebot.io/commit/ee7dfbf848be1b39a8e6bf5201e201015dea3c20)]
- 🐛 (textBubble) Fix overflow with long links [[9bbb30f](https://github.com/baptisteArno/typebot.io/commit/9bbb30f30d784d9d73bd04c578eef37651033cf0)]
- 🐛 Fix link parsing when using variables [[ad79178](https://github.com/baptisteArno/typebot.io/commit/ad791789ba30f57b8f26c24c8adfda76da57206c)]
- 🐛 (openai) Fix 2 openai streaming back to back [[42fd603](https://github.com/baptisteArno/typebot.io/commit/42fd6037f76c96ed0dfc0d5e66f818432e84b4f2)]
- 🚑 Fix empty bubble issue when plate element does not have a type attribute [[a48026c](https://github.com/baptisteArno/typebot.io/commit/a48026c707eb11e6e8e289075cdc0f88f6dd2f6f)]

### Content

- 📝 (openai) Add &quot;Multiple OpenAI blocks&quot; video section [[e071c81](https://github.com/baptisteArno/typebot.io/commit/e071c810aeb790d111636d513788324d0aec065b)]

### Miscellaneous

- 🐳 Force Next.js apps local hostname [[3ca5384](https://github.com/baptisteArno/typebot.io/commit/3ca5384e7f1e4818051978f77029c6ca29818bc6)]


<a name="2.18.1"></a>
## 2.18.1 (2023-10-10)

### New features

- ✨ Automatically parse markdown from variables in text bubbles [[cfc5f64](https://github.com/baptisteArno/typebot.io/commit/cfc5f641a62847ef3b38194d87f89a39daeffabd)]

### UI/UX Improvements

- 🚸 (openai) Improve streaming bubble sequence and visual [[49826d1](https://github.com/baptisteArno/typebot.io/commit/49826d1303428854a61b8d3322b3f5fc7f0c2ae0)]
- 🚸 (condition) Don&#x27;t show value in node content if operator is &quot;set&quot; or &quot;empty&quot; [[224a08b](https://github.com/baptisteArno/typebot.io/commit/224a08b93279cb6baa94d67e577484d792f596f5)]
- 💄 Better parsing of lists and code in streaming bubbles [[877a58d](https://github.com/baptisteArno/typebot.io/commit/877a58dac2428e32d545dfc3307b17bc253af237)]
- 🚸 (openai) Improve streamed message lists CSS [[b232a94](https://github.com/baptisteArno/typebot.io/commit/b232a9495ef4168db7cc49734b9d676e5784c788)]
- 🚸 (videoBubble) Reparse variable video URL to correctly detect provider [[a7b784b](https://github.com/baptisteArno/typebot.io/commit/a7b784b446e085cdfe2c240bec33940a27f8a260)]
- 🚸 (sendEmail) Rename username SMTP creds label to avoid confusion [[42ae75c](https://github.com/baptisteArno/typebot.io/commit/42ae75cb11249926983e24792291fd4704b75ab9)]

### Fixed

- 💚 Fix docker build when Sentry not enabled [[54788a8](https://github.com/baptisteArno/typebot.io/commit/54788a828ec92d8a24c580a3d29b6a450e0f65bc)]
- 🚑 Fix custom CSS sanitization [[8eb9f25](https://github.com/baptisteArno/typebot.io/commit/8eb9f2568bd6146ff45093c8c7bf2983a69e7cd6)]
- 🐛 (editor) Fix default branding settings on cre… [[258de60](https://github.com/baptisteArno/typebot.io/commit/258de60bd274c05c6783fb06b2458718a86baa04)]
- 🐛 Add no cache instructions to streamer [[4746e38](https://github.com/baptisteArno/typebot.io/commit/4746e38cb27185d3fe063eb7184c1d10f687c9a1)]
- 🐛 Enable stream again by migrating endpoint to route handler [[0ba13b4](https://github.com/baptisteArno/typebot.io/commit/0ba13b4df0febf96d900e5dc794bf42bb8092d66)]
- 🐛 New sendMessage version for the new parser [[3838ac9](https://github.com/baptisteArno/typebot.io/commit/3838ac9c3fbfa1ed85ed2390b2b3cb4a28698796)]
- 🚑 Fix text styling parsing on variables [[6f3e9e9](https://github.com/baptisteArno/typebot.io/commit/6f3e9e92512dc70849737bef2d07a78e997bf0f7)]
- 🚑 (results) Fix broken infinite scroll [[2bc9dfb](https://github.com/baptisteArno/typebot.io/commit/2bc9dfb503b52799fee84845d9ecd5d6a368dbb4)]
- 🐛 (whatsapp) Fix force create session when flow is completed at first round [[bf051be](https://github.com/baptisteArno/typebot.io/commit/bf051bebde1dfa14b759df604ded6d057b38f30c)]
- 🚑 (whatsapp) Fix start whatsapp session when user has multiple whatsapp enabled [[60c06aa](https://github.com/baptisteArno/typebot.io/commit/60c06aa9a95d4185c41f4159d08385ee9ce96ee9)]

### Content

- 📝 (s3) Add s3 configuration detailed instructions [[021cae3](https://github.com/baptisteArno/typebot.io/commit/021cae3c294e61dacb27ee87e038ca1fd9bdd1af)]
- 📝 (embed) Add note about non-embeddable websites [[15823df](https://github.com/baptisteArno/typebot.io/commit/15823df6bd24a3c71974d1609a5c33421d5c5dfb)]
- 📝 (whatsapp) Remove private beta mention [[d567bed](https://github.com/baptisteArno/typebot.io/commit/d567bede6ed3d5d8d00361aef6b33e7750b01ddf)]
- 📝 (docker) Update postgres image name [[317a15b](https://github.com/baptisteArno/typebot.io/commit/317a15b708de6c4af0f439877f2b67534b2c50c4)]
- 📝 (vercel) Add a note on function maxDuration for Hobby plans [[4d475ff](https://github.com/baptisteArno/typebot.io/commit/4d475ff009a62202e18f4db2de21d9b5ef54d6ac)]
- 📝 (whatsapp) Re-organize whatsapp overview doc [[a102d45](https://github.com/baptisteArno/typebot.io/commit/a102d45da1f195b658519fc5bb89d219caf5fd94)]

### Internal

- ♻️ Remove sentry client monitoring in viewer [[073654e](https://github.com/baptisteArno/typebot.io/commit/073654e1e0064e740260bd7dea6cee558529827f)]
- 🔥 Remove streamer Pages API endpoint [[bf1f657](https://github.com/baptisteArno/typebot.io/commit/bf1f6576421e768f5c4506c5f0610ec2b3e05ae4)]
- ♻️ (api) Auto start bot if starting with input [[9e6a1f7](https://github.com/baptisteArno/typebot.io/commit/9e6a1f7dc0c1a66b3811625b82a0b1b73aeb62ee)]

### Miscellaneous

- 🛂 Sanitize custom CSS and head code to avoid modification of lite badge [[8e54824](https://github.com/baptisteArno/typebot.io/commit/8e548248b169b31f5760d6afff809dcbda211220)]
- 🐳 Remove wait-for-it script to avoid edge cases issues [[ee800d5](https://github.com/baptisteArno/typebot.io/commit/ee800d5ba278dc897659378c7cef39ec33b4ae7b)]
- 🧑‍💻 Improve invalid environment variable insight on build fail [[8b8a23a](https://github.com/baptisteArno/typebot.io/commit/8b8a23accb4fb1d05c8dbad10faaaf0dbdeca9f8)]
- 🛂 (whatsapp) Set default whatsapp expiry to 4 hours [[a53d128](https://github.com/baptisteArno/typebot.io/commit/a53d128fb0e7aed454bfc378d2746fdc16228d3a)]
- 🛂 (whatsapp) Disable whatsapp by default on duplication [[3292ccc](https://github.com/baptisteArno/typebot.io/commit/3292cccf5110ba37ad62e468870f19dba2925529)]
- 🐳 Bump Postgres version in official docker compose file [[876625d](https://github.com/baptisteArno/typebot.io/commit/876625deb83c3061896dcac03cdbb82854c8db5c)]


<a name="2.18.0"></a>
## 2.18.0 (2023-09-29)

### New features

- ✨ (whatsapp) Add custom session expiration ([#842](https://github.com/baptisteArno/typebot.io/issues/842)) [[4f953ac](https://github.com/baptisteArno/typebot.io/commit/4f953ac272b1e2a826776f9d4cefcce63757abf1)]
- ✨ Add Zemantic AI Integration block ([#752](https://github.com/baptisteArno/typebot.io/issues/752)) [[75e4b16](https://github.com/baptisteArno/typebot.io/commit/75e4b16af0288ad4f6d7618f3439736d10fd5d87)]

### UI/UX Improvements

- 🚸 (whatsapp) Improve how the whatsapp preview behaves ([#873](https://github.com/baptisteArno/typebot.io/issues/873)) [[f016072](https://github.com/baptisteArno/typebot.io/commit/f016072e3eef021eb21d32922ce3931bc7306616)]
- 🚸 (pictureChoice) Allow dynamic picture choice with… ([#865](https://github.com/baptisteArno/typebot.io/issues/865)) [[76f4954](https://github.com/baptisteArno/typebot.io/commit/76f4954540b523733f92db5db55f4de842515971)]
- 🚸 (pictureChoice) Improve single picture choice with same titles [[d46e801](https://github.com/baptisteArno/typebot.io/commit/d46e8013d4d3e28eea099f8de8da9055d7d27723)]
- 🚸 (whatsapp) Improve upgrade plan for whatsapp notice [[ccc34b3](https://github.com/baptisteArno/typebot.io/commit/ccc34b30287cc26939d7435aae0e8773f5afa462)]
- 🚸 Better random IDs generation in setVariable [[a176e23](https://github.com/baptisteArno/typebot.io/commit/a176e23cc8c3d82c66df71b741527dd0210c5177)]
- ⚡ (setVariable) Add &quot;Environment name&quot; value in Set variable block ([#850](https://github.com/baptisteArno/typebot.io/issues/850)) [[1ca742f](https://github.com/baptisteArno/typebot.io/commit/1ca742fc0b83e7dc429872816967d767101eedb2)]
- ⚡ Auto continue bot on whatsApp if starting block is input  ([#849](https://github.com/baptisteArno/typebot.io/issues/849)) [[b81fcf0](https://github.com/baptisteArno/typebot.io/commit/b81fcf0167e332d6559e44ce409c44ce87316f55)]
- ⚡ (wordpress) Add query params exclusion support [[2307231](https://github.com/baptisteArno/typebot.io/commit/2307231d283ee6af5948ed4941ea06d7627cbdca)]
- ♿ (embed) Add aria-label to bubble button [[90cf2e9](https://github.com/baptisteArno/typebot.io/commit/90cf2e9f81ad938c068dd04ed4346910fe238a60)]
- ⚡ (whatsapp) Improve whatsApp management and media collection [[9e0109f](https://github.com/baptisteArno/typebot.io/commit/9e0109f561591db485626841856f83d13cde4246)]
- ⚡ (whatsapp) Improve WhatsApp preview management [[f626c98](https://github.com/baptisteArno/typebot.io/commit/f626c9867cb324b8546e8fca40fe8065ff36b5c4)]
- 🚸 (results) Use header id as table accessor to allow duplicate names [[61c46bc](https://github.com/baptisteArno/typebot.io/commit/61c46bcb465ff1a0fd769b02e20c981037a4dfaa)]
- ⚡ (customDomain) Add configuration modal for domain verification [[322c48c](https://github.com/baptisteArno/typebot.io/commit/322c48cddcbf348ab44850499e849d124b9adfed)]
- 🚸 (typebotLink) Make sure variables from child bots are merged if necessary [[21ad061](https://github.com/baptisteArno/typebot.io/commit/21ad061f7bcc001be884c3db033c97f7baab718d)]
- 🚸 (billing) Improve feedback when subscription is &quot;past_due&quot; [[0ccc2ef](https://github.com/baptisteArno/typebot.io/commit/0ccc2efa454e3a0f2c9b7a633b241175d4ee8dac)]
- ⚡ (analytics) Keep track of already explored blocks for drop off rate [[87fac3e](https://github.com/baptisteArno/typebot.io/commit/87fac3e9ffe68965a569d01888d277950c7732d7)]
- ⚡ (s3) Improve storage management and type safety [[fbb198a](https://github.com/baptisteArno/typebot.io/commit/fbb198af9de1e8e44184373a36973a90c8f77b5f)]
- ⚡ (date) Add min and max options to date input block [[a2e24d0](https://github.com/baptisteArno/typebot.io/commit/a2e24d08a0feba9c5c73339a0d0e0733b3b1c30c)]

### Fixed

- 🐛 (builder) Fix system color mode not syncing properly [[b31bcdf](https://github.com/baptisteArno/typebot.io/commit/b31bcdfb87d19facfc46f8800f9b562e5b615c1b)]
- 🚑 (js) Fix dependency issue preventing user to install @typebot.io/js [[59cd79a](https://github.com/baptisteArno/typebot.io/commit/59cd79a4b85195e5d3573891f8a942c639cf2fe6)]
- 🐛 (typebotLink) Fix nested typebot link pop [[cd97da2](https://github.com/baptisteArno/typebot.io/commit/cd97da2d34fcf576100d03fa30608ce26f1784c4)]
- 🐛 (whatsapp) Fix auto start input where it didn&#x27;t display next bu… ([#869](https://github.com/baptisteArno/typebot.io/issues/869)) [[f9a14c0](https://github.com/baptisteArno/typebot.io/commit/f9a14c0685826a00a1873d17baafbe950fab55e0)]
- 🐛 (whatsapp) Fix preview failing to start and wait timeo… [[e10a506](https://github.com/baptisteArno/typebot.io/commit/e10a506c9608dafd9462ea6d20d698551eb751c1)]
- 🐛 (preview) Fix always displayed start props toast [[99b0025](https://github.com/baptisteArno/typebot.io/commit/99b0025a664f951629899160f8ecea42046221b4)]
- 🐛 (pixel) Fix multiple Meta pixels tracking [[56e175b](https://github.com/baptisteArno/typebot.io/commit/56e175bda6df960f6a5f32d7fd5b5f4bdddd8d56)]
- 🚑 (fileUpload) Fix file upload in linked typebots [[7b3cbdb](https://github.com/baptisteArno/typebot.io/commit/7b3cbdb8e8a2dbdfa030ca782a186d9a449ff6d9)]
- 🐛 (bot) Fix reactivity issue when filtering single choices [[459fc4d](https://github.com/baptisteArno/typebot.io/commit/459fc4debc621cdd9f134f81443b4b9c58c93664)]
- 🚑 (billing) Fix disabled upgrade buttons [[ed60caa](https://github.com/baptisteArno/typebot.io/commit/ed60caa8060d6df4492958854f1bcd114b101b17)]
- 💚 Rename back viewer [[4673989](https://github.com/baptisteArno/typebot.io/commit/4673989104f00aeef8a68916b5b4ec55c063437e)]
- 🚑 (upload) Fix upload in embed [[85272af](https://github.com/baptisteArno/typebot.io/commit/85272af8f3c3ef9a9b8fed6161a85d1632404e9b)]
- 🚑 Fix file upload expiration issue [[9d80a3f](https://github.com/baptisteArno/typebot.io/commit/9d80a3f68b972cc649400cd7de26191c4e72e7e8)]
- 🐛 (results) Fix result modal content display [[2ce63f5](https://github.com/baptisteArno/typebot.io/commit/2ce63f5d06515f7808db0bd9abfb0bf9aeb48cbd)]
- 🐛 (payment) Fix postalCode camel case issue [[69ef41b](https://github.com/baptisteArno/typebot.io/commit/69ef41b5347c08049a88a321eaf86657f62f9490)]
- 🐛 Fix bubble icon file upload [[6548752](https://github.com/baptisteArno/typebot.io/commit/6548752b1bd29fbe3acab7efcaf4733fd80708e8)]
- 🐛 (openai) Fix models dropdown list on new block [[096262c](https://github.com/baptisteArno/typebot.io/commit/096262cff9aa6d79e75dba3b07ce91fd2c8e6794)]
- 💚 Remove defineLocale weird TS bug [[59cc450](https://github.com/baptisteArno/typebot.io/commit/59cc450fd36a646230b31c431ab6b33586aa158b)]
- 🚑 (typebotLink) Correctly pass back existing values from parent bot [[bea3332](https://github.com/baptisteArno/typebot.io/commit/bea3332c3248a9b3896c74c7fe6dbf21f4229d4e)]

### Content

- 📝 Update About page content [[129f558](https://github.com/baptisteArno/typebot.io/commit/129f5582db4e2970a7cb177ef2abb79f47159a99)]
- 📝 (typebotLink) Add instructions about shared variables and merge answers [[1a4b8bb](https://github.com/baptisteArno/typebot.io/commit/1a4b8bb8fcc3fdf9d8dfae7bc31036eea9df99c0)]
- 📝 (whatsapp) Add a &quot;Create WhatsApp app&quot; guide [[ec52fdc](https://github.com/baptisteArno/typebot.io/commit/ec52fdc0ade4fd3acb651e8eae754269ac8cb6f7)]
- 📝 Add custom domain troobleshoot section [[bad415a](https://github.com/baptisteArno/typebot.io/commit/bad415ae1ff2c9d7bfe4584e042699466a91d9a0)]
- 📝 Change googleSheets date system var name [[797685a](https://github.com/baptisteArno/typebot.io/commit/797685aa9d3de68afedc7515aaaeb6ef972d6b7c)]
- 📝 Update support contact email [[6375a24](https://github.com/baptisteArno/typebot.io/commit/6375a2425fe5c8a2296effd7136d1fe7d7667295)]
- 📝 (vercel) Add disable github workflows section [[43be38c](https://github.com/baptisteArno/typebot.io/commit/43be38cf50732ae5336f3dc651f95ab782f57c19)]

### Internal

- ♻️ Remove storage limit related code [[d7dc5fb](https://github.com/baptisteArno/typebot.io/commit/d7dc5fb5fb7bd07b477470c4941f9fc57d7f08b0)]
- ♻️ Export bot-engine code into its own package [[7d57e8d](https://github.com/baptisteArno/typebot.io/commit/7d57e8dd065c01b90c4eb03ccfdbc3b73da85c23)]
- 🔧 Add recommended vscode extensions and more settings [[eea5d82](https://github.com/baptisteArno/typebot.io/commit/eea5d82f4047534162d9c939b24399b49dc66b3f)]
- ♻️ (lp) Add back static images into landing page [[cdd3e19](https://github.com/baptisteArno/typebot.io/commit/cdd3e197557b913ea04617d9a2f9fcae9759f92e)]

### Miscellaneous

- 🛂 (whatsapp) Remove feature flag [[0e4e10c](https://github.com/baptisteArno/typebot.io/commit/0e4e10c77b0d960ce268ebe2d25600812560e733)]
- 🛂 Improve editor authorization feedback ([#856](https://github.com/baptisteArno/typebot.io/issues/856)) [[801fea8](https://github.com/baptisteArno/typebot.io/commit/801fea860a9940a6a87b6c4c147c6da6c3234df3)]
- 🛂 (fileUpload) Improve file upload size limit enforcement [[bb13c2b](https://github.com/baptisteArno/typebot.io/commit/bb13c2bd61870a8da18bcf1a00dc85d79ec1f9c9)]


<a name="2.17.2"></a>
## 2.17.2 (2023-09-07)

### Fixed

- 💚 Fix docker deployment tagging [[f14808d](https://github.com/baptisteArno/typebot.io/commit/f14808dfcb761d2a0b471f94f6dba9aaf27cd577)]
- 💚 Fix docker multi arch overwrite issue ([#779](https://github.com/baptisteArno/typebot.io/issues/779)) [[b90b6d0](https://github.com/baptisteArno/typebot.io/commit/b90b6d0b255c2ecdab8782151d714d46ae1d961b)]


<a name="2.17.1"></a>
## 2.17.1 (2023-09-06)

### UI/UX Improvements

- 🌐 Add pt_BR and more translations ([#767](https://github.com/baptisteArno/typebot.io/issues/767)) [[aaa208c](https://github.com/baptisteArno/typebot.io/commit/aaa208cef451eb58ef26003e3ed2dda8f6972107)]
- 🌐 Add i18n-ally config and upgrade next-international [[e4ece31](https://github.com/baptisteArno/typebot.io/commit/e4ece315edaff157fdd3d841f8e88ce589507015)]
- ⚡ (dateInput) Add format option and improve parsing [[9e8fa12](https://github.com/baptisteArno/typebot.io/commit/9e8fa124b5851a78ac1f544e940e84a8175e1875)]
- ⚡ (wait) Add pause option on Wait block [[111fb32](https://github.com/baptisteArno/typebot.io/commit/111fb323b11a2b94abedfd63e6faf29794226710)]
- 🚸 Make sure to add start client side action first in the list [[1ebacaa](https://github.com/baptisteArno/typebot.io/commit/1ebacaaa5db4d8f03fe28442b9c0e7a075f919ac)]
- ⚡ (openai) Add custom provider and custom models [[27a5f4e](https://github.com/baptisteArno/typebot.io/commit/27a5f4eb74f6366181c6792e3efbf615b0af79bf)]

### Fixed

- 🚑 Fix pt-BR i18n loading [[be0c619](https://github.com/baptisteArno/typebot.io/commit/be0c619316261b5290463333b9fb29e8063a69b5)]
- 🐛 Fix select text in buttons node drag [[5092e14](https://github.com/baptisteArno/typebot.io/commit/5092e142ec3f74e9594be967cfa96ebd5162b805)]
- 🚑 (openai) Fix create credentials modal not displaying [[e8eaac4](https://github.com/baptisteArno/typebot.io/commit/e8eaac45fab2d4974038a97fa46d35c362ecfd9f)]
- 🚑 (fileUpload) Fix web bot file upload input skip option [[968c5e3](https://github.com/baptisteArno/typebot.io/commit/968c5e3c95c952bbb869d137ce22ca9d94e9cfbb)]

### Content

- 📝 Add user preferences doc [[605132e](https://github.com/baptisteArno/typebot.io/commit/605132ec3c817a20a99feb82751347ef50ffa4ef)]
- 📝 Add cancel subscription doc [[a79e605](https://github.com/baptisteArno/typebot.io/commit/a79e605285e306e81dfdba03d51d7c986def5862)]

### Miscellaneous

- 🧑‍💻 (editor) Add group info in focus toolbar [[ac899b3](https://github.com/baptisteArno/typebot.io/commit/ac899b3181ddb0bfb755143a821d354ff32049ef)]
-  Docker improvements ([#760](https://github.com/baptisteArno/typebot.io/issues/760)) [[66dc570](https://github.com/baptisteArno/typebot.io/commit/66dc5705270e81938bddfc2b8df1a340a065376e)]
- 🛂 (whatsapp) Disallow test numbers as they are not unique [[60abddd](https://github.com/baptisteArno/typebot.io/commit/60abddd86e7c32a502d5cc506a5d0fb5e7910c8f)]


<a name="2.17.0"></a>
## 2.17.0 (2023-09-01)

### New features

- ✨ Add WhatsApp integration beta test ([#722](https://github.com/baptisteArno/typebot.io/issues/722)) [[b852b4a](https://github.com/baptisteArno/typebot.io/commit/b852b4af0b3ad581deb00b5d032a3db8a90b6435)]
- ✨ (api) Add CRUD typebot endpoints [[454d320](https://github.com/baptisteArno/typebot.io/commit/454d320c6b75c1e10dc5f2b43f01ebf87cf6ae13)]

### UI/UX Improvements

- 🚸 (sendEmail) Improve variable parsing in sendEmail body [[37ccb5d](https://github.com/baptisteArno/typebot.io/commit/37ccb5da5eab5aaba85c1f40c62e957137597b91)]
- 🚸 (bot) Don&#x27;t auto scroll if a text bubble was streamed [[5fb17db](https://github.com/baptisteArno/typebot.io/commit/5fb17dbf9e9c31f503e068847e14a2e2fc71381e)]
- 🚸 Skip validation if __ENV.js file does not exist [[dfcfdf2](https://github.com/baptisteArno/typebot.io/commit/dfcfdf213857995811f5e71088c1c70d07de6cfc)]
- 🚸 (whatsapp) Allow test phone numbers [[5d402d9](https://github.com/baptisteArno/typebot.io/commit/5d402d9a38650224ea5d614233a90e70f2107781)]
- 🚸 (editor) Avoid highlighting variables in text bubble if not created [[a0a7196](https://github.com/baptisteArno/typebot.io/commit/a0a719626c38dac2609716d3c9b4f46b905ddbc7)]
- 🚸 (openai) Implement retries if openai rate limit reached [[d700af1](https://github.com/baptisteArno/typebot.io/commit/d700af17e9b65cadef3dcda74d0ed4f9e1f587b6)]
- ⚡ (typebotLink) Better typebot link with merge option [[ee3b94c](https://github.com/baptisteArno/typebot.io/commit/ee3b94c35d670d4c514082d70542a2e0d50ae1c4)]
- 🚸 Improve parsing preprocessing on typebots [[0acede9](https://github.com/baptisteArno/typebot.io/commit/0acede92effdf9c2a069181e612dbdf06c1e788b)]
- 🚸 (billing) Make sure customer is not created before launching checkout page [[53dd7ba](https://github.com/baptisteArno/typebot.io/commit/53dd7ba499400aca415e1c4e5707788eb3505ad5)]
- ⚡ (customDomains) Fix custom domain update feedback [[c08e0cd](https://github.com/baptisteArno/typebot.io/commit/c08e0cdb0ac03d747f70f6983303a88ab9bbfdea)]
- 🚸 Loosen file import parsing strictness [[19fc576](https://github.com/baptisteArno/typebot.io/commit/19fc576957af972668a46a6664f560c3d6a66918)]
- ♿ (embed) Customizable preview message close button [[6786db8](https://github.com/baptisteArno/typebot.io/commit/6786db80ee00bd38c76031e45ae57bcb00d667d6)]
- 🚸 (webhook) Parse user email instead of test email for sample [[0078d6d](https://github.com/baptisteArno/typebot.io/commit/0078d6da718586ce407c5786cd9dfdf86174610e)]
- 🚸 (openai) Add payment method alert in credentials modal [[7c81d0c](https://github.com/baptisteArno/typebot.io/commit/7c81d0cbab543fbe70c464416c024ab933a0d5e5)]
- ♿ Remember last typebot viewed for support bubble [[330d399](https://github.com/baptisteArno/typebot.io/commit/330d399c42276f3b6dd015facab4f83788e35d60)]
- 🚸 (webhook) Improve deep keys parser [[9171727](https://github.com/baptisteArno/typebot.io/commit/9171727569d02d64d3adfae25a0a7e4890fe9aaf)]
- 🚸 (bot) Update reply if we get new format from backend [[af1bee8](https://github.com/baptisteArno/typebot.io/commit/af1bee8756015557f1aec44d11a9f9b1fc8fed6e)]
- 💄 (textInput) Show send icon if send label is empty [[ec0a5be](https://github.com/baptisteArno/typebot.io/commit/ec0a5be793f9b88ed617c87f517a2844432e2480)]
- 🚸 (setVariable) Rename Today setVar type to Now [[4d3f67c](https://github.com/baptisteArno/typebot.io/commit/4d3f67c75212fc90b3fc8031c84e5b39d759f83c)]
- ⚡ (audio) Add autoplay switch in settings [[037d4ce](https://github.com/baptisteArno/typebot.io/commit/037d4ce345ce545e29a81b9bb97205145fdacc34)]
- ⚡ Add API endpoint to update the typebot in ongoing chat session [[53e4bc2](https://github.com/baptisteArno/typebot.io/commit/53e4bc2b759ada4f43175493f5333dbff917dea9)]
- 🚸 (openai) Display OpenAI initial response error [[c534613](https://github.com/baptisteArno/typebot.io/commit/c5346130875365a3be287c1447ed2db8d3147809)]

### Fixed

- 🐛 Fix forced color mode localStorage sync issue [[6a0f6e4](https://github.com/baptisteArno/typebot.io/commit/6a0f6e4ef241541b215eb1966e6d5cc9e862250e)]
- 🐛 Fix persistence when user selects system color mode [[ce9ad8b](https://github.com/baptisteArno/typebot.io/commit/ce9ad8b9702bc68edb3699bde89e8cc520bcad27)]
- 🐛 Fix remembered user reset hasStarted on page refresh [[9d29a88](https://github.com/baptisteArno/typebot.io/commit/9d29a88ed3c6260d2cbbdf20398bcae2c8cae49a)]
- 🐛 (fileUpload) Make file type optionnal [[124cb8f](https://github.com/baptisteArno/typebot.io/commit/124cb8f359363259befd3ee0b5aade19194fbcde)]
- 💚 Make sure __ENV.js file is properly cached [[a1179e3](https://github.com/baptisteArno/typebot.io/commit/a1179e39343ce150a84cf0bc48446f3c321b9d9e)]
- 🐛 (embed) Make sure env.ts is not bundled in js embed lib [[da4005e](https://github.com/baptisteArno/typebot.io/commit/da4005e160bbab1622d8b667f5a851b8009cb4db)]
- 🐛 (embed) Fix env reading in embed [[5b20f41](https://github.com/baptisteArno/typebot.io/commit/5b20f414c836715e3f3791607f1e93ce258994b0)]
- 🐛 Fix delete session with client side actions [[013c7a6](https://github.com/baptisteArno/typebot.io/commit/013c7a62652a30ac8fac42b508f139049da06256)]
- 🐛 Improve parse runtime env reading function [[036b407](https://github.com/baptisteArno/typebot.io/commit/036b407a11c5151e55bf7639a0779bb66f5399b7)]
- 🚑 Set proper env defaults [[efd4600](https://github.com/baptisteArno/typebot.io/commit/efd4600b7eea86f33c39365c5269ccc727d9b8c3)]
- 💚 Add required env to github workflows [[1c680c3](https://github.com/baptisteArno/typebot.io/commit/1c680c3ef55b96c8f69104d80e7da5d3b3556223)]
- 🚑 (lp) Fix environment injection in landing page [[6dc9b28](https://github.com/baptisteArno/typebot.io/commit/6dc9b28f7ddd06621d6b13f591e0920f908b1c48)]
- 🐛 (webhook) Fix saving invalid webhook when duplicated [[a23a8c4](https://github.com/baptisteArno/typebot.io/commit/a23a8c4456d5bc63b45a8bbd5497e2d6ef0fce11)]
- 🚑 (typebotLink) Fix incoming linked typebot variables filling [[055cf03](https://github.com/baptisteArno/typebot.io/commit/055cf03703994f3d38397e82323b736e1a7821ba)]
- 🚑 Properly preprocess typebot version [[793218a](https://github.com/baptisteArno/typebot.io/commit/793218a6735c72ec2d3115b7077134f572a40e4e)]
- 🐛 (sendMessage) Correctly preprocess and parse fetched bot [[06ecdf0](https://github.com/baptisteArno/typebot.io/commit/06ecdf040e66c68e93aaaafcace032949e8c9137)]
- 🐛 Fix legacy publicId format validation [[fe54888](https://github.com/baptisteArno/typebot.io/commit/fe54888350d6e48bee26327e671662d00895c7a9)]
- 🐛 (customDomains) Transform name to lower case before validating [[83352d7](https://github.com/baptisteArno/typebot.io/commit/83352d77f5cd08c2740661dc8096d7d289f8f130)]
- 🐛 (billing) Fix cancel webhook when publishedTypebot does not exist [[6240fd9](https://github.com/baptisteArno/typebot.io/commit/6240fd982b0d923d27537ddc0e0eed3af1e9303b)]
- 🐛 Fix getUsage query abort [[dc4c19a](https://github.com/baptisteArno/typebot.io/commit/dc4c19a7550f05588c8eb0adcc53019b4d620cd2)]
- 🐛 (webhook) Fix variable list parsing in custom body [[ed77f5d](https://github.com/baptisteArno/typebot.io/commit/ed77f5d1244cc35d71ac5897c6617f93b94f5a58)]
- 🐛 Stop refresh typebot when typebotId is undefined [[e2075d6](https://github.com/baptisteArno/typebot.io/commit/e2075d6135623feb5f03344d190dedeffa397b65)]
- 🐛 Parse valid publicId even though the prefix is empty [[a4ba9a8](https://github.com/baptisteArno/typebot.io/commit/a4ba9a8a7787eeaa29705b9a4688b3dcfe18d879)]
- 🚑 Fix issue when duplicating bot losing groups [[9cfca38](https://github.com/baptisteArno/typebot.io/commit/9cfca3857e0ea34e3d9453600ad5e6ea82b01916)]
- 🐛 Remove publicId and customDomain duplication on imported bots [[304dfe2](https://github.com/baptisteArno/typebot.io/commit/304dfe2dab6d10e28d9d3f0083117b16bfbec030)]
- 🚑 Fix customDomain regex validation [[fca5865](https://github.com/baptisteArno/typebot.io/commit/fca5865999d0e6569d65443582247ada76f5f0b5)]
- 🐛 Deprecate blockId field in items [[019f72a](https://github.com/baptisteArno/typebot.io/commit/019f72ac7e3aaeead1278b4661460e8011f34da6)]
- 🐛 (editor) Fix edges connection issue when item.blockId does not match [[1cc282a](https://github.com/baptisteArno/typebot.io/commit/1cc282a5fc23f7534ee3358c9d97717a76901d24)]
- 🚑 Incorrect blockId in item when duplicating issue [[1274d25](https://github.com/baptisteArno/typebot.io/commit/1274d2581d427856509d40ad57e55f13eaf21fb5)]
- 🐛 (auth) Fix redirect URL after sign in [[d31500e](https://github.com/baptisteArno/typebot.io/commit/d31500e2e3b629371196f74867fcc752c92566b9)]
- 🐛 Normalize user inputs before comparing [[2b4ada0](https://github.com/baptisteArno/typebot.io/commit/2b4ada007d676dcf717d5b077f59738988e247c4)]
- 🚑 Add missing await on executeGroup [[2c4762b](https://github.com/baptisteArno/typebot.io/commit/2c4762b57f32e0f2748fd5ba72ed9ad0d4782605)]
- 💚 Add conditional rewrites for NEXTAUTH_URL targets [[bd9c8ea](https://github.com/baptisteArno/typebot.io/commit/bd9c8eac4c64d5d0bfbd392957a6b5fc6a6734d1)]

### Content

- 📝 Add troobleshoot section in Audio bubble doc [[baa13c3](https://github.com/baptisteArno/typebot.io/commit/baa13c3fa2862d9f53f0c8e9eb78afe5e22cddea)]
- 📝 Fix iframe&#x27;s style instruction invalid quotes [[90c8c80](https://github.com/baptisteArno/typebot.io/commit/90c8c809deb028b2582f085647602a25a74a0b09)]
- 📝 Temporarily fix docker files starter urls [[da272f2](https://github.com/baptisteArno/typebot.io/commit/da272f2f9c0041fa2f5b8ce4c1c0da8258e666c7)]
- 📝 Fix invalid custom CSS line in HTML instructions [[b74117d](https://github.com/baptisteArno/typebot.io/commit/b74117d417a315997bcca1480bd31457f17be642)]
- 📝 Add Sheets advanced example video [[27b15a0](https://github.com/baptisteArno/typebot.io/commit/27b15a0f10ec85e2e146837c00d0c7472fd52428)]
- 📝 Add redirect URL with UTM instructions [[8810aa8](https://github.com/baptisteArno/typebot.io/commit/8810aa8ddb1e4062dfe09a3c15ee53fa693cbf0a)]
- 📝 Dynamic oss-friends landing page [[1ae3029](https://github.com/baptisteArno/typebot.io/commit/1ae302984314c434a2072ea0c65261dd04eb197a)]
- 📝 (sendMessage) Improve sendMessage API ref [[f7de116](https://github.com/baptisteArno/typebot.io/commit/f7de11611ff1b86433243bc89d75a4779c25e7ce)]

### Internal

- 🔥 Remove cloudron-specific files [[3d7f778](https://github.com/baptisteArno/typebot.io/commit/3d7f778deefab2c6edf3fa4d102d13326c31c134)]
- ♻️ Move s3-related files to specific lib folder [[23b629f](https://github.com/baptisteArno/typebot.io/commit/23b629f82cfecf5656bb91c0524d9e04679454fa)]
- 🔒 Improve workspace API role filtering [[906845b](https://github.com/baptisteArno/typebot.io/commit/906845bd767f730400c97f060c8b051ca2497582)]
- 🔒 Expose minimum data to NEXT_DATA json [[de616ea](https://github.com/baptisteArno/typebot.io/commit/de616ea649f1e12599ef2c216d4e46588e6846ad)]
- 🔧 Add prettier dependency at root folder [[693631e](https://github.com/baptisteArno/typebot.io/commit/693631e076b8316e54c071e19ac7e599145426ce)]
- ♻️ (webhook) Integrate webhook in typebot schema [[fc25734](https://github.com/baptisteArno/typebot.io/commit/fc25734689b65c17f84eb03496a729dba0945ea9)]

### Miscellaneous

- 🐳 Fix docker image runtime error [[1aa0171](https://github.com/baptisteArno/typebot.io/commit/1aa017153a4108837a7ba35afe44764eb4f440c6)]
- 🛂 Send alert emails only to workspace admins [[6207edf](https://github.com/baptisteArno/typebot.io/commit/6207edfeefabd01c0ebdea62223218a159bb70e6)]
- 🧑‍💻 Improve env variables type safety and management ([#718](https://github.com/baptisteArno/typebot.io/issues/718)) [[786e5cb](https://github.com/baptisteArno/typebot.io/commit/786e5cb58267bf1f19b57ae35cf415a21e4cfa54)]
- 🛂 Check if isQuarantined can be toggled on sub update [[e62e71c](https://github.com/baptisteArno/typebot.io/commit/e62e71c13319467d0e0e05d037edcec0c3a0b95e)]
-  Fix: typo in docker-compose.build.yml ([#692](https://github.com/baptisteArno/typebot.io/issues/692)) [[f508c97](https://github.com/baptisteArno/typebot.io/commit/f508c97ee17c21ebf9833f020cf01ea3a84a2116)]
-  Use bulleseye docker image for better compatibility ([#618](https://github.com/baptisteArno/typebot.io/issues/618)) [[e9fac29](https://github.com/baptisteArno/typebot.io/commit/e9fac29886493f1e79d94afc1c20b3da3187a69d)]


<a name="2.16.0"></a>
## 2.16.0 (2023-08-01)

### New features

- ✨ Stream bubble content if placed right after Op… [[3952ae2](https://github.com/baptisteArno/typebot.io/commit/3952ae2755ac2806055072d5cfa4cd32a01693f6)]

### UI/UX Improvements

- 💄 Improve multiple choice color when image background [[ee067ce](https://github.com/baptisteArno/typebot.io/commit/ee067ceee1011d946061e9d44abcf789f1000388)]
- ⚡ (condition) Add regex comparison item [[aa9f5bc](https://github.com/baptisteArno/typebot.io/commit/aa9f5bc7322e85e625852d71a5623c16cf485420)]
- 💄 (embed) Improve avatar alignment and audio auto load [[14c3d95](https://github.com/baptisteArno/typebot.io/commit/14c3d95b8aae8897932fc1e7969c2eefe175e33c)]
- ⚡ (video) Detect youtu.be URLs for video bubbles [[e34b939](https://github.com/baptisteArno/typebot.io/commit/e34b939786dd01aa912835b4c23c747051ba28db)]
- ⚡ (paymentInput) Handle Stripe redirection [[c99298e](https://github.com/baptisteArno/typebot.io/commit/c99298e49b8dc722f7259703f22cef8dc99a919f)]
- 💄 Fix round icons color in dark mode [[4607f0e](https://github.com/baptisteArno/typebot.io/commit/4607f0ea39fd3c35ab839c902a15f6c90ed6cc8f)]
- 🚸 New dedicated onboarding page [[43555c1](https://github.com/baptisteArno/typebot.io/commit/43555c171ea48181e67defa0fa9cc5b3e22d0fea)]
- 🚸 Update onboarding bot [[283c55c](https://github.com/baptisteArno/typebot.io/commit/283c55c1a406320d2cbefb50c70ab92440f3d401)]
- ⚡ (embed) Add customizable bubble close icon [[c8bc659](https://github.com/baptisteArno/typebot.io/commit/c8bc659941ff9583299397baee33dadb5f6a2618)]
- ⚡ Replace Google fonts with Bunny fonts [[cccf905](https://github.com/baptisteArno/typebot.io/commit/cccf905d38204c466e3ae6476152a2f266ca4e06)]
- ⚡ (video) Add youtube shorts auto parsing [[1ebd528](https://github.com/baptisteArno/typebot.io/commit/1ebd528753909282adf4c15476a7ed3f4c822b76)]
- ⚡ Regroup database queries of /sendMessage in one place [[aa4c16d](https://github.com/baptisteArno/typebot.io/commit/aa4c16dad78e7e4dcd9b78f9b4916fd416da3c5f)]

### Fixed

- 🐛 (embed) Fix custom close icon placement in bubble button [[81c2e50](https://github.com/baptisteArno/typebot.io/commit/81c2e5022bec0e0a5cee75ac58a7dbe2b1e14939)]
- 🐛 Fix TextBubble &#x27;Edit Link&#x27; background color in dark mode ([#653](https://github.com/baptisteArno/typebot.io/issues/653)) [[f8af76d](https://github.com/baptisteArno/typebot.io/commit/f8af76d34799f4e26de53efee4781f703d782c34)]
- 🐛 (analytics) Fix analytics drop-off rate not computing correctly [[3df81a3](https://github.com/baptisteArno/typebot.io/commit/3df81a3cb9b9f158d940b01d02bf6f2cbedf6f0c)]
- 🐛 (embed) Remove at functions for better compability [[320cffc](https://github.com/baptisteArno/typebot.io/commit/320cffc42001399e2a646243ba9d6ab632a6f9e8)]
- 🐛 (analytics) Fix previous total computation max call stack exceeded [[7a7d471](https://github.com/baptisteArno/typebot.io/commit/7a7d4718051209ba70b6f2e2d23f4945426988fd)]
- 🐛 Fix table list when empty always show &quot;add&quot; button [[b171b39](https://github.com/baptisteArno/typebot.io/commit/b171b3960640382706ccb75f71015aac60ed3da1)]
- 🐛 (sendMessage) Return updated session in all cases [[7942ae4](https://github.com/baptisteArno/typebot.io/commit/7942ae4751703ef0599366f257a690bae9d15818)]
- 🐛 Fix bunny fonts URL path [[defe001](https://github.com/baptisteArno/typebot.io/commit/defe00155d2977cc26ac3291f6375978723865da)]
- 🐛 Add setInputValue to Typebot embed object [[6c54065](https://github.com/baptisteArno/typebot.io/commit/6c540657a610ec27bf4be6ded09db0b610c48724)]
- 🐛 Fix first-time pnpm dev [[b99b58b](https://github.com/baptisteArno/typebot.io/commit/b99b58bdfe032755da249e076eff1eb29256bb72)]
- 🐛 Fix viewer&#x27;s &#x60;.env.local.example&#x60; inline comment [[13ac469](https://github.com/baptisteArno/typebot.io/commit/13ac46975d12d8c3aac3a053ea7f612988c9b90f)]

### Content

- 📝 (openai) Add troobleshoot guide for empty message issue [[482462f](https://github.com/baptisteArno/typebot.io/commit/482462f2b10f69903754d53dccf41588cca3f701)]
- 📝 Add a guide on how to create a new block in CONTRIBUTING [[e499478](https://github.com/baptisteArno/typebot.io/commit/e499478deed7b1ac2c6c215c8e472133e28b37ab)]
- 📝 Remove old stripe env var [[b17177f](https://github.com/baptisteArno/typebot.io/commit/b17177f35f97ab679723a3dbade745f474367e53)]
- 📝 Add &quot;conditionally display button&quot; video in docs [[0c923b7](https://github.com/baptisteArno/typebot.io/commit/0c923b70a60851fb3e840820b9dc5d4714adfcb3)]
- 📝 Update README ([#632](https://github.com/baptisteArno/typebot.io/issues/632)) [[9433d3e](https://github.com/baptisteArno/typebot.io/commit/9433d3ea8f9231613d1a5a3efa3576d4e7c16b23)]
- 📝 Add clarification for forks commercialization [[22c1e2e](https://github.com/baptisteArno/typebot.io/commit/22c1e2e6cf8592e22a682dd53fb5c06e48637991)]

### Internal

- 🔧 Add import contact to brevo script [[c124671](https://github.com/baptisteArno/typebot.io/commit/c124671682930fca9bbaace5a007ea0aaba32f15)]
- 🔒 (auth) Block disposable emails during sign up [[abc3abd](https://github.com/baptisteArno/typebot.io/commit/abc3abd86b4f970e102c1b0c5d5d5d610975f45a)]

### Miscellaneous

- 📦 Release WP plugin 3.2.0 [[5dc01db](https://github.com/baptisteArno/typebot.io/commit/5dc01db08201a5637d06212c1271b96fa8c23890)]
- 🧑‍💻 (docs) Add &quot;Edit this page&quot; links in docs [[04faa3e](https://github.com/baptisteArno/typebot.io/commit/04faa3e847f856e1e4099ccfc850be831be4513a)]
- 🧑‍💻 (results) Add get result by id API endpoint [[3283d7e](https://github.com/baptisteArno/typebot.io/commit/3283d7e26146253ae129395afdeaa4fc2bf1d84e)]
-  Support specifying custom OAuth scope ([#619](https://github.com/baptisteArno/typebot.io/issues/619)) [[48f074c](https://github.com/baptisteArno/typebot.io/commit/48f074cdf7edf0558c0d937e855f92aba1fabbed)]
- 🧑‍💻 Exit prisma command if database url starts with &quot;postgres://&quot; [[0ea30bc](https://github.com/baptisteArno/typebot.io/commit/0ea30bc49b2979a21ceea2edfd77d8d4ea1811f5)]


<a name="2.15.2"></a>
## 2.15.2 (2023-07-17)

### New features

- ✨ (embed) Add new command setInputValue [[be7be7b](https://github.com/baptisteArno/typebot.io/commit/be7be7bf7a47baeeee0b597e34790ddf289035cc)]
- ✨ Add Next.js embed library [[e293cb0](https://github.com/baptisteArno/typebot.io/commit/e293cb011174aa170ee136c8a1b476bfc98e797c)]

### UI/UX Improvements

- ⚡ Replace updates with updateManys when possible [[3426d66](https://github.com/baptisteArno/typebot.io/commit/3426d6689d03ea68116f893c9343c0a1a43e1595)]
- ♿ Remove invalid js in meta head code [[521cb50](https://github.com/baptisteArno/typebot.io/commit/521cb50782b7b1141dcf4ae133c686c8d3533c27)]
- 🚸 (billing) Set existing stripe customer for custom plan checkout [[de08179](https://github.com/baptisteArno/typebot.io/commit/de08179f8bbf291d79a7df3c701d3913f6cb73ca)]
- ⚡ (audio) Implement more robust auto play [[0a85f33](https://github.com/baptisteArno/typebot.io/commit/0a85f33694300fe62a48bd5925ab6f66060796e4)]
- ⚡ (settings) Parse custom head code to remove invalid text nodes [[174d50a](https://github.com/baptisteArno/typebot.io/commit/174d50ad1b630dcad43d91b42bfef4cf6986468f)]
- 🚸 (theme) Move isBrandingEnable param in the Theme tab [[a31345a](https://github.com/baptisteArno/typebot.io/commit/a31345ae26650c2c599796f41f3a9fb4292bd8b6)]

### Fixed

- 🐛 (pixel) Fix event tracking [[7d62c7a](https://github.com/baptisteArno/typebot.io/commit/7d62c7ac850a2547f813d23e37475b72ce57535d)]
- 🐛 (bot) Improve canPlay issue fixin [[0b4b15c](https://github.com/baptisteArno/typebot.io/commit/0b4b15ce0a3e59209389af847a999c363d66b234)]
- 🐛 (bot) Fix setTimeout onCanPlay concurrency issues [[082084a](https://github.com/baptisteArno/typebot.io/commit/082084a90cdebfb911367a769650acedf69a58c5)]
- 🐛 (bot) Fix double callback on video and audio bubble [[abb363b](https://github.com/baptisteArno/typebot.io/commit/abb363b59da266c36126ef29c7fe0f4b16132b92)]
- 🐛 (openai) Fix incompatible OpenAI types [[6565fcc](https://github.com/baptisteArno/typebot.io/commit/6565fcc29c7a88f0dd6e6c30a7ece7cfe16024c8)]
- 🐛 (bot) Fix audio and video autoplay when loading take some time [[ba3a2b7](https://github.com/baptisteArno/typebot.io/commit/ba3a2b711e45050b679c2fed1c2c520cbd59aec1)]
- 🚑 Fix invalid rewrites for custom domains [[37bb172](https://github.com/baptisteArno/typebot.io/commit/37bb172f251019f0ea1ddd7c2c9d5e7383f7b7ef)]
- 🚑 (lp) Hard-code rewrite to typebot.io [[b2a9734](https://github.com/baptisteArno/typebot.io/commit/b2a973472f09133b8381ea39437dae27ae770181)]
- 🐛 (workspace) Fix members list limit bug [[fc0e378](https://github.com/baptisteArno/typebot.io/commit/fc0e3782b1915b6b247f7ef4901098d0a6a9ac0e)]
- 🚑 (bot) Fix try catch injection when opening s… [[b71e957](https://github.com/baptisteArno/typebot.io/commit/b71e957e7cb7c64dde5f8614a44bf252b3f8ebc8)]
- 🚑 (bot) Share inject custom head code again [[3421e48](https://github.com/baptisteArno/typebot.io/commit/3421e4822f18a6c6071a0ecdd06447d9794e6803)]
- 🐛 (ga) Fix gtag not initializing properly [[8ce5447](https://github.com/baptisteArno/typebot.io/commit/8ce54470126c61b74f331865a8a34ae26dad64c3)]
- 🐛 (bot) Fix audio and video autoplay error catching [[5587bfb](https://github.com/baptisteArno/typebot.io/commit/5587bfb0e92ed3e43f329a7b21bb34001c98c406)]

### Content

- 📝 Remove pixel troubleshoot section [[12ce4eb](https://github.com/baptisteArno/typebot.io/commit/12ce4eb01b8027885ebd58be37870d78d66f9fa9)]
- 📝 (settings) Update General section [[93337bd](https://github.com/baptisteArno/typebot.io/commit/93337bd1d9ebc2610da910c37974e37cf442f7df)]
- 📝 Add script block precision [[88e2f50](https://github.com/baptisteArno/typebot.io/commit/88e2f50d35e065188f35b4e49dac2c27f02325f6)]
- 📝 Add troubleshoot self-host page [[844832f](https://github.com/baptisteArno/typebot.io/commit/844832f310f2ff482fd26b0eb77431fc6cd5fb73)]
- 📝 (theme) Add change bot avatar guide in docs [[28fd81c](https://github.com/baptisteArno/typebot.io/commit/28fd81cb6597c6f61a4c9eaa21f5c377bcd929c0)]

### Internal

- 🗃️ Remove extendedWhereUnique feat [[2c2952e](https://github.com/baptisteArno/typebot.io/commit/2c2952e3649713007b9d4edf3846f10a88c87f4b)]
- 🔧 Rewrite viewer to landing-page [[0465275](https://github.com/baptisteArno/typebot.io/commit/0465275f822d863a29b0d3d7c58b2a787686bdd9)]

### Miscellaneous

-  Fix typo in inject-runtime-env.sh ([#599](https://github.com/baptisteArno/typebot.io/issues/599)) [[c365c54](https://github.com/baptisteArno/typebot.io/commit/c365c547aaae3c87f533185b02742d5b46ab6c1d)]
- 🧑‍💻 (bot) Wrap custom head code scripts with try catch [[1beb4bb](https://github.com/baptisteArno/typebot.io/commit/1beb4bb1b918976992bfbacf39412d16146a93b3)]


<a name="2.15.1"></a>
## 2.15.1 (2023-07-07)

### UI/UX Improvements

- 🚸 (video) Improve video autoplay behavior [[5ae6c64](https://github.com/baptisteArno/typebot.io/commit/5ae6c64d065d295780f2b008a88c0e0ea59a70e5)]
- 🚸 Remove new typebot default user avatar [[31b7022](https://github.com/baptisteArno/typebot.io/commit/31b70223c84786ba18a39502c9f750b72f1d014a)]

### Fixed

- 🐛 (share) Enable back empty public ID for self-hosted version [[56078b4](https://github.com/baptisteArno/typebot.io/commit/56078b4e0215b2d6313a9d2b3b89ae4936cac7f7)]


<a name="2.15.0"></a>
## 2.15.0 (2023-07-06)

### New features

- ✨ Add Meta Pixel block [[033f8f9](https://github.com/baptisteArno/typebot.io/commit/033f8f99ddb72c91b46cd37cfb012ea45e23bf1e)]

### UI/UX Improvements

- ⚡ (analytics) Improve analytics graph accuracy [[b0f25f3](https://github.com/baptisteArno/typebot.io/commit/b0f25f301b89e6dadb730c1537df2b559b9d549f)]
- 💄 Correctly highlight current line in code editor [[55ff944](https://github.com/baptisteArno/typebot.io/commit/55ff944ebb107577f9bd9728e387e0b75c5bb79a)]
- ⚡ (pixel) Add skip initialization option [[50fcbfd](https://github.com/baptisteArno/typebot.io/commit/50fcbfd95e7e480e2579b1ac4e914cb85770ae27)]
- 🚸 (editor) Improve editor performance by rounding paths [[0582ca7](https://github.com/baptisteArno/typebot.io/commit/0582ca74acded209b84e8929c5b874c00042f694)]
- ⚡ (openai) Use Vercel&#x27;s AI SDK for streaming [[3be39cb](https://github.com/baptisteArno/typebot.io/commit/3be39cbc789e85aab6b22460eac58da9c074d84f)]
- ⚡ Add recent section in icon and emoji picker [[eaadc59](https://github.com/baptisteArno/typebot.io/commit/eaadc59b1fc39ab79e024b7d85b4ef7269ccc852)]
- 🚸 Move item settings button to the left [[d8e5605](https://github.com/baptisteArno/typebot.io/commit/d8e56050f3415fee1586f00975b451ec82f3af3e)]
- ⚡ (openai) Retry OpenAI call if status code is 503 [[dcdf870](https://github.com/baptisteArno/typebot.io/commit/dcdf8703086cb127b1e135480e088e1f9fd68b8b)]
- 🚸 (openai) Parse stream on client to correctly handle errors [[524f156](https://github.com/baptisteArno/typebot.io/commit/524f1565d8600b7efcc0674c56ee5b2f908c07dd)]
- ⚡ (openai) Add new models and remove tiktoken [[83f2a29](https://github.com/baptisteArno/typebot.io/commit/83f2a29faae2f4ad78eca56256977fbbd20a1740)]
- 🚸 (webhook) Show save in variables accordion only when needed [[e54aab4](https://github.com/baptisteArno/typebot.io/commit/e54aab452acd6b7d492f78d624014dfeb42bdfb0)]
- ⚡ (wp) Add UTM auto forward [[a64e621](https://github.com/baptisteArno/typebot.io/commit/a64e6214329ec298742ef453b7aaaa60cf3fbf42)]
- ⚡ (numberInput) Variabalize min, max, step [[4223485](https://github.com/baptisteArno/typebot.io/commit/42234850ed637f67b8b8b7e31dfd093b4824ac47)]
- ⚡ (setVariable) Add &quot;Moment of the day&quot; variable value [[d8c1a36](https://github.com/baptisteArno/typebot.io/commit/d8c1a36bc0c06426be4da5039d24d97bcf2ef719)]
- 🚸 (sheets) Show info log instead of error when no rows are found [[fbe63aa](https://github.com/baptisteArno/typebot.io/commit/fbe63aa3f357adb65b811f134ff702b9a899803d)]

### Fixed

- 🐛 (js) Fix container color when empty [[aeb62f9](https://github.com/baptisteArno/typebot.io/commit/aeb62f968accce7769f34c5a25c142fdfe20961e)]
- 🚑 Fix answer upsert on duplicate itemId [[92740ad](https://github.com/baptisteArno/typebot.io/commit/92740ad2ff46c75152d0dd1c4d586e4f01ad323c)]
- 🚑 Fix answer upsert missing groupId [[24126ac](https://github.com/baptisteArno/typebot.io/commit/24126ac9b89d74705b571e3e54afaf8c22d630cb)]
- 🐛 (sheets) Fix sheet block when filter is undefined [[9658277](https://github.com/baptisteArno/typebot.io/commit/9658277d97b358567547adbe677ca8b08458af4c)]
- 🐛 (condition) Improve comparison on dates [[92f7f3c](https://github.com/baptisteArno/typebot.io/commit/92f7f3cbe2febd0ae348008017d3dbd6aafa6b93)]
- 🐛 (results) Fix export duplicate columns when no order set [[3575fef](https://github.com/baptisteArno/typebot.io/commit/3575fef34f0ee0646af1bbf900b98dc45b0c8177)]
- 💚 Fix prisma schema path evaluation on windows [[dcda2d0](https://github.com/baptisteArno/typebot.io/commit/dcda2d06ac54acfdf1fd6284569f096671a64f6d)]
- 💚 (db) Fix verification bulk delete [[63e826f](https://github.com/baptisteArno/typebot.io/commit/63e826f9913ff0dac6c37dd9c4dcb85e2541a480)]
- 🚑 (condition) Remove null check on comparison value [[c94cd1e](https://github.com/baptisteArno/typebot.io/commit/c94cd1e37cd9acef1e1858075a36b6512c3e2e5f)]
- 🐛 (openai) Fix streaming when starting with OpenAI block [[bfca8d9](https://github.com/baptisteArno/typebot.io/commit/bfca8d9368ef5d2eb664909fcef500f7f6268936)]
- 🐛 (condition) Fix condition parsing with value &quot;null&quot; [[8e7479a](https://github.com/baptisteArno/typebot.io/commit/8e7479a1bde96fa6f46d40b7e96eea23dbc9fbfd)]
- 🐛 (conditions) Fix negative comparisons [[cec072b](https://github.com/baptisteArno/typebot.io/commit/cec072b2a223ec400ab1a6fe022e4bfa06c2c25f)]

### Content

- 📝 Add status page link in footers [[3662393](https://github.com/baptisteArno/typebot.io/commit/36623930bce59d59975cba3dd2a6f164710e5866)]
- 📝 (embed) Improve Wix embed instructions [[da289a0](https://github.com/baptisteArno/typebot.io/commit/da289a0da797fb797a8c864cdbb424360c65777e)]
- 📝 Change CNAME value to vercel domain [[471dedc](https://github.com/baptisteArno/typebot.io/commit/471dedccc8964bffa43c5baaeb955d6d34688430)]
- 📝 (makecom) Add return data instructions [[0e31a6c](https://github.com/baptisteArno/typebot.io/commit/0e31a6ce0028b86ad070fbd36b506c47af2484e5)]

### Internal

- 🔒 Add rate limiter on email signin endpoint [[7c2e574](https://github.com/baptisteArno/typebot.io/commit/7c2e5740dcff4b555c8d6b53fb422af12c222f3d)]
- 🗃️ Convert mysql icon varchar to text [[3b52363](https://github.com/baptisteArno/typebot.io/commit/3b52363e118e1009c3c5ab244f837639c1796305)]
- 🔒 Revert ddos lockdown [[f1b643c](https://github.com/baptisteArno/typebot.io/commit/f1b643c5be8bcfd1de68a13b770b9569d39dd53c)]
- 🔒 Remove lp image DDOS prevention [[3e2c462](https://github.com/baptisteArno/typebot.io/commit/3e2c462617754e7d920a904865d018e7e236531c)]
- 🔒 Disable email auth [[00945bf](https://github.com/baptisteArno/typebot.io/commit/00945bfa0cf4d73293f1438c43203327e104fad2)]

### Miscellaneous

- 🛂 Add isSuspended prop on workspace [[5a05310](https://github.com/baptisteArno/typebot.io/commit/5a05310a9c9f1f3ef90a54936cbc2238b05eb8c9)]
- 🧑‍💻 (api) Add icon field in create workspace endpoint [[69254c3](https://github.com/baptisteArno/typebot.io/commit/69254c362416cc014f44133b8597027a1e410ff4)]
- 🛂 (billing) Enable Published bot branding when plan cancelled [[6864667](https://github.com/baptisteArno/typebot.io/commit/6864667297b056b96f76e206aff05231163cbe75)]
- 🛂 Add checkSubscriptions script [[2abce89](https://github.com/baptisteArno/typebot.io/commit/2abce89a4644ba3502cf5a323b3c0b642e603563)]
- 🛂 (billing) Display branding when subscription… [[de0b105](https://github.com/baptisteArno/typebot.io/commit/de0b105276f90881c6d0d8740e1d0a2b09432a56)]
- 🛂 (billing) Always invoice when subscription is updated [[97fcee2](https://github.com/baptisteArno/typebot.io/commit/97fcee276449a2ad18c1ba9709d1a6ebb9194681)]
- ⚗️ Add inspect user script [[931540b](https://github.com/baptisteArno/typebot.io/commit/931540b91bf0b1bcb1658de93faecd34811a3e95)]


<a name="2.14.1"></a>
## 2.14.1 (2023-06-14)

### New features

- ✨ Add Näak product recommendation template [[40ef934](https://github.com/baptisteArno/typebot.io/commit/40ef934740ab3cfad56b5137c7b0ed4ba9ce2584)]
- ✨ Add conditional choice items [[ef0a2d9](https://github.com/baptisteArno/typebot.io/commit/ef0a2d9dc61042281ee486ef5e9bb8d711f92e30)]

### UI/UX Improvements

- ♿ (payment) Improve payment input amount label format [[290b491](https://github.com/baptisteArno/typebot.io/commit/290b491e533fcab2448eb0e19af4c283d72a2509)]
- 🚸 Add item duplication [[acaa1c6](https://github.com/baptisteArno/typebot.io/commit/acaa1c622387ec60a8afa8e18964a5fb291032c9)]
- 🚸 (openai) Add missing credentials error to chat completion streamer [[8822e4e](https://github.com/baptisteArno/typebot.io/commit/8822e4e7e4d4239122bffbe60017d1a248c413cd)]

### Fixed

- 🐛 Fix GA not working when Send_to is empty string [[0a87386](https://github.com/baptisteArno/typebot.io/commit/0a873863054d63405cadcd51bfcd0858415031f6)]
- 💚 Fix cleanDatabase when deleting more than 100,000 sessions [[4977481](https://github.com/baptisteArno/typebot.io/commit/49774815820c6dffb8d4dc1c0493743521c055e4)]
- 🐛 (openai) Fix default response mapping item [[e9c2dee](https://github.com/baptisteArno/typebot.io/commit/e9c2deee5ff935ee941925aafcf3e70bce850ce6)]
- ✏️ Fix FlutterFlow modal title typo [[a16367b](https://github.com/baptisteArno/typebot.io/commit/a16367b194e0fa778c62ed2dec035d69b113aadd)]
- ✏️ Fix react README examples ([#542](https://github.com/baptisteArno/typebot.io/issues/542)) [[61fd44f](https://github.com/baptisteArno/typebot.io/commit/61fd44f768d80f7298db689e4dde4c94327fdf6f)]

### Content

- 📝 Add 2 new oss friends in landing page [[25524ac](https://github.com/baptisteArno/typebot.io/commit/25524ac62217c90631e7aaf603ba9a63de05cfe5)]
- 📝 Add Google Ads conversion instructions [[4614caf](https://github.com/baptisteArno/typebot.io/commit/4614caf49873be955b63f1888be16ddbfa8a8540)]

### Miscellaneous

- 📦 Add Cloudron package ([#550](https://github.com/baptisteArno/typebot.io/issues/550)) [[1e9c4bc](https://github.com/baptisteArno/typebot.io/commit/1e9c4bcb9aab058630d04482ba6b929d50e85df7)]


<a name="2.14.0"></a>
## 2.14.0 (2023-06-02)

### UI/UX Improvements

- ♿ Improve credentials dropdown accessibility if long name [[bc90c9c](https://github.com/baptisteArno/typebot.io/commit/bc90c9c81ee6f317ba32e402d1d59cf2d17f372b)]
- 💄 Improve picture choice description UI [[b6e5002](https://github.com/baptisteArno/typebot.io/commit/b6e5002a5692368a15c526b1bd67572574a9ee0e)]
- ⚡ (js) Add placement option for bubble embed [[57f3e5c](https://github.com/baptisteArno/typebot.io/commit/57f3e5c004e55bdfcc87e7275f00375619685970)]
- 🌐 Translate workspace ([#528](https://github.com/baptisteArno/typebot.io/issues/528)) [[b2ea8fc](https://github.com/baptisteArno/typebot.io/commit/b2ea8fc0595f28cf12a0b8e6dfde102314de1041)]

### Fixed

- 🚑 Fix bubble window size on mobile devices [[8a0488e](https://github.com/baptisteArno/typebot.io/commit/8a0488ee89d6532874e0d597418db0d5a51a542d)]

### Miscellaneous

-  Update de.ts ([#535](https://github.com/baptisteArno/typebot.io/issues/535)) [[537b9fe](https://github.com/baptisteArno/typebot.io/commit/537b9fe6ce1a42b618c94eead70ff63a20a29835)]
-  Update builder configuration docs ([#531](https://github.com/baptisteArno/typebot.io/issues/531)) [[6651c85](https://github.com/baptisteArno/typebot.io/commit/6651c85f021e977c17bbb2df161197ecdc08e6a5)]
- 🔍 (lp) Add FB app ID in landing page [[9ca0c70](https://github.com/baptisteArno/typebot.io/commit/9ca0c7014e69d1fdd13d02ebfd64f08e0b9d0f99)]


<a name="2.13.5"></a>
## 2.13.5 (2023-05-26)

### UI/UX Improvements

- ♿ (js) Improve auto scroll when no host bubble [[0ca48e4](https://github.com/baptisteArno/typebot.io/commit/0ca48e4c0842ce6d0a2681dfa5325c2e5fec5493)]
- 💄 (js) Fix select background color on Windows [[68f0202](https://github.com/baptisteArno/typebot.io/commit/68f02026017e9ffb3f2a0138c8edfaf115ae9447)]
- ⚡ (webhook) Add client execution option [[75f9da0](https://github.com/baptisteArno/typebot.io/commit/75f9da0a4fe7937e07823ac46a8b449c89bf6eac)]
- ⚡ (openai) Stream chat completion to avoid serverless timeout ([#526](https://github.com/baptisteArno/typebot.io/issues/526)) [[56364fd](https://github.com/baptisteArno/typebot.io/commit/56364fd86335607cbe6c17bdba7f7caf5397cc1e)]
- 💄 (js) Improve popup ui consistency [[c950406](https://github.com/baptisteArno/typebot.io/commit/c950406997c28dc9aefecbad2aeb58d9b66ccffe)]

### Fixed

- 🐛 Fix outside click on picture choice [[4230f47](https://github.com/baptisteArno/typebot.io/commit/4230f47be911c7be21d7055b01f7548b6bf2436e)]
- 🐛 (webhook) Add loading bubble when executing webhook on client [[4dec06f](https://github.com/baptisteArno/typebot.io/commit/4dec06fc7502037282e654eb58c4bb93fc0e75c6)]
- 🐛 (sheets) Fix empty and unique filter [[154271c](https://github.com/baptisteArno/typebot.io/commit/154271c7f22a9d2f7553532a7d16530c2dfe9aae)]
- 🐛 (payment) Round the amount to avoid weird Js long decimals [[16f3ad3](https://github.com/baptisteArno/typebot.io/commit/16f3ad3a19d36b57f9adef22726aedb60745b80a)]
- 🐛 (editor) Remove edge if duplicating last block of group [[6bb6a2b](https://github.com/baptisteArno/typebot.io/commit/6bb6a2b0e36a00d3b296acab4fa2e3f90e4641d4)]
- 🐛 Fix readme typo ([#518](https://github.com/baptisteArno/typebot.io/issues/518)) [[423aca6](https://github.com/baptisteArno/typebot.io/commit/423aca6133ce24f0f0033789eeb0f7f40aba8108)]
- 🐛 Fix embed bubble icon color [[49a8427](https://github.com/baptisteArno/typebot.io/commit/49a8427776ba43417699029e87ee41d85193a05d)]
- 💚 Improve auto create tag workflow [[683ba90](https://github.com/baptisteArno/typebot.io/commit/683ba90403676e8baf1eb27c3488163cbb9e5da1)]

### Content

- 📝 (lp) Add oss friends page [[084a17f](https://github.com/baptisteArno/typebot.io/commit/084a17ffc8ef587f3f70a46c43a7d35331868d4d)]
- 📝 (embed) Add FlutterFlow embed instructions [[fdfed16](https://github.com/baptisteArno/typebot.io/commit/fdfed160a657475f50af2a7635923b9d747a12c8)]


<a name="2.13.4"></a>
## 2.13.4 (2023-05-17)

### UI/UX Improvements

- ⚡ Remember result in either local or session storage ([#514](https://github.com/baptisteArno/typebot.io/issues/514)) [[27b009d](https://github.com/baptisteArno/typebot.io/commit/27b009dd7693c59f75c9df8ff0d3b27dcae47680)]

### Fixed

- 🐛 Disable invite button when email is empty [[8b84a7d](https://github.com/baptisteArno/typebot.io/commit/8b84a7d8b983d4dc36ad4ab89d92b052fcfeb9b9)]
- 🐛 Fix public id validation [[853451b](https://github.com/baptisteArno/typebot.io/commit/853451b4fabf2f2c5e7d001f8d806ea51dd3c80e)]

### Content

- 📝 (webflow) Add bind commands to button instructions [[c451ba7](https://github.com/baptisteArno/typebot.io/commit/c451ba77846218764d8916d7d22c421fdf97d1cb)]

### Miscellaneous

- 🐳 Fix encryption length check script [[0fc6bfa](https://github.com/baptisteArno/typebot.io/commit/0fc6bfa7cefc866d39f464a9efb080c4eff5669b)]


<a name="2.13.3"></a>
## 2.13.3 (2023-05-16)

### UI/UX Improvements

- ⚡ (embed) Add size and icon picker in bubble settings ([#508](https://github.com/baptisteArno/typebot.io/issues/508)) [[0f91b34](https://github.com/baptisteArno/typebot.io/commit/0f91b34497659da34edafa23b80e81782925eda7)]
- 🚸 Improve support accessibility [[123926f](https://github.com/baptisteArno/typebot.io/commit/123926f2735787c15ca22abc55ea1cb73a4631b8)]

### Fixed

- 🐛 Restore support bubble in cloud prod [[f8ea2e1](https://github.com/baptisteArno/typebot.io/commit/f8ea2e133786100893fe53504e6549fa5d56d178)]

### Content

- 📝 Add a self-hosting comparison table in README [[2b54518](https://github.com/baptisteArno/typebot.io/commit/2b54518d04ab26d4489de2b7e42d82796d2aede6)]


<a name="2.13.2"></a>
## 2.13.2 (2023-05-12)

### New features

- ✨ Add icon picker ([#496](https://github.com/baptisteArno/typebot.io/issues/496)) [[9abc50d](https://github.com/baptisteArno/typebot.io/commit/9abc50dce518ff7e0cc2d09196a4171104fa9902)]

### UI/UX Improvements

- 🚸 Improve chat auto scroll [[a3fb098](https://github.com/baptisteArno/typebot.io/commit/a3fb098dfa010a29af8fd0e5a7145430d10ccc92)]
- ⚡ (sheets) Add option to select single row when matching multiple [[55dbb1a](https://github.com/baptisteArno/typebot.io/commit/55dbb1abc714462e3479ad42e8eb82d315e32f0e)]
- ⚡ Add predefined set variable values ([#497](https://github.com/baptisteArno/typebot.io/issues/497)) [[bde9416](https://github.com/baptisteArno/typebot.io/commit/bde941613cedaddd3c4fabe466e84ffe09ec670b)]

### Fixed

- 🐛 Fix webhook deep keys parsing invalid index [[df8a406](https://github.com/baptisteArno/typebot.io/commit/df8a4065139fb34222efabc8ae4139fa1fe201dd)]

### Miscellaneous

- 🧑‍💻 Check required env var before starting the server [[45224f9](https://github.com/baptisteArno/typebot.io/commit/45224f9fb36f97a169ac729def4dd50c6506a2ae)]


<a name="2.13.1"></a>
## 2.13.1 (2023-05-09)

### New features

- ✨ Add dog insurance offer template [[8347e5b](https://github.com/baptisteArno/typebot.io/commit/8347e5b2a89b70957a6a04f7cceac83a4c1a57c6)]
- ✨ Add picture choice block [[035dded](https://github.com/baptisteArno/typebot.io/commit/035dded654fb425c2f1e857b2f328baadc44d799)]

### UI/UX Improvements

- 🚸 Add floating menu for block settings [[825ed2f](https://github.com/baptisteArno/typebot.io/commit/825ed2f1ecab3a5cad7659172df38791a6cf2a24)]
- 🚸 Show toast for non-uploaded file in preview mode [[be009a2](https://github.com/baptisteArno/typebot.io/commit/be009a216d8c63864c9b71ebc62647c17494f0e5)]
- ⚡ (payment) Add address in payment input [[c469912](https://github.com/baptisteArno/typebot.io/commit/c46991297961f080f77dbce400849af2e80627a9)]
- 🚸 (billing) Use Stripe checkout page for new subscription with existing customer [[b9f94cd](https://github.com/baptisteArno/typebot.io/commit/b9f94cdf19df3ba69166760d028500650e79a355)]
- ⚡ (sheets) Add rows filtering to update multiple rows at the same time [[55db360](https://github.com/baptisteArno/typebot.io/commit/55db360200612171ac0159296145b21efe5bc59c)]
- 🚸 (editor) Do not show focus toolbar for the Start group [[5f0a99e](https://github.com/baptisteArno/typebot.io/commit/5f0a99ee66fc719f1d3ca9371dba4af3018f66ac)]

### Fixed

- 🐛 (webhook) Fix picture choice sample value not sent [[33adc29](https://github.com/baptisteArno/typebot.io/commit/33adc29a57609f6a9a44113886113d94eb642393)]
- 🐛 (ga) Fix value field parsing [[e15e27f](https://github.com/baptisteArno/typebot.io/commit/e15e27f0b47deca2d5d99021642ce770a4df0268)]
- 🐛 (ga) Fix invalid variable parsing [[d99af7e](https://github.com/baptisteArno/typebot.io/commit/d99af7e6c5d6d833c98e99c9ff255cb75a16ee9f)]
- 🐛 (billing) Only fetch active subscriptions [[98a21f3](https://github.com/baptisteArno/typebot.io/commit/98a21f3a9e7cd348b1ea196260633228378ce1be)]
- 🐛 (sheets) Fix update filter invalid indexes [[8b3a690](https://github.com/baptisteArno/typebot.io/commit/8b3a6908098b0bfc49f6aea4506c22ac54d933bb)]
- 🐛 (wp) Fix custom api host variable name on shortcode [[c0fae18](https://github.com/baptisteArno/typebot.io/commit/c0fae185013f0f62effe1eab9455cb7e5bc392c0)]
- 🐛 (googleAnalytics) Fix output validation when using variable as event value [[65c6f66](https://github.com/baptisteArno/typebot.io/commit/65c6f66a5cdd72ad1384a89df5810e800b2cbd06)]
- 💚 Revert rollup upgrade to make it work with turbo dev [[f2d3174](https://github.com/baptisteArno/typebot.io/commit/f2d31745caddf2ab57dd4db2ec2c0264cfafe833)]

### Content

- 📝 Custom bubble button position instructions [[ecc3b5f](https://github.com/baptisteArno/typebot.io/commit/ecc3b5fd874aed22a84ba958f722e9424b170430)]
- 📝 Doc about the more options menu from the results tab [[c31642d](https://github.com/baptisteArno/typebot.io/commit/c31642db04f7b197f09646ab9b4e96333326a998)]

### Miscellaneous

-  Add German Translation ([#485](https://github.com/baptisteArno/typebot.io/issues/485)) [[dd079c3](https://github.com/baptisteArno/typebot.io/commit/dd079c352503bf01fb61061466964a6129ad4bc9)]


<a name="2.13.0"></a>
## 2.13.0 (2023-05-02)

### UI/UX Improvements

- 💄 Improve toast UI when containing only description [[d50e280](https://github.com/baptisteArno/typebot.io/commit/d50e280ab37a6cb8ec420653ac9ab4bd6f6a2d1f)]
- ⚡ (openai) Truncate messages sequence automatically if reaching token limit [[e58016e](https://github.com/baptisteArno/typebot.io/commit/e58016e43a4dd58c809bcce604ab5af0ab91a41c)]
- 💄 Fix toast UI in dark mode [[ddb5287](https://github.com/baptisteArno/typebot.io/commit/ddb528774bb280f2c3979f8a711074c173918cef)]
- 💄 (js) Fix gap on loading chunk [[ce2565c](https://github.com/baptisteArno/typebot.io/commit/ce2565c4293be28f4fc570cb8174632fe3f82973)]
- ⚡ (scripts) Improve result digest db queries [[5845e1c](https://github.com/baptisteArno/typebot.io/commit/5845e1cb8c448a2a7d8c5832694e18a7a51822c8)]
- 💄 Better toast UI when it doesn&#x27;t contain details [[e827da7](https://github.com/baptisteArno/typebot.io/commit/e827da7b6bd6da2b22d3b6a92ce8446519f6fdb6)]
- ⚡ (ga) Add send_to option [[9e8acd9](https://github.com/baptisteArno/typebot.io/commit/9e8acd97aa4ffe2790d555dbed50323229605160)]
- ⚡ Better error toast when previewing bot [[d448e64](https://github.com/baptisteArno/typebot.io/commit/d448e64dc9e4693966c335fa453029490e2b650b)]

### Fixed

- 🐛 Fix variable dropdown size in text bubble editor when z… [[2b0e2b0](https://github.com/baptisteArno/typebot.io/commit/2b0e2b09f517358653d7a47b93e4fc7f66950e0b)]
- 🐛 (googleAnalytics) Fix sendTo initial value in settings [[e2836f3](https://github.com/baptisteArno/typebot.io/commit/e2836f305c1d0ca0743b120c9b0a54d657e6b949)]
- 🐛 Properly display success message toast for web preview [[9473563](https://github.com/baptisteArno/typebot.io/commit/94735638a608b57501672ed0d113e548cf84dcfe)]

### Miscellaneous

- 🩹 (wp) Fix typebotWpUser not defined issue [[c1f3534](https://github.com/baptisteArno/typebot.io/commit/c1f3534374d5f5ad8d492763b538179faec27ac9)]
- 🛂 (billing) Update claimable custom plan options [[458d715](https://github.com/baptisteArno/typebot.io/commit/458d71564866ee9c6a350d69e488f8cc3a3faf12)]


<a name="2.12.3"></a>
## 2.12.3 (2023-04-27)

### New features

- ✨ (buttons) Add searchable choices [[5b4a6c5](https://github.com/baptisteArno/typebot.io/commit/5b4a6c523d0608098ce0204f0416dbfbf060bb18)]
- ✨ Add lead gen with AI template [[3b69b18](https://github.com/baptisteArno/typebot.io/commit/3b69b18601bc3b77b8b1f8780e4e147a01967cd0)]
- ✨ Add AB test block [[7e937e1](https://github.com/baptisteArno/typebot.io/commit/7e937e1c7cae380c3083c95b207ea9126739b1dc)]

### UI/UX Improvements

- 💄 (buttons) Improve multiple choice form UI [[124f350](https://github.com/baptisteArno/typebot.io/commit/124f350aa27fdf33063d98266169b75e8065c4c4)]
- ♿ (sheets) Add duplicate header notice [[a03d124](https://github.com/baptisteArno/typebot.io/commit/a03d1240468dad82bd4f253995ceecf9823b025b)]
- ⚡ (chatwoot) Add result URL custom attribute [[c09a840](https://github.com/baptisteArno/typebot.io/commit/c09a84034e462138d2bd2c95be102ffabc809438)]
- 🚸 (date) Improve date format storage [[3529da2](https://github.com/baptisteArno/typebot.io/commit/3529da210c2415e20cd35c1861fa6d1aad684d02)]
- 🚸 (templates) Add category and description in templates modal [[4d1fe4c](https://github.com/baptisteArno/typebot.io/commit/4d1fe4c1dee7fb79b9e47ed756100e1b1e42c81b)]
- 🚸 (sendEmail) Allow html parsing for body with a single variable [[de432ec](https://github.com/baptisteArno/typebot.io/commit/de432ecaf7f78b7ad44b814cdcf50addb25c0b42)]
- 🚸 (billing) Make yearly plan clearer for subscription updates [[9345b33](https://github.com/baptisteArno/typebot.io/commit/9345b33e740c7190b66404226bf82e5a84d745db)]

### Fixed

- 🚑 (buttons) Fix content mapping on searchable multiple items [[7896e3d](https://github.com/baptisteArno/typebot.io/commit/7896e3d732b6543fa4511f5c791429dce39705d3)]
- 🐛 (viewer) Remove default white background when it is set to none [[bda34e3](https://github.com/baptisteArno/typebot.io/commit/bda34e38276351911fc22f5ecb340f9c5a47230f)]
- 🐛 (condition) Greater and Less should compare list length when possible [[c77b8e7](https://github.com/baptisteArno/typebot.io/commit/c77b8e7548c515857b86968a0a7c13cc3bd7180d)]
- 🐛 Refresh variable list on focus [[b614544](https://github.com/baptisteArno/typebot.io/commit/b61454490964a90d6c092e133aac88d9acf29405)]

### Content

- 📝 Fix GTM instructions [[f51d619](https://github.com/baptisteArno/typebot.io/commit/f51d619c79f82a114ffa5d592ccc9443171584c2)]
- 📝 Add Jump and AB test block docs [[7385e3b](https://github.com/baptisteArno/typebot.io/commit/7385e3bbbf88a3d193ff586927f0a777e6374422)]
- 📝 Add upgrade plan doc [[a4ca413](https://github.com/baptisteArno/typebot.io/commit/a4ca413c602198a1547f6c227a9329cbb0e20683)]

### Miscellaneous

- 🛂 Reset isQuarantined on the first of month [[3fbd044](https://github.com/baptisteArno/typebot.io/commit/3fbd044d9284fe2d7dc01f2808a9ee2801dfd9c1)]
- 🛂 Reset isQuarantined when upgrading workspace [[c6983c9](https://github.com/baptisteArno/typebot.io/commit/c6983c952c451eeb026302068afd8a0862673a9d)]
- 🛂 Add isQuarantined field in workspace [[69e1c4f](https://github.com/baptisteArno/typebot.io/commit/69e1c4f20d5c878fb1a58dc4f6c048f8bc6084d0)]
- 🩹 (telemetry) Better limit reached workspace filter [[fc56143](https://github.com/baptisteArno/typebot.io/commit/fc561430a04a6d2acf9fd9e0979b6a7f89d3468a)]
- 🩹 Correctly convert totalStorageUsed for limit telemetry [[30f93e8](https://github.com/baptisteArno/typebot.io/commit/30f93e8a6f14b73d9a0ab433a0a2df1d471a27f4)]
- 🩹 (share) Fix undefined apiHost under API instructions [[7c2ce2f](https://github.com/baptisteArno/typebot.io/commit/7c2ce2fc41f52ef96f3b1473671600f1d81fa7b6)]


<a name="2.12.2"></a>
## 2.12.2 (2023-04-17)

### UI/UX Improvements

- 🚸 (share) Use custom domain host when possible in embed instruction [[cd0916d](https://github.com/baptisteArno/typebot.io/commit/cd0916df675511466aa9b48302ea9ffd7a1756f0)]

### Fixed

- 🐛 (sendEmail) Escape html from variables in custom body [[f7d94de](https://github.com/baptisteArno/typebot.io/commit/f7d94de66ed383bed12db3771c6ff916008e657a)]
- 🐛 Auto scroll X behavior outside of editor [[928afd5](https://github.com/baptisteArno/typebot.io/commit/928afd5a6cc49900279e45f4cf42a168213abf6d)]
- 🐛 (results) Keep focus on current expanded result when new ones arrive [[f8a76f9](https://github.com/baptisteArno/typebot.io/commit/f8a76f98b94ac4ae780b11ffae54104bbf4da69b)]
- 🐛 Await support in set variable and script code [[918dffb](https://github.com/baptisteArno/typebot.io/commit/918dffb4bc7a18da41862b90288bda8fe59246ae)]


<a name="2.12.1"></a>
## 2.12.1 (2023-04-14)

### New features

- ✨ Add lead magnet template [[ee14228](https://github.com/baptisteArno/typebot.io/commit/ee14228ee32894460f11350a4d096d7cf5b082ab)]

### UI/UX Improvements

- ⚡ (setVariable) Add client-side set variable execution [[03cc067](https://github.com/baptisteArno/typebot.io/commit/03cc067418bff04054c6aabe4f2615a119a02e9e)]
- 💄 Adapt openAI logo to dark mode [[868b5b8](https://github.com/baptisteArno/typebot.io/commit/868b5b83706d174a2fa9b51375726aaa1f003857)]
- 💄 Improve Unsplash picker dark mode UI [[0033108](https://github.com/baptisteArno/typebot.io/commit/00331089a3b3c0644539153745af10d7d193c382)]
- 🚸 (sheets) Better Get data settings UI [[6921cc2](https://github.com/baptisteArno/typebot.io/commit/6921cc23a5423f9485b62c54963324fa4dd54998)]
- ⚡ (imageBubble) Add redirect on image click option [[e06f818](https://github.com/baptisteArno/typebot.io/commit/e06f8186f61bcc4abc5cec8984de00c623088d8b)]

### Fixed

- 🐛 Remove lead magnet duplicated block [[0900fb0](https://github.com/baptisteArno/typebot.io/commit/0900fb04079388bc47b18975b6653f1f3a4a9209)]
- 🐛 (auth) Fix signup page text [[39d0dba](https://github.com/baptisteArno/typebot.io/commit/39d0dba18c251134259b2f99f8d0263dc1a51349)]
- 🐛 (webhook) Correctly parse array of strings in data dropdown [[a7dbe93](https://github.com/baptisteArno/typebot.io/commit/a7dbe93eddb41f2be2defc51104eb1c7291d736f)]
- 🐛 (setVariable) Properly parse phone number variables [[44975f9](https://github.com/baptisteArno/typebot.io/commit/44975f9742a63eb82543c0287cf68b91f70295c3)]

### Content

- 📝 Improve writing on self-hosting introduction [[397a33a](https://github.com/baptisteArno/typebot.io/commit/397a33afc662a873759769907a7bae05b4a53117)]

### Internal

- ♻️ Simplify text bubble content shape [[e0a9824](https://github.com/baptisteArno/typebot.io/commit/e0a9824913237cb5340d262770e9e8290fbc4002)]

### Miscellaneous

-  Improve translation PT ([#456](https://github.com/baptisteArno/typebot.io/issues/456)) [[27f1015](https://github.com/baptisteArno/typebot.io/commit/27f10159ef0fbd30b70fea48deef318d7c93b82f)]
- 🛂 Add new yearly plans and graduated pricing [[2cbf834](https://github.com/baptisteArno/typebot.io/commit/2cbf8348c34c81b89efb963fa754986729232748)]
- 🛂 Prevent blocking everything once limit is reached [[846dac0](https://github.com/baptisteArno/typebot.io/commit/846dac0bf40bdc27a4df12fe16779525aeece12a)]
-  More translation in FR &amp; PT ([#436](https://github.com/baptisteArno/typebot.io/issues/436)) [[75d2a95](https://github.com/baptisteArno/typebot.io/commit/75d2a95d0897ff7d1942f2fc66e8426beaad6e64)]


<a name="2.12.0"></a>
## 2.12.0 (2023-04-05)

### New features

- ✨ Add ChatGPT personas template [[f895c6d](https://github.com/baptisteArno/typebot.io/commit/f895c6d72d276c726e8254e1e8b69792a0cbce71)]
- ✨ Add Unsplash picker [[3ef4efa](https://github.com/baptisteArno/typebot.io/commit/3ef4efab4e0d85839f07de94456e8a2762ffa416)]

### UI/UX Improvements

- 🚸 (js) Display last input if send message errored [[9f8398b](https://github.com/baptisteArno/typebot.io/commit/9f8398b9aecbfe2b42e658e2afa4ada084fd9b8c)]
- 🚸 (webhook) Always show save response accordion [[b96a3a6](https://github.com/baptisteArno/typebot.io/commit/b96a3a6a8e38a919a7365faaa3430afd22a5ae97)]
- 🚸 (results) Improve list variables display in results table [[411cf31](https://github.com/baptisteArno/typebot.io/commit/411cf31b397fba2b810b33e0b57bfa4a4eb9b159)]
- ♿ (js) Add &quot;large&quot; bubble button size and part attr [[3cfdb81](https://github.com/baptisteArno/typebot.io/commit/3cfdb8179e3503b67665a3338356bd6bbf6edb92)]
- ♿ (billing) Add HU VAT option [[70416c0](https://github.com/baptisteArno/typebot.io/commit/70416c0d144eabaeef03ab98c7f554fa7479b07b)]
- ⚡ (condition) Add more comparison operators [[80b7dbd](https://github.com/baptisteArno/typebot.io/commit/80b7dbd19e94435733ae0e5057de9045ec9412af)]
- ⚡ (payment) Add description option on Stripe input [[bb45b33](https://github.com/baptisteArno/typebot.io/commit/bb45b33928d48a3d376fdbc19122646447b54a93)]
- ♿ (openai) Show textarea instead of text input for message content [[50db998](https://github.com/baptisteArno/typebot.io/commit/50db9985c44bf25fc1cd555eee6e606f23c942c3)]

### Fixed

- 🐛 Fix error display on preview start [[3196fe3](https://github.com/baptisteArno/typebot.io/commit/3196fe375985e90d6246010eca00b5e08694eed4)]
- 🚑 (auth) Fix bad requests with getSession on server side [[49071b7](https://github.com/baptisteArno/typebot.io/commit/49071b73b6424490af8aeb38e207b8b80ae2446c)]
- 🐛 (editor) Make sure you can&#x27;t remove the Start group [[d32afd8](https://github.com/baptisteArno/typebot.io/commit/d32afd8ba69b1b68860b9ceeceda52147f70cf76)]
- 🐛 (embedBubble) Fix sanitize url adding https to variable [[b9ae314](https://github.com/baptisteArno/typebot.io/commit/b9ae314ef9bee4f027eb61be644210c4b0a15e2e)]
- 🐛 (typebotLink) Fix Out of sort memory with mySQL DB [[79c1b16](https://github.com/baptisteArno/typebot.io/commit/79c1b16ec4d2a915a3f9aad23ea32a80b55fb45e)]
- 🐛 (typebotLink) Fix linked typebot fetching error [[684e633](https://github.com/baptisteArno/typebot.io/commit/684e6338e2374cd30603a24ca20fb993e757fd73)]

### Content

- 📝 (openai) Add a troobleshooting section [[f18889a](https://github.com/baptisteArno/typebot.io/commit/f18889a0468661a0f6b1cfc685283a4f83317e42)]
- 📝 Add set variable upper and lower case examples [[14abe76](https://github.com/baptisteArno/typebot.io/commit/14abe76691036dc3618571b6357d80c71e27e5cc)]
- 📝 (sheets) Add instructions on how to format spreadsheet [[61981f9](https://github.com/baptisteArno/typebot.io/commit/61981f9e9255633c92559eba279c26d3fe8769a4)]

### Miscellaneous

- 🩹 (billing) Also reset custom limits when plan is cancelled [[2dae416](https://github.com/baptisteArno/typebot.io/commit/2dae4160bd334ae7b9462aba094cba1621b3bc58)]


<a name="2.11.9"></a>
## 2.11.9 (2023-03-29)

### New features

- ✨ (theme) Add theme templates [[38ed575](https://github.com/baptisteArno/typebot.io/commit/38ed5758fe9e50804f75e15bc389a0cb89b248f1)]

### UI/UX Improvements

- 💄 Fix misc UI issues [[f13d7a1](https://github.com/baptisteArno/typebot.io/commit/f13d7a1a5ae1e5df1e11fc6d37b94948e5c655cf)]

### Fixed

- 🐛 (auth) Fix invalid redirects to internal url [[4986ec7](https://github.com/baptisteArno/typebot.io/commit/4986ec79f5f9714fc89f753779f17396a719334a)]

### Content

- 📝 (api) Better theme template api section title [[94aadc8](https://github.com/baptisteArno/typebot.io/commit/94aadc83619499334f0e7124b23e93ff08be1e03)]

### Miscellaneous

- 🩹 (theme) Remove default opened accordion in Theme [[14d7ebd](https://github.com/baptisteArno/typebot.io/commit/14d7ebd58c3772da4706e02a73f5235b66fb6cd4)]


<a name="2.11.8"></a>
## 2.11.8 (2023-03-28)

### Fixed

- 🐛 (auth) Fix magic link callback url pointing to internal url [[2946f3e](https://github.com/baptisteArno/typebot.io/commit/2946f3ee3b0dd763c93234f3adb671c8de2bdd6a)]
- 🐛 (wp) Fix wordpress user parsing [[cbeb275](https://github.com/baptisteArno/typebot.io/commit/cbeb2751640b195466f2073b311b32bd45b5d48e)]


<a name="2.11.7"></a>
## 2.11.7 (2023-03-28)

### UI/UX Improvements

- 🚸 (editor) Improve block dragging behavior [[92b92ed](https://github.com/baptisteArno/typebot.io/commit/92b92ed26806ac35f75e060fa6d53ef1e1ca597b)]

### Fixed

- 🐛 (auth) Fix email magic link pointing to internal auth URL [[5e91f4d](https://github.com/baptisteArno/typebot.io/commit/5e91f4d0efc3f681f34201b5da30ce645f1db1dd)]
- 🐛 Fix parseVariables when preceding with a dollar sign [[5fb5176](https://github.com/baptisteArno/typebot.io/commit/5fb51766415bc69792a711848105b8f2c40df912)]
- 🐛 (variables) Correctly parse variables in template literals [[fa31984](https://github.com/baptisteArno/typebot.io/commit/fa31984456898c4d3dd66c472a2b9423095f9f6f)]

### Content

- 📝 Add better examples about variables evaluation on Set variable block [[787ac50](https://github.com/baptisteArno/typebot.io/commit/787ac50f90f9fcf9de3cade64e7ee01b60e68609)]
- 📝 Add required asterix in apps config [[e1de63a](https://github.com/baptisteArno/typebot.io/commit/e1de63a405b8824561aa3d06bc242e71cc121345)]
- 📝 Add explanations about how variables are evaluated in code [[69ee590](https://github.com/baptisteArno/typebot.io/commit/69ee5900b4ec5cd52045ce753ce88033cd17752d)]

### Miscellaneous

- 🩹 (js) Move data-blockid to the right element [[5090bad](https://github.com/baptisteArno/typebot.io/commit/5090badfa985c681c172484a7fd4514c097e077f)]


<a name="2.11.6"></a>
## 2.11.6 (2023-03-22)

### UI/UX Improvements

- ⚡ (theme) Add corner roundness customization [[65d33e0](https://github.com/baptisteArno/typebot.io/commit/65d33e04bc6b993d2c9e3d42ee7509cd90a88aed)]
- ⚡ (theme) Support for image background [[3992227](https://github.com/baptisteArno/typebot.io/commit/3992227afc050e5adb23d7644b0b1df338728e2a)]
- ♿ Attempt to disable translation to avoid app crashes [[1cf2195](https://github.com/baptisteArno/typebot.io/commit/1cf2195b4a1812e28e9dfb4a82a09d00863b1f5a)]
- 🚸 (sendEmail) Improve file attachments label [[925cf68](https://github.com/baptisteArno/typebot.io/commit/925cf681194846d6ab551ffd8719bbafe3c228e8)]
- 🚸 (variables) Allow null values in variable list [[0c39ae4](https://github.com/baptisteArno/typebot.io/commit/0c39ae41b6e8b191be496f8d9ff74c6f15090c9c)]
- ⚡ (openai) Add gpt-4 models and temperature setting [[4109a84](https://github.com/baptisteArno/typebot.io/commit/4109a8489ccc21c22506ea89cd48ac38052e6f33)]
- ♿ (phone) Remove spaces from format [[3d6d643](https://github.com/baptisteArno/typebot.io/commit/3d6d643a7e828fbe0b101c46aedcfe61a25d6634)]
- 💄 (lp) Fix overflow issue on mobile [[b3e5887](https://github.com/baptisteArno/typebot.io/commit/b3e5887420bacc475f29f2b33727ac1a35b332c6)]

### Fixed

- 🐛 Fix focus after selecting mark in text editor [[02d25d0](https://github.com/baptisteArno/typebot.io/commit/02d25d0fc78a1d5266d64eadcc8aee2062e4627a)]
- 🐛 Transform upload file redirect to a rewrite [[c52a284](https://github.com/baptisteArno/typebot.io/commit/c52a284013b81a7cc0b1c7a9cd8bc7df0f3aa57a)]
- 💚 Fix Sentry sourcemap upload [[90cb075](https://github.com/baptisteArno/typebot.io/commit/90cb0750b848937d2d591c19ebf0f3e32f3c1085)]
- 🐛 (js) Fix upload file in linked typebot [[b4536ab](https://github.com/baptisteArno/typebot.io/commit/b4536abc2f72c2d770d6d8c67566bd4188a6c665)]
- ✏️ Fix old packages/db paths in documentation [[16c261a](https://github.com/baptisteArno/typebot.io/commit/16c261a8a539a7b3fc2962d68655e3da5b4aea26)]
- 🐛 (sheets) Fix can&#x27;t start bot when filter is undefined [[be7c0fc](https://github.com/baptisteArno/typebot.io/commit/be7c0fc0d07ad4d5c007a609142923cc9e87302f)]
- 💚 Fix isFirstOfKind filter [[f9964e3](https://github.com/baptisteArno/typebot.io/commit/f9964e3f60f3343cb7d40ed715e03a732b794077)]

### Content

- 📝 Improve license scenarios with collapsibles [[9147c8c](https://github.com/baptisteArno/typebot.io/commit/9147c8cd14a766a2e0609439cfe5c0ec57f8e545)]
- 📝 (openai) Add youtube video about the basic chatgpt template [[7340ec1](https://github.com/baptisteArno/typebot.io/commit/7340ec139c5627c4257bda9a398764a440fcb0ef)]
- 📝 Improve License explanations [[1e67fd7](https://github.com/baptisteArno/typebot.io/commit/1e67fd7c3f78754637b4d6138e5c49c433e98339)]

### Miscellaneous

- 🛂 Improve lite-badge style forcing [[a41c65f](https://github.com/baptisteArno/typebot.io/commit/a41c65f528b5d2a795efac8ea37d5541b66bc8b3)]
- 🧑‍💻 (js) Add data-blockid on input elements [[efdcec1](https://github.com/baptisteArno/typebot.io/commit/efdcec1c0c8e969d9478f3ac1cb867f371afb5b8)]


<a name="2.11.5"></a>
## 2.11.5 (2023-03-15)

### Fixed

- 🐛 (openai) Fix assistant sequence was not correctly saved [[5aec8b6](https://github.com/baptisteArno/typebot.io/commit/5aec8b6c6682aa2da4034230a894f02add2faef2)]
- 💚 Fix docs build failing [[76a8064](https://github.com/baptisteArno/typebot.io/commit/76a8064e7cf76650f85889bc5866e9b14b39f992)]
- 🐛 (lp) Fix real time airtable bot [[67cb4b4](https://github.com/baptisteArno/typebot.io/commit/67cb4b4878ed80e60a88d6a260a1b4b79016de55)]
- 🐛 (js) Fix preview message without avatar [[e713211](https://github.com/baptisteArno/typebot.io/commit/e7132116f43896ad1e73eae5af123d53e6320cde)]

### Internal

- ♻️ Fix folder case issue [[3a6c096](https://github.com/baptisteArno/typebot.io/commit/3a6c09646194f3899bbaa7ed9c38a4501eec269f)]
- ♻️ Fix folder case issue (wip) [[3d3670d](https://github.com/baptisteArno/typebot.io/commit/3d3670d740212f836ecf02eb37649682b8773d17)]
- ♻️ (viewer) Remove barrel exports and flatten folder arch [[f3af07b](https://github.com/baptisteArno/typebot.io/commit/f3af07b7ffb660bd9040e1f08839ab3809a5683d)]
- ♻️ (builder) Remove barrel export and flatten folder arch [[44d7a0b](https://github.com/baptisteArno/typebot.io/commit/44d7a0bcb87494cb51a422350ea75a4df0c9a966)]
- ♻️ Re-organize workspace folders [[cbc8194](https://github.com/baptisteArno/typebot.io/commit/cbc8194f19396ed8f8b3ea05d75223beeab42c3c)]
- ♻️ Replace schemas with merge and discriminated unions [[d154c4e](https://github.com/baptisteArno/typebot.io/commit/d154c4e2f2ed0548130344ede257e19fb43f6be7)]


<a name="2.11.4"></a>
## 2.11.4 (2023-03-13)

### New features

- ✨ Add basic ChatGPT template [[86ecd4a](https://github.com/baptisteArno/typebot.io/commit/86ecd4aa8703665b073cb8d5338899cc4de05d73)]
- ✨ Add movie recommendation template [[53cdb35](https://github.com/baptisteArno/typebot.io/commit/53cdb3598410ac6fa4680d4dfdad71342890ebb9)]
- ✨ Add OpenAI block [[ff04edf](https://github.com/baptisteArno/typebot.io/commit/ff04edf1395770145a89ce2f8303a00cac357c6e)]

### UI/UX Improvements

- ⚡ (openai) Add Messages sequence type [[c4db2f4](https://github.com/baptisteArno/typebot.io/commit/c4db2f42a62e43dc7d30af5e0d3dc263e47c3e0a)]
- 🚸 Improve magic link sign in experience [[48db171](https://github.com/baptisteArno/typebot.io/commit/48db171c1b5fb5bdc1837bd2fae06d6ab80f4ca4)]
- ♿ (editor) Allow empty group titles [[f9aef90](https://github.com/baptisteArno/typebot.io/commit/f9aef907e3e09958eb1f595dcfee71c384101c9b)]
- 💄 (js) Make sure lite badge can&#x27;t be hidden [[1863281](https://github.com/baptisteArno/typebot.io/commit/186328132f8c200d7548df6e8e97aeea72a25649)]
- 🌐 Introduce i18n [[138f3f8](https://github.com/baptisteArno/typebot.io/commit/138f3f8b076137604ccec76da16b37ccf3e886d3)]
- 🚸 (chatwoot) Add close widget task [[9785a0d](https://github.com/baptisteArno/typebot.io/commit/9785a0df5c11dc88ba9534e45419ba41d71a5085)]
- 💄 Add backgroundColor theme field for Popup [[15c1432](https://github.com/baptisteArno/typebot.io/commit/15c1432c32725da0250ca5d30b2447e8514ef9a4)]
- ⚡ (wp) Add custom api host for WP plugin [[ddd20f6](https://github.com/baptisteArno/typebot.io/commit/ddd20f62353f86f669643b551bbf615ae912919d)]
- 🚸 (phone) Improve phone input behavior and validation [[6b08df7](https://github.com/baptisteArno/typebot.io/commit/6b08df71bab3bc2bd23c253bea1a26154713292f)]

### Fixed

- 🐛 Fix form urlencoded content-type webhooks [[bcad99f](https://github.com/baptisteArno/typebot.io/commit/bcad99f555fbbb5850954aa95d78ea0bb17b219d)]
- 🐛 (js) Fix popup closing on bot click [[4ae9ea3](https://github.com/baptisteArno/typebot.io/commit/4ae9ea32e4b6ae0967e2b1f996a64aef3455478b)]
- 🐛 (js) Enable prefill for date input [[a66a1e8](https://github.com/baptisteArno/typebot.io/commit/a66a1e822655934881fde62f8b93ec87dc6d45c7)]
- 💚 More efficient db clean script with chunked operations [[5d8c990](https://github.com/baptisteArno/typebot.io/commit/5d8c990c0545e2d9f92f8b2116988f633ae79e35)]
- 🐛 (js) Fix dynamic avatar on mount [[883d519](https://github.com/baptisteArno/typebot.io/commit/883d519875b3d16e668f7766fcf46a18b493616a)]
- 🐛 Incorrect Jump block duplication on typebot import [[26c80f0](https://github.com/baptisteArno/typebot.io/commit/26c80f064f60c497433d98f9da5df0748d8d636e)]
- 🐛 (editor) Fix code editor variable insertion position [[5bbb539](https://github.com/baptisteArno/typebot.io/commit/5bbb5394ba83aa68424a78058305f6c944d6081b)]
- 🐛 (date) Fix date picker UI when editor is in dark mode [[e680d13](https://github.com/baptisteArno/typebot.io/commit/e680d133a5533851c84b492595e692111eec6bd5)]
- 🐛 Fix theme avatar form variable click unfocus bug [[5435452](https://github.com/baptisteArno/typebot.io/commit/5435452ab01a7cb244328102d8a436c05e3941aa)]

### Content

- 📝 Improve description for DISABLE_SIGNUP param [[8df8307](https://github.com/baptisteArno/typebot.io/commit/8df830721c1f47bd6e0084ec4fbd2301714c9d0e)]

### Miscellaneous

- 🩹 Fix crash on bot load when it has no groups [[bf1fbf2](https://github.com/baptisteArno/typebot.io/commit/bf1fbf2c5362fa3f69a0e9fb2f895ac45b5d1f80)]


<a name="2.11.3"></a>
## 2.11.3 (2023-03-08)

### New features

- ✨ Add NPS Survey template [[852cc73](https://github.com/baptisteArno/typebot.io/commit/852cc735119f5885aafd68bd6c7848837090f6ac)]
- ✨ Add new Jump block [[022c5a5](https://github.com/baptisteArno/typebot.io/commit/022c5a573818275b4934fe19e902242ba8fddb45)]

### UI/UX Improvements

- 💄 (js) Fix spacings related to avatars [[b2fa202](https://github.com/baptisteArno/typebot.io/commit/b2fa2024a7b735fa58559b342569602cdcd44297)]
- 🚸 (condition) Improve comparison with lists [[0c19ea2](https://github.com/baptisteArno/typebot.io/commit/0c19ea20f8dec85fa6a7a7c5afd6b2dbfaafa7e2)]
- 💄 (editor) Fix some overflow issues with long variable names [[f527df8](https://github.com/baptisteArno/typebot.io/commit/f527df82dd14ce3448a2af01714b48ece72b6232)]
- 🚸 (billing) Add precheckout form [[26e5d9c](https://github.com/baptisteArno/typebot.io/commit/26e5d9c282df0f338401430f590b2571e97b2f55)]
- ⚡ (webhook) Enable advanced config for Zapier and Make.com [[c1a636b](https://github.com/baptisteArno/typebot.io/commit/c1a636b965ae457e1a2fb89d41fb1459a32f2da5)]
- 🚸 (js) Improve phone number parsing [[f1a9a1c](https://github.com/baptisteArno/typebot.io/commit/f1a9a1ce8bd87d092b35e25f6cdb9ec47116e227)]
- 🚸 Add a better select input [[cc7d728](https://github.com/baptisteArno/typebot.io/commit/cc7d7285e57e066fc90b564839627191a269796d)]

### Fixed

- 🐛 (webhook) Fix getResultSample when linked typebot not found [[167d366](https://github.com/baptisteArno/typebot.io/commit/167d366d55f8b05fd720d1450b4cda1e047d5a9f)]
- 🐛 (billing) Collect tax ID manually before checkout [[767a820](https://github.com/baptisteArno/typebot.io/commit/767a8208a8ac174b881271a1e0f8a834a50e9b8c)]
- 🐛 (js) Make sure lite badge is displayed [[5bda556](https://github.com/baptisteArno/typebot.io/commit/5bda556200ea9730cfa611f85811701ad60e1b7e)]
- 🐛 Reset custom domain on typebot archive [[6375a75](https://github.com/baptisteArno/typebot.io/commit/6375a7506555e9a1dc41c3fd8a68287b4a74e322)]
- 🐛 (results) Make sure all columns are parsed in the export [[5c31048](https://github.com/baptisteArno/typebot.io/commit/5c3104848ef46684a55dd6f52a3a34a780c207c4)]
- 🐛 (sheets) Correctly parse variables when getting data [[7d56d5b](https://github.com/baptisteArno/typebot.io/commit/7d56d5b39e2f83a73b1c23fd99393eaa4e283e3a)]
- 🐛 (sheets) Save variable first item if length of 1 [[04028e7](https://github.com/baptisteArno/typebot.io/commit/04028e74d9d6aba90062c7d29c3e06e9b5a61f8a)]

### Content

- 📝 (api) Add protection to sendMessage api ref to test with auth token [[83ae81c](https://github.com/baptisteArno/typebot.io/commit/83ae81ccc6659f7436bb821bc4faf4c3c01e20e3)]
- 📝 (wp) Update wordpress metadata [[67a3f42](https://github.com/baptisteArno/typebot.io/commit/67a3f42edd8172e9db499cb43f5653e879b4c37f)]
- 📝 (lp) Update testimonials content [[6cd1db7](https://github.com/baptisteArno/typebot.io/commit/6cd1db7ba7653206ec4e098f91e79f9f42d96b47)]

### Internal

- 🗃️ Remove updatedAt field from Result [[2788d58](https://github.com/baptisteArno/typebot.io/commit/2788d58e50f50e2937b59dfbeddedcbf19602bf3)]
- 🔥 Remove disable response saving option [[b77e2c8](https://github.com/baptisteArno/typebot.io/commit/b77e2c8d2cf1e131136f98d33b434d90a787d38a)]
- 🔥 Remove useless stripe env check for usage [[eb3ae8f](https://github.com/baptisteArno/typebot.io/commit/eb3ae8fc35091691222e67d7a2bf652041f1f536)]


<a name="2.11.2"></a>
## 2.11.2 (2023-03-02)

### UI/UX Improvements

- ♿ (js) Use px instead of rem to look good on any website [[cce63df](https://github.com/baptisteArno/typebot.io/commit/cce63dfea307338ff7f954024bd705f76aeb022a)]
- 🚸 (webhook) Also add atomic deep keys selection [[73f4846](https://github.com/baptisteArno/typebot.io/commit/73f4846e1ba8a0ebf726099527f3de6c73e4bbf0)]

### Fixed

- 🚑 (webhook) Remove get deep keys test sample [[9d96805](https://github.com/baptisteArno/typebot.io/commit/9d96805d84810390586e01b9806ee157d522afb4)]
- 🐛 (viewer) Fix client side action when in separate group [[a1cf1e8](https://github.com/baptisteArno/typebot.io/commit/a1cf1e89e79855d3788693a801ebc7db23290240)]
- 🐛 (settings) Fix custom head code not updating [[4968ed4](https://github.com/baptisteArno/typebot.io/commit/4968ed4202fe99031be559bc44f2b3ed6222925f)]
- 🐛 (condition) Fix contains not working with lists [[506fe00](https://github.com/baptisteArno/typebot.io/commit/506fe003d1c25b3f9b4b0ec4443db4aff7efb668)]

### Content

- 📝 Add change password faq [[b2ad91c](https://github.com/baptisteArno/typebot.io/commit/b2ad91c11fff7cc9595eb5e109ebbf1e3e7b87a4)]


<a name="2.11.1"></a>
## 2.11.1 (2023-03-02)

### UI/UX Improvements

- 🚸 (js) Parse script to content to remove useless script tags if any [[cc07389](https://github.com/baptisteArno/typebot.io/commit/cc07389c37e1008dc5041bb22162bfc69fd5eac4)]

### Fixed

- 🐛 (js) Improve session remember behavior [[ba253cf](https://github.com/baptisteArno/typebot.io/commit/ba253cf3e9574ba53ec6d142e87a8ef44da69f10)]
- 🐛 (editor) Graph connectors still displayed when switching to dynamic buttons [[c172a44](https://github.com/baptisteArno/typebot.io/commit/c172a44566ae6f27710c38286b0b60ea4a7f7e0a)]
- 🐛 (share) Fix publicId null when publishing [[eebcbb1](https://github.com/baptisteArno/typebot.io/commit/eebcbb10b820a0a5ac8705a28a965d8fcb2243e8)]


<a name="2.11.0"></a>
## 2.11.0 (2023-03-01)

### UI/UX Improvements

- ⚡ (editor) Improve edges responsiveness [[f8f98ad](https://github.com/baptisteArno/typebot.io/commit/f8f98adc1cc4359353339e279b6dedf2d7f6808d)]
- ♿ (viewer) Show error message for incompatible browsers [[edf0ecd](https://github.com/baptisteArno/typebot.io/commit/edf0ecd7125ed028e1b28342d6e693c0012a2fe8)]

### Fixed

- 🐛 (webhook) Fix deep key parser dropdown [[8672dfe](https://github.com/baptisteArno/typebot.io/commit/8672dfe9d7ffc44b01058d6ef10c58922d182743)]
- 🐛 (js) Improve bubbles callback reliability [[f6e128b](https://github.com/baptisteArno/typebot.io/commit/f6e128be37fe6b5039da1ae72a48ba34d9ac518e)]
- 🚑 (editor) Fix block drag when dropping at same spot [[5024c1b](https://github.com/baptisteArno/typebot.io/commit/5024c1b22b3a31d3cc93a314200be3623e10facc)]
- 🐛 (script) Execute client side actions before first bubbles [[d5b8a43](https://github.com/baptisteArno/typebot.io/commit/d5b8a43d3f78ec25616e018c413f7f5f0cf1862f)]
- 🐛 (editor) Flush code editor value when closing [[d57fb47](https://github.com/baptisteArno/typebot.io/commit/d57fb4738d08910fae3605c4fea8dd28eda9913e)]
- 🐛 Attempt to fix load crash on UC Browser [[5dd8755](https://github.com/baptisteArno/typebot.io/commit/5dd87554c32e340a66777adaa3ba29c4e083ec6e)]
- 🐛 (wordpress) Fix admin critical bug and better lib import [[c889f30](https://github.com/baptisteArno/typebot.io/commit/c889f302f6a19ebcf4322011e1c8e668b7be114e)]
- 🐛 (webhook) Test response was not updating [[67e1fd2](https://github.com/baptisteArno/typebot.io/commit/67e1fd2e14334c65763983c7e9c72b0922934de1)]

### Content

- 📝 Add dynamic buttons section [[caf4086](https://github.com/baptisteArno/typebot.io/commit/caf4086dd827404f53bb229f344794e9bfeb47c3)]
- 📝 Add API share instructions [[eaf8024](https://github.com/baptisteArno/typebot.io/commit/eaf8024c84ba9a4d9f58a162bebe171e6a8e3fc7)]
- 📝 (embed) Add new script embed instructions [[2b2b1c3](https://github.com/baptisteArno/typebot.io/commit/2b2b1c3d6d197df5b87a795d06e6f509ea162ab6)]
- 📝 (wordpress) Add litespeed localization issue instruction [[712daf7](https://github.com/baptisteArno/typebot.io/commit/712daf7ab3ab6ab6291975064f7d8b2881586813)]

### Internal

- ♻️ Better phone input props pass [[73ef12d](https://github.com/baptisteArno/typebot.io/commit/73ef12db7209a53b76dcaa91f5da22eaefb1242e)]
- ♻️ Improve new version popup polling [[2fc78a5](https://github.com/baptisteArno/typebot.io/commit/2fc78a5b7d8c1cbe249dca911e97dae9d1c70a39)]
- 🔥 (viewer) Remove buttons input validation [[186b376](https://github.com/baptisteArno/typebot.io/commit/186b3760389c74b0451fc2430eba23ec9941553a)]

### Miscellaneous

- 🩹 (viewer) Add path where old engine is forced [[680e967](https://github.com/baptisteArno/typebot.io/commit/680e967a8cba838acaa3ea312874475ef3b448b9)]
- 🩹 (billing) Leave the email checkout field empty [[8034cee](https://github.com/baptisteArno/typebot.io/commit/8034ceeede003a571c78a8dc8c4335cf19afa7e1)]
- 🛂 (billing) Enable tax id and billing address collection [[2e8f2d8](https://github.com/baptisteArno/typebot.io/commit/2e8f2d81c6f34b1ec32bebb28edbc993a755d734)]
- 🩹 (sendEmail) Save error first in logs [[761e1c7](https://github.com/baptisteArno/typebot.io/commit/761e1c71844f4cc4a70147984d6155105b24c68b)]


<a name="2.10.5"></a>
## 2.10.5 (2023-02-23)

### New features

- ✨ (buttons) Allow dynamic buttons from variable [[2ff6991](https://github.com/baptisteArno/typebot.io/commit/2ff6991ca730b895ce86e07cd84f9b2e42ca0425)]
- ✨ Add new user onboarding template [[00b6acc](https://github.com/baptisteArno/typebot.io/commit/00b6acca8e4fd14a6528413a0aaed58e2f805bde)]
- ✨ (preview) Add preview runtime dropdown [[3967e5f](https://github.com/baptisteArno/typebot.io/commit/3967e5f1d0bddb122a4eec4e5815ab599228baf2)]
- ✨ Introduce bot v2 in builder ([#328](https://github.com/baptisteArno/typebot.io/issues/328)) [[debdac1](https://github.com/baptisteArno/typebot.io/commit/debdac12ff238c2a083c020a9dc00173ba7fbad3)]

### UI/UX Improvements

- 🚸 (editor) Show toolbar on group click [[0619c60](https://github.com/baptisteArno/typebot.io/commit/0619c609704ee937e16dcbce4697910dea6f9aa7)]
- ⚡ Fix / improve results archive crash when too many [[cc9817b](https://github.com/baptisteArno/typebot.io/commit/cc9817b2e36474adbcb5201ce4e7f99d0dd2599d)]
- 💄 Improve new version popup animation [[31711dc](https://github.com/baptisteArno/typebot.io/commit/31711dc24d79b3cc2e967234360e247258ffe3a4)]
- 🚸 (editor) Make expanded settings window bigger [[a265143](https://github.com/baptisteArno/typebot.io/commit/a265143dc03dc65175f26659212b2fe2e36d4d89)]
- 🚸 (bot) Show a popup when the redirect is blocked by browser [[b2d1235](https://github.com/baptisteArno/typebot.io/commit/b2d1235f1b48bda4642ed500e4bbff1be120e9cb)]

### Fixed

- 🐛 (buttons) Fix dynamic buttons edge not showing [[e1b7320](https://github.com/baptisteArno/typebot.io/commit/e1b7320f6f2c2e6ec72265cdf0b3c3df2e6eee79)]
- 💚 Fix Vercel build due to unnecessary dev packages upload [[8462810](https://github.com/baptisteArno/typebot.io/commit/84628109d07103770f4631f6d689838ab42753f5)]
- 🐛 (editor) Fix text bubble refocus carret position [[bc47cc4](https://github.com/baptisteArno/typebot.io/commit/bc47cc46c0b2b8382046399ab13bddf139736337)]
- 🐛 (editor) Fix saving typebot after undoing changes [[671c2cb](https://github.com/baptisteArno/typebot.io/commit/671c2cb1011e47341cdb466ae67b20f32e36b759)]
- 🐛 (settings) Fix typing emulation not working [[889e6a4](https://github.com/baptisteArno/typebot.io/commit/889e6a4f7e61614442bdd36ff568fbfc8a891138)]
- 🐛 (setVariable) Avoid evaluate code if single variable [[6339f44](https://github.com/baptisteArno/typebot.io/commit/6339f442bf1ef693d87059e4181f09a02716038e)]
- 💚 Don&#x27;t trigger docker deployment on new lib tags [[96f5e4d](https://github.com/baptisteArno/typebot.io/commit/96f5e4db9e20ff67e1ad16d222b9b70f9f2ade84)]
- 🐛 Fix bot not proceeding when embedded [[bdf088b](https://github.com/baptisteArno/typebot.io/commit/bdf088bd9530e11e32cdd8153ea8098e11a1da8c)]
- 🐛 (phone) Fix phone number parsing and default country [[4efe2c4](https://github.com/baptisteArno/typebot.io/commit/4efe2c48bb92d64b3fb7d7fd1ac9cf1368d76b76)]
- 🐛 Correctly update prefilled variables [[d8194ff](https://github.com/baptisteArno/typebot.io/commit/d8194ff9987dc07a3c4643a19defc36fab98a2d2)]
- 🐛 Fix bubble proper cleanup function [[541dcd2](https://github.com/baptisteArno/typebot.io/commit/541dcd2bb78f018ce24032813f3f5faf8b8cb85e)]
- 🐛 Make sure variables are properly overwritten [[148315f](https://github.com/baptisteArno/typebot.io/commit/148315f6eeb552a68fd6daa2b967597e966c4327)]
- 🐛 Fix variable buttons with new engine [[83ae57c](https://github.com/baptisteArno/typebot.io/commit/83ae57cf0c950159ccb5adeeb707bdb095afda61)]
- 🐛 Use position fixed for bubble [[527dc8a](https://github.com/baptisteArno/typebot.io/commit/527dc8a5b11b198a5cbc605a60487c6b5e469025)]
- 🐛 Improve bot libs mount in prod env [[907cad8](https://github.com/baptisteArno/typebot.io/commit/907cad805031e75161dd2dc83b1f962769208a84)]
- 🐛 Fix bot libs mount behavior and prop types [[46bf25a](https://github.com/baptisteArno/typebot.io/commit/46bf25a5806dc763823bd3f896445977ce64b948)]
- 🐛 (typebot) Attempt to fix updatedAt comparison with different timezones [[6c2df1a](https://github.com/baptisteArno/typebot.io/commit/6c2df1a474dbd0ec80ea9a6b8bd1ece792c3f4d1)]

### Content

- 📝 Add appropriate docs for new @typebot.io libs [[a4e3f4b](https://github.com/baptisteArno/typebot.io/commit/a4e3f4bf9c072ba0af1be1d32b1f818c21f7c2c4)]

### Internal

- ♻️ Fix eslint warnings [[be4c8e0](https://github.com/baptisteArno/typebot.io/commit/be4c8e0760046f4a50d3806760694a689f454812)]

### Miscellaneous

- 🧑‍💻 Better Typebot import in vanilla JS sites [[ab43d80](https://github.com/baptisteArno/typebot.io/commit/ab43d809c36a2879d440eba5b3e318beb5f6b864)]


<a name="2.10.4"></a>
## 2.10.4 (2023-02-19)

### UI/UX Improvements

- ⚡ (embedBubble) Enable variable embed height [[621cd58](https://github.com/baptisteArno/typebot.io/commit/621cd58244d5a21271a2dff6223b64f2c3a8ceb5)]
- 💄 Improve new version popup ui [[0e1fa4e](https://github.com/baptisteArno/typebot.io/commit/0e1fa4e339aad615a2925f3b2ac6a56c8d0315c5)]
- 🚸 (typebotLink) Exclude current bot name from select list [[9624387](https://github.com/baptisteArno/typebot.io/commit/962438768ec5c2e97f47781b5d3dbad04cdfb9a2)]
- 🚸 (editor) Improve typebot updatedAt detection [[4a0dd0b](https://github.com/baptisteArno/typebot.io/commit/4a0dd0b3dda546b3a472f6f2b8c336daf02cceac)]
- ♿ (editor) Improve variables popover click detection [[618eb8a](https://github.com/baptisteArno/typebot.io/commit/618eb8a8827e1789d9041b34e6d0a474c74436ea)]
- ♿ Add an update notification popup [[8ac3784](https://github.com/baptisteArno/typebot.io/commit/8ac3784c0fa477b9b6ecd5b6102865268e4c4d1f)]
- 💄 Add proper italic fonts in bot [[435edd0](https://github.com/baptisteArno/typebot.io/commit/435edd03c09073442fdd19fb32157bd21e2c16ff)]
- 💄 (collaborator) Fix collab list UI [[6e066c4](https://github.com/baptisteArno/typebot.io/commit/6e066c44e109ccb830d0f4672790a5e66f190699)]

### Fixed

- 💚 Build docker images for postgresql only [[8a0155d](https://github.com/baptisteArno/typebot.io/commit/8a0155dab8651c0deca4a65b265879e36b731674)]
- 🐛 (typebot) Make sure old typebot properties are removed when pulled [[d22cc45](https://github.com/baptisteArno/typebot.io/commit/d22cc45a97bc6466c2fb32408e1ca49a88b13d5e)]
- 🐛 (webhook) Fix record to update not found [[c32aadc](https://github.com/baptisteArno/typebot.io/commit/c32aadc95b8a812100e10a7994284b0746e6074f)]
- 🐛 (billing) Fix crash when having a draft invoice [[d805ea9](https://github.com/baptisteArno/typebot.io/commit/d805ea9c10c393c5e7285602286ec28916c9373b)]
- 🐛 (bot) Still parse variables value if code fails [[44cb14d](https://github.com/baptisteArno/typebot.io/commit/44cb14d0cb95e046117ac9fe8b2b7d319600da9a)]
- 🐛 (editor) Fix update typebot when having more than 100.000 results [[3a9e359](https://github.com/baptisteArno/typebot.io/commit/3a9e35916abfc957637389df9313f8573fc60fbb)]
- 🐛 Fix input file empty error [[d0a8faa](https://github.com/baptisteArno/typebot.io/commit/d0a8faa3e7fded1b917d204174eb74c9c1e5a7b9)]
- 🐛 (typebotLink) Fix typebotIds infinite query param [[2f7e71f](https://github.com/baptisteArno/typebot.io/commit/2f7e71f66e7eb88b2ddc681fd0cb9f81cb38bc21)]

### Content

- 📝 Add a &quot;Publish&quot; doc [[fde14a8](https://github.com/baptisteArno/typebot.io/commit/fde14a800dba9f11cfd6589e44916758c98d3687)]

### Internal

- ♻️ (auth) Make sure new users have an email [[0831dcf](https://github.com/baptisteArno/typebot.io/commit/0831dcf72a3f0761e583555185dc41c114ae6f43)]
- ♻️ (billing) Refactor billing server code to trpc [[b73282d](https://github.com/baptisteArno/typebot.io/commit/b73282d8108dbeca7d09e46920d627d07ed52c1a)]
- ♻️ (results) Remove unecessary totalSelected compute [[44d7740](https://github.com/baptisteArno/typebot.io/commit/44d77409523a62850d712f4550caa5b6fdd9a8e5)]
- ♻️ (editor) Improve webhook creation [[ac464ea](https://github.com/baptisteArno/typebot.io/commit/ac464eabdf65c62049b41736d6e597f2521970b0)]


<a name="2.10.3"></a>
## 2.10.3 (2023-02-14)

### UI/UX Improvements

- 🚸 (bot) Keep bubble content in local state for each bubble [[97e2578](https://github.com/baptisteArno/typebot.io/commit/97e2578bcce56eac8ab79d6e4d4eca4b9fb2bcf2)]
- 🚸 (results) Improve results action buttons [[08e33fb](https://github.com/baptisteArno/typebot.io/commit/08e33fbe702cac9cb057fb346f25b5469beec24b)]
- 🚸 (results) Remove useless scrollbars and make header sticky [[b98aef5](https://github.com/baptisteArno/typebot.io/commit/b98aef53fddd86d9fab98629333b6e29d4fa1924)]
- 🚸 (results) Show deleted block answers if any [[3ab6790](https://github.com/baptisteArno/typebot.io/commit/3ab67902c0b305d33902bbd79c92284701b5f527)]
- 💄 Correct default favicon for viewer [[5e358ca](https://github.com/baptisteArno/typebot.io/commit/5e358caee21e2b6b45d52382c2d4fb4a0d38840d)]

### Fixed

- 🐛 (bot) Still parse variable ID in code if has no value [[17020c8](https://github.com/baptisteArno/typebot.io/commit/17020c8fef6e2371926308228cf97fa30a3e078d)]
- 🐛 (results) Fix export with deleted blocks [[c35ba58](https://github.com/baptisteArno/typebot.io/commit/c35ba58fae94a5cd677ab6cf2e0654697e2c2c4c)]
- 🐛 Fix 404 error page [[eef015e](https://github.com/baptisteArno/typebot.io/commit/eef015e39587ea3c3a830c2c6d9109203a56788e)]
- 🐛 (editor) Fix text bubble regex not compatible with Safari [[2c80e3a](https://github.com/baptisteArno/typebot.io/commit/2c80e3a1c06ca2b3a4e79aa2f2df54405db9a71e)]
- 🐛 Fix X-Frame-Option header [[7baa610](https://github.com/baptisteArno/typebot.io/commit/7baa610b2d47afee60dbe9d8225e0ebb66d72e84)]
- 🐛 (editor) Fix typebot update permissions [[bac97a8](https://github.com/baptisteArno/typebot.io/commit/bac97a8ee4dfb944863ee07959255dff4757ab6a)]
- 🐛 (webhook) Parse test variables in webhook body sample [[8a02c70](https://github.com/baptisteArno/typebot.io/commit/8a02c701da2970346de179881b18402df0cffd5e)]
- 🐛 (results) Fix results still appearing when deleted [[3728bca](https://github.com/baptisteArno/typebot.io/commit/3728bca17386d3f1faeac3c564f041ab3f21c325)]
- 🐛 (workspace) Fix members invitation when having unlimited plan [[0dba994](https://github.com/baptisteArno/typebot.io/commit/0dba994210407e46a1157b14b626b18f57375241)]
- 💚 Fix clean database script [[770b29e](https://github.com/baptisteArno/typebot.io/commit/770b29e7673a07e3812529b7f4028c81c59ea847)]
- 💚 Fix utils export issue [[c175ade](https://github.com/baptisteArno/typebot.io/commit/c175ade4d0521c196d6cca23f827f28f606279ba)]
- 🐛 (editor) Allow variables in bubble text links [[2dbf0fb](https://github.com/baptisteArno/typebot.io/commit/2dbf0fb848ea5d8ea427c0a68ad57ba1e4b099a6)]
- 🐛 Fix custom CSS initialization [[c386bb5](https://github.com/baptisteArno/typebot.io/commit/c386bb5a08b67fff509b7036e0ba6e59b97ba230)]
- 💚 Fix docker build prisma generate script [[c9fda15](https://github.com/baptisteArno/typebot.io/commit/c9fda1518f5cf1ecceadacb40c738383a4c1d657)]

### Content

- 📝 Add a planetscale guide [[46e9271](https://github.com/baptisteArno/typebot.io/commit/46e9271aaa051a4b3e0fd3c52867b1b7d978b0b8)]
- 📝 Remove advanced section in Condition docs [[c879c6f](https://github.com/baptisteArno/typebot.io/commit/c879c6f83a719aae50912b15f935003d9b3a4269)]
- 📝 Fix landing page typo ([#301](https://github.com/baptisteArno/typebot.io/issues/301)) [[c50c2b8](https://github.com/baptisteArno/typebot.io/commit/c50c2b84b6eef085dec77c27a745ea458e70861e)]

### Internal

- 🗃️ Improve result logs query [[1a3596b](https://github.com/baptisteArno/typebot.io/commit/1a3596b15c66baeace496c65881d19383c449c24)]
- 🗃️ (webhook) Improve webhook creation query [[e39cd94](https://github.com/baptisteArno/typebot.io/commit/e39cd94eef32338cebc349094957ba4aea3820b2)]
- 🗃️ (results) Improve result delete queries [[1d4d39c](https://github.com/baptisteArno/typebot.io/commit/1d4d39c649be6591290c379522fc602b765fbb86)]
- 🗃️ Improve get typebot query performance [[c0757f8](https://github.com/baptisteArno/typebot.io/commit/c0757f81872dfcf97d071f7f82f6c2f01accc098)]
- 🗃️ Improve usage queries [[e9a1d16](https://github.com/baptisteArno/typebot.io/commit/e9a1d1683eb7a3a64106fb3745899f0423e12857)]
- 🏗️ Add compatibility with different prisma clients [[caf5432](https://github.com/baptisteArno/typebot.io/commit/caf54321ece0934c2979007aa7182a63a992b601)]

### Miscellaneous

- 📦 Update cuid to cuid2 [[51f7670](https://github.com/baptisteArno/typebot.io/commit/51f76700b2aa72a3e8e0250d431627064310f0aa)]


<a name="2.10.2"></a>
## 2.10.2 (2023-02-07)

### Fixed

- 🐛 (chatwoot) Fix setUser with variables [[f936d4f](https://github.com/baptisteArno/typebot.io/commit/f936d4fae319ff7ed35438b07f74f4aad902421d)]


<a name="2.10.1"></a>
## 2.10.1 (2023-02-06)

### UI/UX Improvements

- ⚡ Improve old engine bubbles display robustness [[ae88d2c](https://github.com/baptisteArno/typebot.io/commit/ae88d2cae1d8fbc5089891ffa3cdef56eb8effff)]

### Fixed

- 🐛 Fix searchable dropdown z-index issues [[2b36ced](https://github.com/baptisteArno/typebot.io/commit/2b36cedb7bce77e932285a83923c3459d3e9539d)]
- 🐛 Fix phone input placeholder color [[4e0df33](https://github.com/baptisteArno/typebot.io/commit/4e0df33551946219a60598e23631a69177393d8c)]
- 🐛 Fix overflow issue for Theme and Settings pages [[17d94a9](https://github.com/baptisteArno/typebot.io/commit/17d94a9f9ff80338604346fe33fb1d5219b19cc6)]

### Internal

- 🔥 Remove useless console logs [[77df555](https://github.com/baptisteArno/typebot.io/commit/77df5556f475757d3ceecbdefe0bce0b755ed1ec)]
- 🗃️ Add updatedAt fields where missing [[0b34321](https://github.com/baptisteArno/typebot.io/commit/0b34321bf7ea36dc8cd15a63107e541b70841813)]
- 🗃️ Fix schema migration diff [[bf60728](https://github.com/baptisteArno/typebot.io/commit/bf607289f43a33d43d7d26ae3962ad8459f098af)]

### Miscellaneous

- 🩹 Clean up typebot before updating [[f42d144](https://github.com/baptisteArno/typebot.io/commit/f42d1445c6f0518e7466401df3988e458a055d1c)]


<a name="2.10.0"></a>
## 2.10.0 (2023-02-02)

### Fixed

- 🐛 Remove deny X-Frame on typebot.io [[2c57eba](https://github.com/baptisteArno/typebot.io/commit/2c57eba994fe318867d8a6b27fc94626653752de)]
- 🐛 Fix workspace member lock banner always on [[1806840](https://github.com/baptisteArno/typebot.io/commit/1806840119476743be7e2c1c4c424c36f5480c13)]
- 🚑 Revert prisma fix [[1dfe4ca](https://github.com/baptisteArno/typebot.io/commit/1dfe4cadf7ab8e01c9f330765459efa66ad12103)]
- 🐛 Fix crash when outgoing edge blockId does not exist [[58ca1c3](https://github.com/baptisteArno/typebot.io/commit/58ca1c3ad69cb4ffc2a8695c074cadf9d80383a0)]

### Content

- 📝 Add google sheets callback URL instruction [[4a9f2b1](https://github.com/baptisteArno/typebot.io/commit/4a9f2b1b02ca4be041a265d977142fc86e57a25d)]

### Internal

- 🗃️ Set new fields column to not null [[a5dc982](https://github.com/baptisteArno/typebot.io/commit/a5dc9821d6cf8dbf839ebcebe0b0f67a1a4c11d0)]
- 🗃️ Remove list types from db schema [[6e0f0e4](https://github.com/baptisteArno/typebot.io/commit/6e0f0e487bac1d5cb04bbd702e76f8fa5401d8ff)]
- 🔥 Remove inline edit in old engine [[58c6efc](https://github.com/baptisteArno/typebot.io/commit/58c6efc5c86d31ed96a9b9bc30a9c0fc6423d892)]

### Miscellaneous

- 🩹 Better fix for ENOENT schema.prisma [[3851b2d](https://github.com/baptisteArno/typebot.io/commit/3851b2d70b58af87beb6e652e0ea32b6a892c3c5)]
- 🩹 Still accept old bot property when importing [[42d4bc3](https://github.com/baptisteArno/typebot.io/commit/42d4bc3882fa767b6c4df2f0d7d327e277997256)]


<a name="2.9.4"></a>
## 2.9.4 (2023-01-28)

### New features

- ✨ Add Wait block [[fa9e4b7](https://github.com/baptisteArno/typebot.io/commit/fa9e4b7b673571949d7d5c721dae9040a1857902)]

### UI/UX Improvements

- ⚡ (editor) Improve textbox incoming variable detection [[8d592a3](https://github.com/baptisteArno/typebot.io/commit/8d592a3cc3e5ef3edd736a53e55f945c097c9d20)]
- ⚡ (engine) Implement skip on engine v2 [[d54822a](https://github.com/baptisteArno/typebot.io/commit/d54822af2b5081616fee790998772c547d45011c)]
- 🚸 (dashboard) Add unpublish menu item in dashboard [[f93bc2f](https://github.com/baptisteArno/typebot.io/commit/f93bc2fcb2cd8df1152f6dce3c9780fda05302ac)]
- 💄 Improve edges alignment when connected to blocks [[068f9bb](https://github.com/baptisteArno/typebot.io/commit/068f9bbd17bd7796308983a9abcd4de0ead3b7a5)]
- 🚸 (engine) Improve engine v2 client loading and timings [[4f78dda](https://github.com/baptisteArno/typebot.io/commit/4f78dda640ee43811fdcdc2f99e2849af8ae2d13)]
- 🚸 Add better page titles and dashboard icons [[ee864d9](https://github.com/baptisteArno/typebot.io/commit/ee864d972923a6f8f0b2e3d891385b8c119e0145)]
- ⚡ Improve new bot engine client side actions [[9aab6dd](https://github.com/baptisteArno/typebot.io/commit/9aab6ddb2cbc50544dc5b57782f322e6c3252348)]
- ⚡ (engine) Improve engine overall robustness [[30baa61](https://github.com/baptisteArno/typebot.io/commit/30baa611e5308f45470552160e92d724c47b5310)]
- 🚸 (share) Hide custom domain dropdown when env isn&#x27;t configured [[393f5f2](https://github.com/baptisteArno/typebot.io/commit/393f5f27ed3042f84fa26faea21e886219e5e901)]

### Fixed

- 🐛 (share) Fix custom domain delete [[cb83935](https://github.com/baptisteArno/typebot.io/commit/cb83935da937dc0e872f33c4b0947bde7694b2a4)]
- 🐛 Fix misc bugs [[a738897](https://github.com/baptisteArno/typebot.io/commit/a738897dbb544102a9ce4ca546c309ece5eecc77)]
- 🐛 (editor) Fix outside click not working in some cases [[0fc82cf](https://github.com/baptisteArno/typebot.io/commit/0fc82cf73be5249e829959d87e3ac43afdd66460)]
- 🐛 (viewer) Should not import google font url if empty [[14e6ee3](https://github.com/baptisteArno/typebot.io/commit/14e6ee373fa141af6d3b2aa39a93b5a7b1f862ec)]
- 🐛 (lp) Fix real time airtable bot [[eb01fd2](https://github.com/baptisteArno/typebot.io/commit/eb01fd254e997e8dd3a8abc40bf05d2b7f6edbdd)]
- 🐛 (engine) Fix button validation when item content includes a comma [[07f2626](https://github.com/baptisteArno/typebot.io/commit/07f26262ef5aecbc8b53b3566a75afe53955ac03)]
- 🐛 (share) Fix custom domain button not showing [[2d51a8a](https://github.com/baptisteArno/typebot.io/commit/2d51a8a359ef74f4e2615633224a3c9ebd3839d8)]

### Content

- 📝 Add affiliate program faq section [[8e0043d](https://github.com/baptisteArno/typebot.io/commit/8e0043d51d7fbf57fe5a662d519536ccf111aabc)]
- 📝 Write a guide about UTM params forwarding [[01c9691](https://github.com/baptisteArno/typebot.io/commit/01c969117517a90c52e8a8770aee6041fb5a721e)]
- 📝 Improve the description of NEXTAUTH_URL_INTERNAL [[3d2d401](https://github.com/baptisteArno/typebot.io/commit/3d2d4017b203169b755894e35ff93c9d4e710a1c)]

### Internal

- ♻️ (auth) Group join workspaces queries in a transaction [[bfd85b4](https://github.com/baptisteArno/typebot.io/commit/bfd85b4fd3002451f7e3b247282fba2114106e81)]
- ♻️ Rename Code block to Script block [[a842f57](https://github.com/baptisteArno/typebot.io/commit/a842f572974123884b67ac4c01d4c6d09abe08a8)]
- ♻️ Add a new unlimited plan [[409e764](https://github.com/baptisteArno/typebot.io/commit/409e7643ad59732d78704cb39d7d921e09904671)]
- ♻️ (lp) Remove old bot-engine from landing page [[79622c6](https://github.com/baptisteArno/typebot.io/commit/79622c6884a4647215b24812ed65f7229e06f325)]
- ♻️ Migrate default background to white [[ff62b92](https://github.com/baptisteArno/typebot.io/commit/ff62b922a04a21119f21fcb81f675dfb4a45536f)]


<a name="2.9.3"></a>
## 2.9.3 (2023-01-20)

### UI/UX Improvements

- 🚸 (auth) Disable email sign in button when email was sent [[eff83d6](https://github.com/baptisteArno/typebot.io/commit/eff83d63279176f6abba3a362898fa7282018c52)]
- 🚸 (publish) Improve invalid public ID feedback [[0febaf9](https://github.com/baptisteArno/typebot.io/commit/0febaf9760521bffe50f5b32105e7847435fe9ff)]
- 🚸 (fileUpload) Add clear and skip button labels customization [[f697a5e](https://github.com/baptisteArno/typebot.io/commit/f697a5e99c37d331e391597fdb58a99dd51c728f)]
- 🚸 (account) Improve account form and fix cyclic dependencies [[49058da](https://github.com/baptisteArno/typebot.io/commit/49058da206b5ae10ca91ccf991cacf4282ca6b52)]
- ⚡ (editor) Add Ctrl + z shortcut to undo changes in editor ([#255](https://github.com/baptisteArno/typebot.io/issues/255)) [[c711f36](https://github.com/baptisteArno/typebot.io/commit/c711f3660f906f5694dfd67e26a860202729b03a)]
- 🚸 (dashboard) Soften imported bot model check [[67ee197](https://github.com/baptisteArno/typebot.io/commit/67ee197d9b9e4bc74766908bafcd53c92f55a348)]
- ⚡ (chat) Improve chat API compatibility with preview mode [[7311988](https://github.com/baptisteArno/typebot.io/commit/7311988901db728a4cd162fc2cfca03971e28135)]

### Fixed

- 🐛 (collaboration) Fix a database rule preventing collaborators to edit a bot [[fe2952d](https://github.com/baptisteArno/typebot.io/commit/fe2952d407874e2104a7e17661b69c89f40ccc45)]
- 🐛 (analytics) Add better completion rate parsing ([#258](https://github.com/baptisteArno/typebot.io/issues/258)) [[cf5520b](https://github.com/baptisteArno/typebot.io/commit/cf5520b0d85f49f45e15583f06cdbfff1478afab)]
- 🐛 (editor) Show variable highlight only when strictly equal [[dbe5c3c](https://github.com/baptisteArno/typebot.io/commit/dbe5c3cdb1f51826cfe7dae14456e720e0d7efee)]

### Content

- 📝 Add extract first name example [[4435fb0](https://github.com/baptisteArno/typebot.io/commit/4435fb0d7ef9ac12f73da3ad5d9464f0b7370021)]
- 📝 Self-hosting manual docs ([#260](https://github.com/baptisteArno/typebot.io/issues/260)) [[930fef2](https://github.com/baptisteArno/typebot.io/commit/930fef2c34f9ea986a15f1a526d464aa547dc18a)]

### Internal

- 🔒 Add X-Frame-Options header in builder and lp [[aa32fe7](https://github.com/baptisteArno/typebot.io/commit/aa32fe782f5be63ab0cbc02616bd6e88775ff8f3)]


<a name="2.9.2"></a>
## 2.9.2 (2023-01-14)

### New features

- ✨ Add Bubble and Popup in embed lib v2 [[21f1c7a](https://github.com/baptisteArno/typebot.io/commit/21f1c7a17e8b6576cabc992165df21fb3f57ede6)]

### UI/UX Improvements

- 🚸 (dashboard) Improve invalid typebot import feedback [[491e60a](https://github.com/baptisteArno/typebot.io/commit/491e60a815dddb4400259b8183e7a8a980cde6ec)]
- ⚡ Make the default workspace plan configurable [[b142dc1](https://github.com/baptisteArno/typebot.io/commit/b142dc18eb6f75ace3beeba00f1f2f40d7a0ba04)]

### Fixed

- 🐛 Fix date input label computation [[13d6679](https://github.com/baptisteArno/typebot.io/commit/13d66793082313d8a39b18b124fcbeaaa68367e2)]
- 🐛 (editor) Don&#x27;t show variable collection if not recognized [[ecc7e18](https://github.com/baptisteArno/typebot.io/commit/ecc7e18226163bb50eb62aeb9e749e203b6298ee)]
- 💚 Fix clean database script [[5462a1b](https://github.com/baptisteArno/typebot.io/commit/5462a1be6a9d451ce86e2f71761ca8bfea448209)]
- 🐛 (dashboard) Fix typebot name overflow [[5507b8e](https://github.com/baptisteArno/typebot.io/commit/5507b8ef67f14ea21ed69a7ccdfcd5ef4825b66f)]
- 🐛 (editor) Improve variables dropdown auto focus [[b65ffe8](https://github.com/baptisteArno/typebot.io/commit/b65ffe8c53b654885a21214f824e9e7c0d819a86)]

### Content

- 📝 Update FAQ [[f1fa535](https://github.com/baptisteArno/typebot.io/commit/f1fa5358e98e9f31ad772b65883f33bf25354502)]

### Internal

- 🔧 Add app origin to chat API cors [[f8351e2](https://github.com/baptisteArno/typebot.io/commit/f8351e2c85487931a512c3962af810fd9a25e811)]
- ♻️ Add id token config param to custom OAuth [[4bf93b4](https://github.com/baptisteArno/typebot.io/commit/4bf93b48724203f5f173b1a5bf4e0e231ffeba8a)]

### Miscellaneous

- 🧑‍💻 (auth) Improve Custom OAuth set up [[3bc0240](https://github.com/baptisteArno/typebot.io/commit/3bc02406f382852d2a5f6f58fbef1d60e35432cc)]


<a name="2.9.1"></a>
## 2.9.1 (2023-01-06)

### UI/UX Improvements

- 💄 Fix code editor transparent selection [[3f7e1ce](https://github.com/baptisteArno/typebot.io/commit/3f7e1ce1252134e664a11828b37c26707f68172f)]
- 🚸 (js) Improve setHiddenVariables command [[b105bf8](https://github.com/baptisteArno/typebot.io/commit/b105bf8b8ebde5998fd2bf0bb6c0f66dd7000c1f)]

### Fixed

- 🐛 (editor) Fix popover zIndex [[2d20f1c](https://github.com/baptisteArno/typebot.io/commit/2d20f1c41cda55aeebcb1580d542cbab3f95ceea)]
- 🐛 (share) Fix clipboard for updated typebot ID [[fadf34a](https://github.com/baptisteArno/typebot.io/commit/fadf34ad61505b282412300457f1a113430c3d13)]
- 🐛 (auth) Add custom oauth client id and secret params [[6cc3cbf](https://github.com/baptisteArno/typebot.io/commit/6cc3cbf182950fcfbaea00d4bb1345378244316c)]
- 🐛 Fix new typebot creation host bubble parsing [[119f6dc](https://github.com/baptisteArno/typebot.io/commit/119f6dc348be056eb842b1b969f43151168de611)]
- 🐛 (sendEmail) Check if attachment is URL [[7174ef0](https://github.com/baptisteArno/typebot.io/commit/7174ef0f81ceab4eb6a7d955d7d7c5d9e3ce2baa)]
- 🐛 (editor) Fix variables dropdown behind modal [[b455078](https://github.com/baptisteArno/typebot.io/commit/b455078631d9348a4b88f065b710afc7a1b385b4)]
- 🐛 (chat) Make sure a bot session can be restarted [[de167a8](https://github.com/baptisteArno/typebot.io/commit/de167a8daff49bff581ee76fb738cac73647164d)]
- 🐛 (editor) Fix variable dropdown overflow [[c1a32ce](https://github.com/baptisteArno/typebot.io/commit/c1a32ce26bb0088e8af02eea544158e1bdb446da)]
- 🐛 (sheets) Make sure sheet IDs are string [[e1af6af](https://github.com/baptisteArno/typebot.io/commit/e1af6af9c8024493e07c081fe9b177aea2a75158)]
- 🐛 (sheets) Convert to base options before changing action [[f4615d8](https://github.com/baptisteArno/typebot.io/commit/f4615d83cde86395d238269930ba8962ec46c08e)]

### Content

- 📝 Add custom body with variable example [[40d230a](https://github.com/baptisteArno/typebot.io/commit/40d230a73a489dda5f2a344669fe97c465af7b5d)]

### Internal

- 🔧 Explicitly add Sentry release sha [[963f887](https://github.com/baptisteArno/typebot.io/commit/963f887b34559ff07c4b098cffb3223c3e4acbfb)]
- ♻️ (js) Implement Payment input in bot v2 [[61eff4c](https://github.com/baptisteArno/typebot.io/commit/61eff4c36db054a131e04885aceb4d732bbd7708)]


<a name="2.9.0"></a>
## 2.9.0 (2023-01-02)

### New features

- ✨ (auth) Add custom OAuth provider support [[b9d3893](https://github.com/baptisteArno/typebot.io/commit/b9d38935a69e555921c9a1388bdbf2336d82ca44)]
- ✨ (typebot-js) Add setHiddenVariables command [[99850dd](https://github.com/baptisteArno/typebot.io/commit/99850ddbeb2dbb57396ecd01ae95a715a4ce4c45)]

### UI/UX Improvements

- 🚸 Only show onboarding modal on cloud manage version [[080353b](https://github.com/baptisteArno/typebot.io/commit/080353bffb42b30799d7e641e828649ddd6e7d61)]

### Fixed

- 🐛 (bot) Update result variables when overwritten by input [[f49a301](https://github.com/baptisteArno/typebot.io/commit/f49a3013d418d06ebda7d6901cc91a06e16efc55)]

### Content

- 📝 Add Make.com instructions [[b9ed50b](https://github.com/baptisteArno/typebot.io/commit/b9ed50b016f340ec50beb573c7f7ce8561937b9d)]
- 📝 Improve License section in README [[60ed0b2](https://github.com/baptisteArno/typebot.io/commit/60ed0b2d4a92a5fc1d61ef221b58f8eb70f66820)]

### Miscellaneous

- 🧑‍💻 Parse line breaks for plainText attributes [[bea1a6a](https://github.com/baptisteArno/typebot.io/commit/bea1a6a3f802d69d57321dc7d42345384f5f7b3e)]


<a name="2.8.12"></a>
## 2.8.12 (2022-12-28)

### Fixed

- 🚑 (condition) Fix crash when adding condition block [[853ea79](https://github.com/baptisteArno/typebot.io/commit/853ea79f6bba897a1e9c216265525977440969b9)]

### Internal

- 🔧 (scripts) Add typebot fix script [[ad72557](https://github.com/baptisteArno/typebot.io/commit/ad725573108daa82d4558926d2623f2ab901b598)]


<a name="2.8.11"></a>
## 2.8.11 (2022-12-24)

### New features

- ✨ (rating) Add one click submit option [[449080b](https://github.com/baptisteArno/typebot.io/commit/449080b0add0ef570ffd27de94f39b939f6a5e83)]
- ✨ Add Google Tag Manager ([#185](https://github.com/baptisteArno/typebot.io/issues/185)) [[a898a7a](https://github.com/baptisteArno/typebot.io/commit/a898a7aa4128ba1baff1d645bbcef3ec867a3a38)]
- ✨ Add dark mode ([#191](https://github.com/baptisteArno/typebot.io/issues/191)) [[3394fa5](https://github.com/baptisteArno/typebot.io/commit/3394fa5e0a7ee9448fc31e3c1dd1700f64306ab7)]

### UI/UX Improvements

- 💄 (dashboard) Fix folder color for dark mode [[752e78c](https://github.com/baptisteArno/typebot.io/commit/752e78cea207df91aa45a006f64d9129c56b2575)]
- 🚸 (buttons) Show collected variable in buttons block preview [[f224ab9](https://github.com/baptisteArno/typebot.io/commit/f224ab9b16a7ee91f7281314498f2be5815df6b2)]
- 💄 Fix router progress bar color for dark mode [[e55823e](https://github.com/baptisteArno/typebot.io/commit/e55823e0112291a32886908fd4c63365275106e6)]
- ⚡ Improve app appearance radio group image loading [[25acd04](https://github.com/baptisteArno/typebot.io/commit/25acd04abc332635dfb9dcf996ff732a21df70b9)]

### Fixed

- 🐛 (chat) Make sure objects are deeply parsed with variables value [[431ad7c](https://github.com/baptisteArno/typebot.io/commit/431ad7c78c0e08a55e06688d20470ccfa757aa7f)]
- 🐛 (settings) Fix custom head code with noscript injection [[2cdc2b4](https://github.com/baptisteArno/typebot.io/commit/2cdc2b43f50cc0bc2a3255ae2b34dbd9890fcacc)]
- 🐛 (webhook) Prioritize variables parsing over answers [[64cd31c](https://github.com/baptisteArno/typebot.io/commit/64cd31cf13aec5b0df9bfe57d45dcc25952336e0)]
- 🐛 (editor) Fix condition item drag and drop [[4109e63](https://github.com/baptisteArno/typebot.io/commit/4109e63b7b39ee63c92fe4a7310dca9fa2354fd9)]
- 🐛 (webhook) Fix parent linked typebot data parsing in webhook [[c3985b0](https://github.com/baptisteArno/typebot.io/commit/c3985b0d50069f3983f71ee0132c86062fab0dd2)]
- 🐛 (webhook) Fix form encoded request parsing [[9149af7](https://github.com/baptisteArno/typebot.io/commit/9149af7e6bcb4aebc77efb3c9e7e2317ff15ffac)]
- 💚 Fix sentry not sending events [[054cbb3](https://github.com/baptisteArno/typebot.io/commit/054cbb35854b675702610306b16266c9e2f9a78e)]

### Content

- 📝 Explain how code works in Set variable block [[2934af8](https://github.com/baptisteArno/typebot.io/commit/2934af883585562512dd98a781a0cfb6adfc25e3)]
- 📝 Add &quot;How to&quot; section in Buttons block doc [[11ff7ea](https://github.com/baptisteArno/typebot.io/commit/11ff7eab56c3b54f0271a33ba313e2b90d879fa7)]
- 📝 (lp) Add new testimonial [[2bec6bd](https://github.com/baptisteArno/typebot.io/commit/2bec6bda83a977468bffd0aace1e22aa75b1c2ee)]

### Miscellaneous

- ⚗️ Implement bot v2 MVP ([#194](https://github.com/baptisteArno/typebot.io/issues/194)) [[1a3869a](https://github.com/baptisteArno/typebot.io/commit/1a3869ae6d9fa92fc71ef9d981bfffb8e4ee4ecc)]
- 🩹 Fix dark mode bg remaining issues [[d1b5b6e](https://github.com/baptisteArno/typebot.io/commit/d1b5b6ebe66efce61e207e80f60d198cb47fbfd9)]


<a name="2.8.10"></a>
## 2.8.10 (2022-12-18)

### Fixed

- 🚑 (results) Fix results page crash [[6e5786c](https://github.com/baptisteArno/typebot.io/commit/6e5786cfc3ef9bd5e5a5e272c1ca636b6ba6b4f8)]


<a name="2.8.9"></a>
## 2.8.9 (2022-12-18)

### New features

- ✨ (googleSheets) Advanced get filtering [[dcec1f0](https://github.com/baptisteArno/typebot.io/commit/dcec1f0a5c1fb81a3971952cd6af1117925c7b2d)]

### UI/UX Improvements

- 🚸 (editor) Automatically move graph on first group on mount [[6c55510](https://github.com/baptisteArno/typebot.io/commit/6c55510d80bce5a9383b84d35c018c2c10bb9352)]
- 🚸 (workspace) Keep workspaceId in memory even when logging out [[578e41c](https://github.com/baptisteArno/typebot.io/commit/578e41c09f53620052eb38a859667735a2c26709)]
- ⚡ (dashboard) Improve folders and typebots get queries [[3ab047a](https://github.com/baptisteArno/typebot.io/commit/3ab047a48753783d173fa384543ffbbbbc84aa2a)]

### Fixed

- 💚 Fix sentry not receiving events [[68de7b7](https://github.com/baptisteArno/typebot.io/commit/68de7b720fa327ffdac39e45814fe41f6939f013)]
- 🐛 (typebotLink) Populate variable value when linked typebot is injected [[92dc797](https://github.com/baptisteArno/typebot.io/commit/92dc797b6c61818b584034348dcc0575ba0f19fc)]
- 🐛 (workspace) Read custom limits even without CUSTOM plan [[fd6b94b](https://github.com/baptisteArno/typebot.io/commit/fd6b94bb1b61f2ce416e2f004afb52dde36dbdb4)]
- 🐛 (typebotLink) Make sure to update all linked bot variable values [[656d1e3](https://github.com/baptisteArno/typebot.io/commit/656d1e3cade64c7aaca448c9801dff6c400fd174)]
- 🐛 (typebotLink) Fix fetching when typebot ID is current bot ID [[54dee6e](https://github.com/baptisteArno/typebot.io/commit/54dee6e3628b06a9525d57ef08f98602662a4de9)]
- 🚑 Disable usage check on viewer [[855a285](https://github.com/baptisteArno/typebot.io/commit/855a2856c81614966c8227f52d95475cc5f334b0)]

### Content

- 📝 Add embed PDF from Google Drive instructions [[8b631d7](https://github.com/baptisteArno/typebot.io/commit/8b631d77eb492e597f957024b9857c4999d028fe)]
- 📝 Improve prefilled variables clarity [[141ffd3](https://github.com/baptisteArno/typebot.io/commit/141ffd35f7e5a4687f7fb4450e50e286a3a2d746)]

### Internal

- 🔧 Add cross env compatibility to scripts ([#184](https://github.com/baptisteArno/typebot.io/issues/184)) [[2cc61b1](https://github.com/baptisteArno/typebot.io/commit/2cc61b1bf1f36e533d87b10151db8f4045434618)]
- 🗃️ Write faster prisma queries [[7eac2c7](https://github.com/baptisteArno/typebot.io/commit/7eac2c71100dbe9e74afdb204eb62bcd229457d2)]
- 🗃️ Revert usage query back optimization [[fe8a531](https://github.com/baptisteArno/typebot.io/commit/fe8a531715487e4b2ec9f55e68c393377a1bd98c)]
- 🗃️ Optimize usage queries [[d6f90af](https://github.com/baptisteArno/typebot.io/commit/d6f90af126929dfc36af4284384dc75d99df0d11)]


<a name="2.8.8"></a>
## 2.8.8 (2022-12-05)

### New features

- ✨ Add back Make.com and implement help doc buttons [[d75eceb](https://github.com/baptisteArno/typebot.io/commit/d75eceb23f1fe737a8f2104b2bc6d318d3c6a471)]
- ✨ Add webhook blocks API public endpoints [[c799717](https://github.com/baptisteArno/typebot.io/commit/c7997179053f91d383c3c31d884f30f2196d1c69)]

### UI/UX Improvements

- 💄 (lp) Add 2 other testimonials [[03b09ad](https://github.com/baptisteArno/typebot.io/commit/03b09ad6eb6a2465189f0e603e15925740a7239b)]
- 💄 (lp) Update wall of love [[bdf7c0d](https://github.com/baptisteArno/typebot.io/commit/bdf7c0d5c02710be230f3c14b85dddbffb0e4671)]

### Fixed

- 🐛 (textBubble) Fix link parsing in text editor [[b4dc640](https://github.com/baptisteArno/typebot.io/commit/b4dc64028cb2affc3a8a487cf6c04285e64329b1)]
- 🐛 Fix api doc CORS [[94a57ae](https://github.com/baptisteArno/typebot.io/commit/94a57aea216c51e46e0566851a45d185b516d0f7)]
- 🚑 Attempt to fix prisma not defined trpc [[3c8820b](https://github.com/baptisteArno/typebot.io/commit/3c8820b2129ba1f5ec5ba89334c4b66a0568fd38)]
- 🐛 (billing) Fix currency possible mismatch on sub update [[f9ffdbc](https://github.com/baptisteArno/typebot.io/commit/f9ffdbc4c52b4d6e0027eee83209cf2c5794157a)]
- 🐛 (results) Fix export accessor parsing [[43a85b5](https://github.com/baptisteArno/typebot.io/commit/43a85b5529081c4dc90aa8d71721b21c266de7de)]
- 🐛 (viewer) Save new variables even if empty list [[49ba434](https://github.com/baptisteArno/typebot.io/commit/49ba43435012b73f1e5ed5318739e63b772cbc69)]

### Content

- 📝 Update minio setup instructions [[4b2f42b](https://github.com/baptisteArno/typebot.io/commit/4b2f42b40d638d22603103560010c86306bb8bc7)]
- 📝 Improve Chatwoot block instructions [[ca8240b](https://github.com/baptisteArno/typebot.io/commit/ca8240ba291004f1cfe59f43a00ab64bb01287f6)]
- 📝 Improve Google config instructions [[41149b0](https://github.com/baptisteArno/typebot.io/commit/41149b07c6dba08a224042d0fe05d3e9bacd2f0a)]
- 📝 Improve send email doc [[3e80af6](https://github.com/baptisteArno/typebot.io/commit/3e80af638b16d19e8522fc0887b26d1692c742bd)]

### Internal

- 🗃️ Update non-string variable values in Database [[461d2e2](https://github.com/baptisteArno/typebot.io/commit/461d2e2746de2888e76d1137b8d25136c7150cae)]
- 🔧 Enable usage limits on viewer [[cfcecaa](https://github.com/baptisteArno/typebot.io/commit/cfcecaaa1713780d1d95712315d80dbfcf13efb5)]
- 🔥 Remove make.com integration block temporarily [[013c225](https://github.com/baptisteArno/typebot.io/commit/013c2252969478637dc07b544e78c8365147a6ca)]

### Miscellaneous

- ⚗️ Implement chat API [[bf0d0c2](https://github.com/baptisteArno/typebot.io/commit/bf0d0c2475b0a394ca08fa9c629ac5ecf3ad74de)]


<a name="2.8.7"></a>
## 2.8.7 (2022-11-27)

### Fixed

- ✏️ Remove &quot;Notion&quot; keywords where it&#x27;s supposed to be &quot;Typebot&quot; [[ce20f96](https://github.com/baptisteArno/typebot.io/commit/ce20f960f2093660104d0cc93d0405fc83bf1250)]
- 🐛 (graph) Make the text bubble selectable without moving group [[0593d2e](https://github.com/baptisteArno/typebot.io/commit/0593d2ead8df6ba5749887f26cccf4ce942411c7)]
- 🐛 (results) Fix results display when variable has undefined value [[d80cc1b](https://github.com/baptisteArno/typebot.io/commit/d80cc1b248275f28928c87d076dba3fcfdc11e89)]
- 🐛 (dashboard) Fix a bug preventing user to see settings content [[ec0e4be](https://github.com/baptisteArno/typebot.io/commit/ec0e4bee77422750dd5b2bbbcae4876e4664e77d)]
- 💚 (docs) Fix api schema generation in CI [[635e688](https://github.com/baptisteArno/typebot.io/commit/635e6887f37616ae22d681095b1f41a3d095afe1)]
- 🚑 (results) Fix results display when variable has null value [[e6dceca](https://github.com/baptisteArno/typebot.io/commit/e6dceca9f3124774f03a69cd90477f07a8796144)]
- 🐛 (workspace) Filter out guests from members list count [[04af489](https://github.com/baptisteArno/typebot.io/commit/04af489119c9577e900efb28853d53ea65bec76e)]
- 🐛 (bot) Fix input prefill when linked to another typebot [[5619eef](https://github.com/baptisteArno/typebot.io/commit/5619eef459f4c67b3667b4f9ec6bc2e277febbf7)]

### Content

- 📝 Introduce auto generate API doc [[11695ef](https://github.com/baptisteArno/typebot.io/commit/11695efb57011d5899202f474e688a77dd5a9f32)]

### Internal

- 🗃️ Add answer - groupId index [[9d69470](https://github.com/baptisteArno/typebot.io/commit/9d6947063069c80ef755724b8a89460acc4bf91a)]

### Miscellaneous

- ⚰️ (results) Remove results server parser [[9548733](https://github.com/baptisteArno/typebot.io/commit/9548733543a79575148aa62669a76b1b80cfacca)]
- 🛂 Add backup and restore database scripts [[3645607](https://github.com/baptisteArno/typebot.io/commit/3645607ed423236433a1690c31d770e9214c60b4)]


<a name="2.8.6"></a>
## 2.8.6 (2022-11-21)

### New features

- ✨ Add audio bubble block [[7db0e01](https://github.com/baptisteArno/typebot.io/commit/7db0e01acae0731d3537e702438289c56634a60c)]
- ✨ (settings) Add a &quot;disable responses saving&quot; option [[473d315](https://github.com/baptisteArno/typebot.io/commit/473d315e0fc3fb7b7a24408480d67e1400a269f1)]

### UI/UX Improvements

- 🚸 (typebotLink) Add icon in typebots dropdown [[0c3dcc5](https://github.com/baptisteArno/typebot.io/commit/0c3dcc522e95a313701431617c8eab8a4c381f8f)]
- 🚸 (bot) Avoid waiting for blocks with no returned data [[2bd7cee](https://github.com/baptisteArno/typebot.io/commit/2bd7cee58e90824d5058119288cf1e466c95f800)]
- 🚸 (condition) Enable multiple condition items in one block [[6725c17](https://github.com/baptisteArno/typebot.io/commit/6725c17a02f0df499b1dee3b1c3e909def649426)]

### Fixed

- 🐛 (results) Fix export results when more than 200 [[8c15fd1](https://github.com/baptisteArno/typebot.io/commit/8c15fd17a1405f9ef8b16d171536b0a9cb15053c)]
- 🐛 Fix new image upload refresh when URL is the same [[fbd3304](https://github.com/baptisteArno/typebot.io/commit/fbd33046a1c16aabe7538315837825ebd892140e)]
- 🐛 (editor) Fix empty typebot name not editable [[2489318](https://github.com/baptisteArno/typebot.io/commit/2489318fa59e70335964f7d96dba029797fb4a4b)]
- 🐛 (audioBubble) Remove .ogg upload option because of Safari incompatibility [[e09adf5](https://github.com/baptisteArno/typebot.io/commit/e09adf5c643cd23de84ab0e676b27d5f8b6650f9)]
- 🐛 (editor) Make sure typebot name can be editable if empty [[c7fde1d](https://github.com/baptisteArno/typebot.io/commit/c7fde1d0bc5ff124265f74e3ceb5845561e49726)]
- 🚑 (lp) Temporarily disable plausible [[d2f617f](https://github.com/baptisteArno/typebot.io/commit/d2f617ff1e831fa4b03c7a15ef45a9b7a44134fc)]
- 🐛 (editor) Fix undo / redo not working properly on button nodes [[c4a4aa3](https://github.com/baptisteArno/typebot.io/commit/c4a4aa3e8313e6d7fa6b961679c7b27bbdeb9dc5)]
- 🚑 (bot) Fix custom email from field without name [[4e6b8ed](https://github.com/baptisteArno/typebot.io/commit/4e6b8ed521b1274a3d9f4a2556a3a9f8fd4211e1)]

### Content

- 📝 Add Chatwoot integration doc [[96eb77d](https://github.com/baptisteArno/typebot.io/commit/96eb77d94bfb960b73a3e44119eb8deb8a48181a)]

### Internal

- 🔧 Update db turbo scripts [[bdf4e83](https://github.com/baptisteArno/typebot.io/commit/bdf4e8361720175d1c8f1cd2fc10eadf6908f025)]
- ♻️ Add shared eslint config [[451ffbc](https://github.com/baptisteArno/typebot.io/commit/451ffbcacfe4a0417a5642a40eed533565513cd9)]
- ♻️ (results) Introduce tRPC and use it for the results [[d58f9bd](https://github.com/baptisteArno/typebot.io/commit/d58f9bd3a19f4c963c46ec0673ee45854a9a9118)]
- 🔧 Add Tanzania phone option [[c9cc82c](https://github.com/baptisteArno/typebot.io/commit/c9cc82cc0821390b85a0bcc23dc6fd0a3a6fbee7)]
- ♻️ (editor) Migrate from react-draggable to @use-gesture [[7632c54](https://github.com/baptisteArno/typebot.io/commit/7632c5426c026eb1fa15f5dab20e68b4f0735fa5)]

### Miscellaneous

- ⚰️ (docs) Remove old link [[feaf49f](https://github.com/baptisteArno/typebot.io/commit/feaf49f137d9c7cf666e78aca8eff8f58621a35b)]
- 📦 (wordpress) Update package version [[78fd974](https://github.com/baptisteArno/typebot.io/commit/78fd974ebe9e681555dfc85faa64c5d04c47a5b2)]
- 🛂 Add setCustomPlan script [[6fdbf98](https://github.com/baptisteArno/typebot.io/commit/6fdbf98eedb0c15138383ae258ba57c7dd4b08a5)]
- 🧑‍💻 (typebot-js) Implement easier commands: open / close / toggle [[087d24e](https://github.com/baptisteArno/typebot.io/commit/087d24e58735091a2fa758821da7423b54dc99cd)]


<a name="2.8.5"></a>
## 2.8.5 (2022-11-15)

### New features

- ✨ Add Chatwoot livechat integration [[ea84039](https://github.com/baptisteArno/typebot.io/commit/ea840390248cfa966e550c25d9af806bd4397295)]
- ✨ (logic) Add execute in parent window context for code block [[b31b603](https://github.com/baptisteArno/typebot.io/commit/b31b603cc786d5b7b5205db838332f671ea6c324)]

### UI/UX Improvements

- 🚸 (sendEmail) Make custom sender name optional [[3686465](https://github.com/baptisteArno/typebot.io/commit/3686465a85d21bf6342ab8395a5037063e379cac)]
- 🚸 (chatwoot) Make sure to close the chat bubble before opening Chatwoot [[d01549f](https://github.com/baptisteArno/typebot.io/commit/d01549fee6f0a9898a909496acaede91e5d0e17c)]
- 🚸 (signin) Better disabled signups behavior [[570a780](https://github.com/baptisteArno/typebot.io/commit/570a780db1dd204c7d473f8f6c87f6ea8d789dcd)]

### Fixed

- 🚑 (typebot-js) Fix 404 unpkg entrypoint [[92147c3](https://github.com/baptisteArno/typebot.io/commit/92147c315f8d0ba92b42fab8579c0425160afc80)]
- 🐛 (typebot-js) Fix default export from js lib [[8ab67b7](https://github.com/baptisteArno/typebot.io/commit/8ab67b7580d47731995ba7e5ddba6d2ad7cc25b6)]
- 🐛 (editor) Fix undo / redo not moving or renaming groups [[de0158b](https://github.com/baptisteArno/typebot.io/commit/de0158be24b6e6c160b9101ee69841128ca82608)]
- 🐛 (editor) Fix bug preventing user to manually zoom in / out [[1f44e8f](https://github.com/baptisteArno/typebot.io/commit/1f44e8f31fe54dc1f68dcbbc90fbc06501d6a683)]
- 🐛 (results) Fix bug preventing user from seeing linked typebots results [[6dd7bd9](https://github.com/baptisteArno/typebot.io/commit/6dd7bd95620df1d34929c70085db668bb250a243)]
- 🐛 (share) Restrict public ID to non-existant only [[63845ef](https://github.com/baptisteArno/typebot.io/commit/63845effaf6134898cb7f2bf353355c24f46a6cc)]
- 🐛 (workspace) Correctly display Guest tag in members list [[4d38726](https://github.com/baptisteArno/typebot.io/commit/4d38726eae17e90f542e7a7db29124ca1956df1c)]
- 🐛 (settings) Allow meta tags in head element [[ad9be92](https://github.com/baptisteArno/typebot.io/commit/ad9be922555ce6eb0a32470811e27b6db25d55b6)]
- ✏️ (lp) Fix incorrect additional limits price [[c62e20f](https://github.com/baptisteArno/typebot.io/commit/c62e20f81add8e7ae9f12e58b8c15e18480799da)]
- 💚 Fix build docker image workflow [[8a8f3ec](https://github.com/baptisteArno/typebot.io/commit/8a8f3ec69a69dc7e3d6aaf6fe5b87b3c64febd0b)]
- 💚 Fix build docker image workflow [[d5909c1](https://github.com/baptisteArno/typebot.io/commit/d5909c15bfa08f0bb6fdcc413801305400796fc3)]

### Internal

- ♻️ (bot) Change to features-centric folder structure [[9720944](https://github.com/baptisteArno/typebot.io/commit/972094425ae72f8b962617ec54bccb89a396efb8)]
- ♻️ (models) Change to features-centric folder structure [[a5c8a8a](https://github.com/baptisteArno/typebot.io/commit/a5c8a8a95cf108c8ad4d068f4a51675b888f7c89)]
- ♻️ (viewer) Change to features-centric folder structure [[a9d0479](https://github.com/baptisteArno/typebot.io/commit/a9d04798bcd0d5d9c2d15ed573e9e1b60ed066c8)]
- ♻️ (builder) Change to features-centric folder structure [[643571f](https://github.com/baptisteArno/typebot.io/commit/643571fe7d2a39f398269636bb57c7e8ae3f7a4e)]
- ♻️ Improve file upload management [[d102fe1](https://github.com/baptisteArno/typebot.io/commit/d102fe118c3fd0dad96e692932d9792bdb4d514f)]

### Miscellaneous

- 🧑‍💻 (typebot-js) Add closeChatBubble event data [[54a1dc0](https://github.com/baptisteArno/typebot.io/commit/54a1dc04313d7fbc46795cf65e123a588245cd66)]


<a name="2.8.3"></a>
## 2.8.3 (2022-11-02)

### New features

- ✨ (billing) Implement custom plan [[385853c](https://github.com/baptisteArno/typebot.io/commit/385853ca3c80d04635be91b84db8be54c85bf437)]
- ✨ (lp) Add custom chats and storage in pricing cards [[57c814c](https://github.com/baptisteArno/typebot.io/commit/57c814ceca777379b7a4b2a3657fac944435e9e2)]
- ✨ (template) Add FAQ bot template [[b87ba40](https://github.com/baptisteArno/typebot.io/commit/b87ba4023dea7b47c835fe11a9d36a653d5469b0)]

### UI/UX Improvements

- 🚸 (googleSheets) Set value to null if not found from sheet [[4828547](https://github.com/baptisteArno/typebot.io/commit/48285479cc23377ba54bd61ad9a77f0e077c8592)]
- 🚸 (textBubble) Allow mailto and tel links [[baa63a7](https://github.com/baptisteArno/typebot.io/commit/baa63a781066879c0e01cfe85fcf584beb40c018)]
- 🚸 (share) Sanitize URL ID [[020a37c](https://github.com/baptisteArno/typebot.io/commit/020a37c1f32a1d0b44246c9364df471fe8ed51ce)]
- ⚡ (bot) Improve variables parsing and predictability [[3dc3ab2](https://github.com/baptisteArno/typebot.io/commit/3dc3ab201db001eff8319cb8978c1073b79f1198)]
- 🚸 (bot) disable auto focus on mobile [[40d2db5](https://github.com/baptisteArno/typebot.io/commit/40d2db59dc5168c0dd55eb9f790f308cdf63e333)]

### Fixed

- 🐛 (billing) Upgrade again after cancelling [[d132cb1](https://github.com/baptisteArno/typebot.io/commit/d132cb118afee2bcaaf43f31e0fe0b155aff8e80)]
- 🐛 (settings) Fix remember session switch [[36a2fe3](https://github.com/baptisteArno/typebot.io/commit/36a2fe3a70a7373fd08d72ba362bc5249b1078a8)]
- 🚑 (bot) Fix set variable number computation [[7b0bd08](https://github.com/baptisteArno/typebot.io/commit/7b0bd08dc81ac61d6788630a0b18097d0183147e)]
- 🐛 (analytics) Fix multi usage query timeout [[9cb7f8c](https://github.com/baptisteArno/typebot.io/commit/9cb7f8cd96338a8736686cfd1e73a72dcb401164)]
- 💚 Fix auto release actions [[f437ad6](https://github.com/baptisteArno/typebot.io/commit/f437ad6473562025ec2134805709390e000a0f5a)]
- 🐛 (editor) inconsistency in route change auto save [[b46d352](https://github.com/baptisteArno/typebot.io/commit/b46d35214d68fc60719128d5ea50b26d0a1b1e4d)]
- 🐛 (stripe) add back subscription delete webhook handler [[d1cc918](https://github.com/baptisteArno/typebot.io/commit/d1cc9180c893db8d230af9acf52f8a3beaed6e54)]

### Content

- 📝 Add instruction for AWS S3 endpoint [[d6dffa9](https://github.com/baptisteArno/typebot.io/commit/d6dffa924eb0368c26fb3139856338197aa75281)]

### Internal

- 🗃️ Add typebotId index on Result table [[f8e770c](https://github.com/baptisteArno/typebot.io/commit/f8e770c8757b93e751ddb117f7d303600ec0b517)]
- 🏗️ Use tsup for bot and typebot-js packages [[e8baaca](https://github.com/baptisteArno/typebot.io/commit/e8baaca2a2a44a80a40518e08f0af36c6528ce2a)]
- 🏗️ Use tsup for bot and typebot-js packages [[84163c6](https://github.com/baptisteArno/typebot.io/commit/84163c658571c2c51ebdddd0c52ea962e13436b4)]

### Miscellaneous

- 📦 Upgrade packages [[2c66c59](https://github.com/baptisteArno/typebot.io/commit/2c66c59dfce448aaa5d04a43c3df8c4a7921c92e)]
- 📦 Update packages [[ff52a67](https://github.com/baptisteArno/typebot.io/commit/ff52a676f6c31be9a3b80a7b4d7710def5204958)]


<a name="2.8.1"></a>
## 2.8.1 (2022-10-09)

### New features

- ✨ (editor) Add unpublish and close typebot options [[bfed599](https://github.com/baptisteArno/typebot.io/commit/bfed59969599abc5a844540bd981f7dca7435f0e)]

### UI/UX Improvements

- 🚸 (bot) Display inputs to the right s… [[aea9021](https://github.com/baptisteArno/typebot.io/commit/aea9021eb881f3f20e31a9680d0dd7cba9b0ee4e)]
- 🚸 (bot) Display inputs to the right s… [[30c1acb](https://github.com/baptisteArno/typebot.io/commit/30c1acbd2b16b41360ac56473455ea5bff9d8b41)]
- 🚸 (sendEmail) Better result logging [[7ca97d4](https://github.com/baptisteArno/typebot.io/commit/7ca97d4606c26d5b9aae94ad292bfe053002696c)]

### Fixed

- 🐛 (builder) giphy debounce input [[691b3d0](https://github.com/baptisteArno/typebot.io/commit/691b3d0cb58341af51e6763c1670bec4f1c6742d)]
- 🐛 (bubbles) Fix giphy search input buggy [[88c4076](https://github.com/baptisteArno/typebot.io/commit/88c40766645d93729495618144083b2fe7b6ed36)]

### Content

- 📝 Update changelog [[471ffe8](https://github.com/baptisteArno/typebot.io/commit/471ffe8e217f9b0c48c040d7115b46a5269088c1)]

### Miscellaneous

- 📦 Upgrade deps [[5289a96](https://github.com/baptisteArno/typebot.io/commit/5289a96940e2bcc74532a08a91b081131bc17616)]


<a name="2.8.0"></a>
## 2.8.0 (2022-10-02)

### New features

- ✨ (lp) Add new pricing page [[c94a658](https://github.com/baptisteArno/typebot.io/commit/c94a6581be077d5c8403004f688d3213a80d80a5)]
- ✨ Add usage-based new pricing plans [[898367a](https://github.com/baptisteArno/typebot.io/commit/898367a33be70d86b765421462d1c288d0c8cc05)]

### UI/UX Improvements

- 🚸 (inputs) Improve date input response bubble formatting [[fac70b9](https://github.com/baptisteArno/typebot.io/commit/fac70b96395f0554168d650c3971ed388f1b8f0e)]

### Fixed

- 🐛 (usage) Archive typebot to be able to compute usage [[15dbc95](https://github.com/baptisteArno/typebot.io/commit/15dbc9577d0de7f117aaa151a2b544b8fe66e4b0)]
- 🐛 (workspace) Allow lifetime users to invite members to workspace [[e1f2d49](https://github.com/baptisteArno/typebot.io/commit/e1f2d49342c0141fb258e42b75b257d110277e87)]
- 🐛 Lifetime users should have access to Pro features [[9ed4916](https://github.com/baptisteArno/typebot.io/commit/9ed4916c59370b17c622cd5818831f2e451d1a8f)]
- 💚 (ci) Fix turbo repo prisma cache [[8c56c6c](https://github.com/baptisteArno/typebot.io/commit/8c56c6c32de0c3faa0b01427f5dce996b78e589c)]
- ✏️ (pricing) Fix typos [[9061c03](https://github.com/baptisteArno/typebot.io/commit/9061c03d6d1515b7c5ac12fe70717b1ce809dd05)]
- 🐛 Remove delete result cascade [[3c803b1](https://github.com/baptisteArno/typebot.io/commit/3c803b134504f8a4f379e97792b60fb8a13f2b62)]
- 🐛 (limits) Fix storage limit trigger and e2e tests [[30dff2d](https://github.com/baptisteArno/typebot.io/commit/30dff2d5d7ceee03e1af7cb65b48b8a151bfb217)]
- 🐛 (usage) Fix storage limit check [[1e26703](https://github.com/baptisteArno/typebot.io/commit/1e26703ad416460a49814c163fc2e7a288d9088c)]
- 🐛 (limits) Fix usage limits email emojis [[1063429](https://github.com/baptisteArno/typebot.io/commit/106342927578f4e844d5fc468d0093448d31c893)]
- 🐛 (stripe) Fix plan update and management [[6384a3a](https://github.com/baptisteArno/typebot.io/commit/6384a3adae6b9078fa782dcba7a787c955bdddd0)]
- 🐛 (stripe) Update additional items when they didn&#x27;t exist [[f83e0ef](https://github.com/baptisteArno/typebot.io/commit/f83e0efea2dc5920715b0436add2766aeafc7be7)]
- 💚 Better build scripts [[d8b1d8a](https://github.com/baptisteArno/typebot.io/commit/d8b1d8ad596079ca4f35a052304cf9effa6e11be)]
- 🐛 (editor) Shouldn&#x27;t be able to set a group name to empty string [[6a1eaea](https://github.com/baptisteArno/typebot.io/commit/6a1eaea700cf9c21c2568843c04b0f02b428ec11)]

### Internal

- ♻️ (usage) Remove limit until temporarily [[3bec24a](https://github.com/baptisteArno/typebot.io/commit/3bec24a8cc3c0aa8d68f5ba44d96aea725bd4e77)]

### Miscellaneous

- 📦 Upgrade deps to latest version [[a947c1c](https://github.com/baptisteArno/typebot.io/commit/a947c1ce34cd8d7adbe8d63b317f10122a20c295)]
- 🧑‍💻 (emails) Add decent emails management [[1654de3](https://github.com/baptisteArno/typebot.io/commit/1654de3c1f4449161511a3890a5f540bb6034653)]


<a name="2.7.1"></a>
## 2.7.1 (2022-09-12)

### Fixed

- 🐛 (webhook) Don&#x27;t send body when GET method is used [[4a04d1c](https://github.com/baptisteArno/typebot.io/commit/4a04d1ccbac67526a376ed798704e153cd63a37e)]
- 🐛 (webhook) Don&#x27;t send body when GET method is used [[d696f55](https://github.com/baptisteArno/typebot.io/commit/d696f551c3d59296f5afbfc55f49f6cbc96c3e10)]
- 🐛 (textinput) Don&#x27;t submit on enter when long input [[4bf47ec](https://github.com/baptisteArno/typebot.io/commit/4bf47ecf90ee103dccfd6f024943cbe7b39a25f9)]
- 🐛 (viewer) load a bot without a start edge [[b64f787](https://github.com/baptisteArno/typebot.io/commit/b64f787cf5d39bd475a7b7b62dcaff5e3405326c)]

### Miscellaneous

- 📦 Update packages [[a262fc1](https://github.com/baptisteArno/typebot.io/commit/a262fc190e1829cb0f2b5adc90a59386c157caac)]
- 🛂 (builder) Make sure old typebots can&#x27;t overwrite newer [[1a7c25e](https://github.com/baptisteArno/typebot.io/commit/1a7c25ef0b4dd6961101661eb5c47bb3b5bdc9cf)]


<a name="2.7.0"></a>
## 2.7.0 (2022-09-01)

### Fixed

- 🐛 (lp) Update plausible tracking url [[42bf93e](https://github.com/baptisteArno/typebot.io/commit/42bf93e72941a6a05554a2425da4d514dc99acbe)]
- 🐛 (lp) Update plausible tracking url [[a8d1e27](https://github.com/baptisteArno/typebot.io/commit/a8d1e27e15fb0aa884fa43346e75b36f5f4fa475)]

### Content

- 📝 More explicite set variable compute examples [[a161180](https://github.com/baptisteArno/typebot.io/commit/a16118027d2adb0aedd76902cf8d2d83692bb949)]

### Miscellaneous

- 🧑‍💻 (smtp) Use secure prop instead of ignoreTLS [[cf07cfe](https://github.com/baptisteArno/typebot.io/commit/cf07cfe3abadac0bcdbb136896e6f2cfe71fd142)]


<a name="2.6.2"></a>
## 2.6.2 (2022-08-29)

### Miscellaneous

- 📦 Add cz-emoji [[d94879e](https://github.com/baptisteArno/typebot.io/commit/d94879ec3b2d1bc3ac8461f4626e0073c0f62cd6)]
-  chore: upgrade packages [[57866c4](https://github.com/baptisteArno/typebot.io/commit/57866c4aa3d210d24cedaecfa81b45c1a2550f7a)]
-  fix(webhooks): improve body parsing [[43891b0](https://github.com/baptisteArno/typebot.io/commit/43891b06aaa85ba297cd0d65526f0307cb8e5858)]
-  fix(results): crash when variable is object [[02bb7f5](https://github.com/baptisteArno/typebot.io/commit/02bb7f5ea774eb3f71ebb75aad811730be9031cf)]
-  build: upgrade packages [[5928142](https://github.com/baptisteArno/typebot.io/commit/59281426b0d5be31a6b85ec5c71bd47d5f06c614)]
-  fix(typebotLink): current typebot dropdown [[93161b7](https://github.com/baptisteArno/typebot.io/commit/93161b74b2b53ea997d6328a3e618fc1023c8d11)]
-  fix(paymentInput): don&#x27;t proceed when modal closed [[bd41d7f](https://github.com/baptisteArno/typebot.io/commit/bd41d7fc9be01fb307cf42fcdf6e0835a03729e1)]
-  build(results): add log to investigate crash [[1318d27](https://github.com/baptisteArno/typebot.io/commit/1318d27c74dccd4647d7f9e669d196cbd8069100)]


<a name="2.6.1"></a>
## 2.6.1 (2022-08-18)

### Miscellaneous

-  build: bump version [[ec7de58](https://github.com/baptisteArno/typebot.io/commit/ec7de582bddd20091d7c696c7ac11453c2ee05dc)]
-  fix(engine): reset button type to submit [[741f31a](https://github.com/baptisteArno/typebot.io/commit/741f31a05ec4fd617d4886f9ff9ac05638b57833)]
-  fix(bot): pay button not submitting [[f9c16ce](https://github.com/baptisteArno/typebot.io/commit/f9c16ce4c4382a24af04f4f6517c8c11a6af551f)]
-  fix(bot): google pay autocomplete [[dc5a38c](https://github.com/baptisteArno/typebot.io/commit/dc5a38cacfc2b77366bb6e9acea14849eb09c5c2)]
-  docs: add a custom domain [[6928848](https://github.com/baptisteArno/typebot.io/commit/69288484ed204a320c2767403ff09df5af660536)]
-  feat(inputs): improve input focus behavior [[fd01793](https://github.com/baptisteArno/typebot.io/commit/fd0179359495a5999b6c4e2cc893f958b55235e7)]
-  ci: avoid triggering npm publish on any tag [[008724a](https://github.com/baptisteArno/typebot.io/commit/008724a3b1235b91a843a3d545912800e41b2053)]


<a name="2.6.0"></a>
## 2.6.0 (2022-08-13)

### Miscellaneous

-  build: bump version [[e16ca64](https://github.com/baptisteArno/typebot.io/commit/e16ca6411891fc0ae1e5d22a6445a3da395ae93d)]
-  fix(giphy): search [[5333ba9](https://github.com/baptisteArno/typebot.io/commit/5333ba9088fd27e23e19802c35ae1af5aa617810)]
-  docs: add members and guests [[6716cf2](https://github.com/baptisteArno/typebot.io/commit/6716cf2484fdc771636c5b183278bef7dcaab68e)]
-  fix(results): crash when accessor contains a dot [[361092f](https://github.com/baptisteArno/typebot.io/commit/361092ffa59b330574358439e844b09b70d6cbf0)]
-  fix(collaboration): env var typo [[823793a](https://github.com/baptisteArno/typebot.io/commit/823793aab49ab3feb5562d8fd87a8a4e4f36caea)]
-  docs: improve set current date wording [[f9ab0e8](https://github.com/baptisteArno/typebot.io/commit/f9ab0e8a762a2778aa569cc41c602276b59525d9)]
-  build: add pnpm [[ee338f6](https://github.com/baptisteArno/typebot.io/commit/ee338f62dc0923bf20b62b0a7696cf99d296611d)]
-  docs: update vercel cli command (closes [#116](https://github.com/baptisteArno/typebot.io/issues/116)) [[8c3b505](https://github.com/baptisteArno/typebot.io/commit/8c3b5058f1e2c30a8017e01b883e3e3b2a4b5feb)]
-  docs: link to current typebot [[0e3ce7e](https://github.com/baptisteArno/typebot.io/commit/0e3ce7e7a704f346f377518874b3700a12a1d094)]
-  docs: add builder url in viewer config [[5ff9afc](https://github.com/baptisteArno/typebot.io/commit/5ff9afc2b049dd6828dd8fa3e8468449ad761e93)]
-  docs: add extract cookie example [[47d24c4](https://github.com/baptisteArno/typebot.io/commit/47d24c444782aace04e4134158a64f09baa99a20)]
-  docs: add lp and docs start instructions [[22eb48b](https://github.com/baptisteArno/typebot.io/commit/22eb48be0b9222152c8836cdd937bf1f135ba54a)]
-  feat(results): remove incomplete results limitation [[7d0a526](https://github.com/baptisteArno/typebot.io/commit/7d0a5267362a18a46be0d7de631cc07d8feda561)]
-  fix(docs): openssl command [[bd0d995](https://github.com/baptisteArno/typebot.io/commit/bd0d995c2ce5b125dfb797234f79a8d6fe9b754a)]
-  fix(bot): mobile keyboard covering input [[f1a01bf](https://github.com/baptisteArno/typebot.io/commit/f1a01bf6632197fa4c992fea64b0429856040c67)]
-  fix(db): switch blockId and groupId on old answers [[b62b955](https://github.com/baptisteArno/typebot.io/commit/b62b955c07ac536898a4cb610f5caedff98824e0)]
-  fix: viewer general config table [[c2ff1ff](https://github.com/baptisteArno/typebot.io/commit/c2ff1ff68f4cf7d6c26f9a477c544c3d43659450)]
-  fix(templates): duplicate resultsPreference conflict [[481f617](https://github.com/baptisteArno/typebot.io/commit/481f61714ed22e8198319bb53b0536b4571ab104)]
-  chore: update msw [[6822b77](https://github.com/baptisteArno/typebot.io/commit/6822b778975631bb79b09b12f94b4ba870e045f7)]
-  fix: remove json escape for single variable body [[d6aa6e7](https://github.com/baptisteArno/typebot.io/commit/d6aa6e7c752e26933e46edefd71d5f16aa5750c1)]


<a name="2.5.1"></a>
## 2.5.1 (2022-06-29)

### UI/UX Improvements

- 🚸 Add version number in settings modal [[8c86cb8](https://github.com/baptisteArno/typebot.io/commit/8c86cb8684841f25330aa2b77671e57648d46ca2)]
- ♿ Another attempt to disable autofill on text input [[3600783](https://github.com/baptisteArno/typebot.io/commit/3600783439bd432117364a647bd900ffe21bec21)]

### Fixed

- 🐛 From name behavior [[f4c81f2](https://github.com/baptisteArno/typebot.io/commit/f4c81f2f0785f91113bb0f737fb5aaf192be16f9)]
- 💚 Remove unused package [[edec5ba](https://github.com/baptisteArno/typebot.io/commit/edec5ba904020742fb61c07c484d9d3c8eafc6a3)]

### Content

- 📝 Add General settings [[7caac2b](https://github.com/baptisteArno/typebot.io/commit/7caac2bc25b8ede84f9ff6abbc8c07dab1e7a2c4)]
- 📝 Improve docker guides and examples [[d1e94ee](https://github.com/baptisteArno/typebot.io/commit/d1e94ee562f3c724f312659835a2d978972dcf0c)]


<a name="2.5.0"></a>
## 2.5.0 (2022-06-27)

### UI/UX Improvements

- ♿ Add reply-to name on from field [[75604bd](https://github.com/baptisteArno/typebot.io/commit/75604bd3b1b00f4e37c9d891d0b3f8f4c72112cf)]
- ⚡ Optimize graph navigation [[fc4db57](https://github.com/baptisteArno/typebot.io/commit/fc4db575aca858482a4aa100ca81dbf3a83a5bea)]
- ♿ Make multiple avatar possible [[d7b9bda](https://github.com/baptisteArno/typebot.io/commit/d7b9bda5d5efcdba6093194b8f04c2794ef6db27)]
- ⚡ Accept uploaded gif for image bubble [[9222fcb](https://github.com/baptisteArno/typebot.io/commit/9222fcb050ed30312b7a7a622ff5ed02d352983c)]
- ⚡ Add required option on file upload input [[55108c8](https://github.com/baptisteArno/typebot.io/commit/55108c80e88ca3395e41f6e8887988bc7c06ae37)]
- ⚡ Better incoming variable parsing [[554365d](https://github.com/baptisteArno/typebot.io/commit/554365d64596892b37bb679e239d9ec0f16384ac)]
- ⚡ Add attachment in emails [[7c3345a](https://github.com/baptisteArno/typebot.io/commit/7c3345ab13e8529c79e9995cff7d821815096b13)]
- 💄 Overflow issue [[259473a](https://github.com/baptisteArno/typebot.io/commit/259473a781175255af61b3ac6dc3adf78fb4f440)]
- ⚡ Optimize delete all results query [[64a1655](https://github.com/baptisteArno/typebot.io/commit/64a1655f52c75d5b3fa8d15b2b942e4da71e3016)]
- 💄 Attempt to fix overflow issue [[fdf11af](https://github.com/baptisteArno/typebot.io/commit/fdf11af594f9a451d1767529867c562344b07a00)]

### Fixed

- 🐛 Avoid autocomplete on text input [[7b71ac9](https://github.com/baptisteArno/typebot.io/commit/7b71ac94980873e7d24a93348fc170f0a6924bb6)]
- 🐛 Remove storage on result delete [[56dca86](https://github.com/baptisteArno/typebot.io/commit/56dca868c9078a4f28df29d160bf3caea1adab3e)]
- 🐛 Missing content [[bd2b906](https://github.com/baptisteArno/typebot.io/commit/bd2b906bd346e4b57aa67d15a2e783db7dddb430)]
- 🐛 File upload in linked typebot [[b9032b4](https://github.com/baptisteArno/typebot.io/commit/b9032b422c6929630293821562b8ab9e0b5d5d32)]
- 🐛 Enable variable parsing on replyTo field [[a4aa293](https://github.com/baptisteArno/typebot.io/commit/a4aa2938b733150a6ae37a5028d8664cbb9fcac1)]
- 💚 Avoid caching prisma gen [[2441abe](https://github.com/baptisteArno/typebot.io/commit/2441abe0158313f2901a7f2df36652fdebcf813c)]
- ✏️ Fix embed instruction URL [[767f463](https://github.com/baptisteArno/typebot.io/commit/767f4632558937d400a2ea70aeb12b9b9c97cdc6)]
- 🐛 Landing page public env [[7df00ef](https://github.com/baptisteArno/typebot.io/commit/7df00efe463786c31595128feba528d52e15d0db)]

### Content

- 📝 Add TLS explanations for smtp config [[8c93674](https://github.com/baptisteArno/typebot.io/commit/8c936741f3d0b9d4b1f174838a095bc34158cc18)]

### Miscellaneous

-  build: Archive results to still be able to check usage [[3a4f263](https://github.com/baptisteArno/typebot.io/commit/3a4f263c71cf391b96527ed9938fe73f9fc737e2)]


<a name="2.4.0"></a>
## 2.4.0 (2022-06-22)

### New features

- ✨ Add a Help button [[5ef89f7](https://github.com/baptisteArno/typebot.io/commit/5ef89f7501950e8210459c0e643932e8830ded90)]
- ✨ Support variables in buttons [[46900ac](https://github.com/baptisteArno/typebot.io/commit/46900ac6df264fa88467a0a38d4e4fb4000c48bf)]

### UI/UX Improvements

- ⚡ Add custom file upload size limit [[ea76564](https://github.com/baptisteArno/typebot.io/commit/ea765640cf50b619fe3f49f61ce23a4627450bd9)]
- ⚡ Remove iframe preview in editor [[a9e8b3e](https://github.com/baptisteArno/typebot.io/commit/a9e8b3e2aa70e551f0266b36e5013783cfa9c48b)]
- 💄 Responsive rating input [[49bf178](https://github.com/baptisteArno/typebot.io/commit/49bf178090543365a026ed301b11336e3933afef)]
- ⚡ Upgrade bubble text editor [[7a32690](https://github.com/baptisteArno/typebot.io/commit/7a326905a4b9932c27889efda0fe5b2c7bdcc5d7)]
- ♿ Remove branding automatically [[3e7b34c](https://github.com/baptisteArno/typebot.io/commit/3e7b34c7214d96002463a37c865139cd3d30b336)]
- 💄 Typebot link dropdown [[f676166](https://github.com/baptisteArno/typebot.io/commit/f676166a17a069ea6699d772917c5263324ef6f0)]
- 💄 History dropdown button size [[5672797](https://github.com/baptisteArno/typebot.io/commit/5672797a01c01ade977b5136c689faec353ddbf6)]
- 🚸 Grant team plan for admin on new workspace [[d991dd5](https://github.com/baptisteArno/typebot.io/commit/d991dd5467f64862736c6096597f48bc45e4451b)]
- ♿ Hide create buttons for guests [[4e62175](https://github.com/baptisteArno/typebot.io/commit/4e6217597ca196fe0e802f9fc80782b66e2ac973)]
- 💄 1-line truncated texts [[e4ad23c](https://github.com/baptisteArno/typebot.io/commit/e4ad23c2b9449a3345eeb767b1ba1e713a516c7c)]
- 💄 Remove file input dark mode css [[e86d436](https://github.com/baptisteArno/typebot.io/commit/e86d436e8d84d263462b6ee175d087dd04546efb)]
- 🚸 Make guest bubble selectable [[9b8b27b](https://github.com/baptisteArno/typebot.io/commit/9b8b27bab0b457204a9384825ddcf57ab31c2890)]

### Fixed

- 🐛 Runtime public environment [[f801a29](https://github.com/baptisteArno/typebot.io/commit/f801a295393ce845e563f297e0a007d4fcb07b67)]
- 🐛 Runtime public environment&quot; [[3e47b37](https://github.com/baptisteArno/typebot.io/commit/3e47b37c2e59fa39c5917caf0085c3146518b90d)]
- 🐛 Runtime public environment [[e03fe9f](https://github.com/baptisteArno/typebot.io/commit/e03fe9f7d9e4a36e5b0d6e74670eb9c6c4b6657f)]
- 🐛 Translate crash with Slate [[6938533](https://github.com/baptisteArno/typebot.io/commit/6938533126993794c090ea5421e885013e6d39f3)]
- 🐛 Properly escape backslash and quotes [[20dbfe6](https://github.com/baptisteArno/typebot.io/commit/20dbfe64c9f9eb9e15ce934339e7753d486899c2)]
- 🐛 Make sure delete all works [[18c5ea5](https://github.com/baptisteArno/typebot.io/commit/18c5ea52073df9625379c922a3a7f042e08010a9)]
- 🐛 Avoid chat to start multiple times [[48a4976](https://github.com/baptisteArno/typebot.io/commit/48a49761672b65a0b7d14aeee5b1208077a37061)]
- 🐛 Display file URL in CSV export [[6f4267e](https://github.com/baptisteArno/typebot.io/commit/6f4267e7e27f079c55a4e67a825ce964896be5a6)]
- 🚑 Stripe form isn&#x27;t showing [[0dd607b](https://github.com/baptisteArno/typebot.io/commit/0dd607bcdfd5763a9fb8b0acccc8e40fdbf95630)]
- 🚑 Empty body emails [[0ffdd88](https://github.com/baptisteArno/typebot.io/commit/0ffdd88dbaff5a4eb77866d5d1f727763310808c)]
- ✏️ About page typo [[2a6e065](https://github.com/baptisteArno/typebot.io/commit/2a6e0652f24c32e1f1024496db978996ac01c2d5)]

### Content

- 📝 Add doc for every block [[283509e](https://github.com/baptisteArno/typebot.io/commit/283509ed59140efe50d13d6cd1ef996aaa81cd00)]

### Internal

- 🔒 Improve delete security checks [[9352587](https://github.com/baptisteArno/typebot.io/commit/93525872980f7d1a05a714f8ed855ff2dbed681e)]

### Miscellaneous

-  ci: 👷 Simplify build on Vercel [[3392e04](https://github.com/baptisteArno/typebot.io/commit/3392e04d38c2c86af52622bb24a4930d6d3e6c18)]
-  Merge branch &#x27;main&#x27; of https://github.com/baptisteArno/typebot.io [[1931a5c](https://github.com/baptisteArno/typebot.io/commit/1931a5c9c015dcd25115ee25eaed744ede672a6c)]
- 🛂 Hide folders for guests [[85601fc](https://github.com/baptisteArno/typebot.io/commit/85601fc1def252eda0543cbe71490a8d713f795e)]


<a name="2.3.0"></a>
## 2.3.0 (2022-06-13)

### New features

- ✨ Add file upload input [[75365a0](https://github.com/baptisteArno/typebot.io/commit/75365a0d822fd6e18f0ec6d12287bb03598ea0b0)]
- ✨ Custom email body and HTML content [[97980f4](https://github.com/baptisteArno/typebot.io/commit/97980f42ca255e2e7d690a2c1a39c9732bda1fc1)]
- ✨ Add Rating input [[b1aecf8](https://github.com/baptisteArno/typebot.io/commit/b1aecf843b28e0c06cf7c43f59cc5ebd661da416)]

### UI/UX Improvements

- ⚡ Improve first paint delay [[aeaaa5c](https://github.com/baptisteArno/typebot.io/commit/aeaaa5c39814fccfdcdcd35e4c601ef2643826f1)]
- 🚸 Attempt to remove Chrome auto complete [[8751766](https://github.com/baptisteArno/typebot.io/commit/8751766d0e2a1e8ee399c4d64e2e333700e73f30)]

### Fixed

- 🚑 Add a variable update queue to avoid initial crash [[87a9e7e](https://github.com/baptisteArno/typebot.io/commit/87a9e7e337569da3c16efc17c7ac62ddc1e03270)]
- 💚 Attempt to fix cached prisma models [[4fd5d45](https://github.com/baptisteArno/typebot.io/commit/4fd5d452a378b0ff7c937ae9670356352728f4fc)]
- ✏️ Remove quotes from email config [[0a45a31](https://github.com/baptisteArno/typebot.io/commit/0a45a31007013cf914ae3dd6feddab151aaac4ed)]

### Content

- 📝 Indicate where var dropdown is available [[177789c](https://github.com/baptisteArno/typebot.io/commit/177789c1a693c1c4ac8ae0c5f6467c25c38a52c2)]
- 📝 Improve hidden variables doc [[d4c52d4](https://github.com/baptisteArno/typebot.io/commit/d4c52d47b31ce3c70067e6fc3938f728757b2b9f)]
- 📝 Update email doc [[6657a85](https://github.com/baptisteArno/typebot.io/commit/6657a85573b00b44b61acbd85b41296da680a8ee)]
- 📝 Update video in README for mobile [[1b569da](https://github.com/baptisteArno/typebot.io/commit/1b569dae99a2d4f138530b058b58006fea81922b)]

### Internal

- 🔧 Add ignoreTLS option for SMTP creds [[3105ade](https://github.com/baptisteArno/typebot.io/commit/3105adedb39c05f207f7193bcfdccc841506c870)]
- 🔒 Add verification on backend for file input deployment [[14afd22](https://github.com/baptisteArno/typebot.io/commit/14afd2249e9615a0e4a616df81d95032416bd8fa)]
- ♻️ Rename step to block [[2df8338](https://github.com/baptisteArno/typebot.io/commit/2df833850504fa2bb8653494a0e3abb120abde1f)]

### Miscellaneous

-  ci: 👷 Auto create tags [[5c54bb7](https://github.com/baptisteArno/typebot.io/commit/5c54bb7755f4ecad319910d7cd1aa87ef5d89b79)]
- 🧑‍💻 Keep host avatar when group starts with input [[910b871](https://github.com/baptisteArno/typebot.io/commit/910b87155659c6592f20643ac7609cba0fb2c6f5)]
- 🛂 Restrict file upload input [[353923e](https://github.com/baptisteArno/typebot.io/commit/353923e029426ae748476b2a6462aa043fda2fb1)]


<a name="2.2.9"></a>
## 2.2.9 (2022-07-07)

### New features

- ✨ Brand new Results table [[d84f990](https://github.com/baptisteArno/typebot.io/commit/d84f99074ddc02794e7c90fa121a573adc619763)]

### UI/UX Improvements

- 💄 Change to refreshed logo [[b0d1b11](https://github.com/baptisteArno/typebot.io/commit/b0d1b113259c4e820f0b5e45d3b2d45df5776513)]
- ♿ Indicate why GSheets couldn&#x27;t find any sheet [[6b32c17](https://github.com/baptisteArno/typebot.io/commit/6b32c171febfe03ab6437563497c667991df39bf)]
- ⚡ Increase upload expiry time [[066147f](https://github.com/baptisteArno/typebot.io/commit/066147f81d87ffe005b4df62bf1aa44877243489)]
- 🚸 Arrow &amp; Enter commands for dropdowns [[bc803fc](https://github.com/baptisteArno/typebot.io/commit/bc803fc5520d0217c00008e2f659fc91f2d6419c)]

### Fixed

- 💚 Upgrade to Node 16 for npm publish workflow [[50ab2a9](https://github.com/baptisteArno/typebot.io/commit/50ab2a9b9caea54151293d8503ff268203a4723b)]
- 🐛 Open iframe on proactive message click [[2e4d9d5](https://github.com/baptisteArno/typebot.io/commit/2e4d9d5a1daaafe5792398aa0fee1784aa937060)]
- 🐛 webhookSteps returns blocks instead of step [[d35bfeb](https://github.com/baptisteArno/typebot.io/commit/d35bfeb3239c92805a679fa7de525b39620ea362)]
- 🐛 Files upload progress bar not sequential [[b0010aa](https://github.com/baptisteArno/typebot.io/commit/b0010aae3293f5901f6f01fd4a0d103f603d8024)]
- 🐛 Ignore cell content for column size [[994ae61](https://github.com/baptisteArno/typebot.io/commit/994ae61719dc1bdd14f7ab7083af6e8e3ce5d83b)]
- 🐛 Accept file upload without fileType [[38a3ee7](https://github.com/baptisteArno/typebot.io/commit/38a3ee7010d65619f8d86d44813d3837c2b8557a)]
- 🚑 Forgot the migration script [[407cace](https://github.com/baptisteArno/typebot.io/commit/407cace752402eaed3227b20ef9dfb4628ec167d)]
- 🐛 Reply to name parsing [[a9a0aec](https://github.com/baptisteArno/typebot.io/commit/a9a0aec375df8ef024af45250397e2ddd1b7bb4e)]
- 🐛 Back action trigger on finger swipe [[db9a314](https://github.com/baptisteArno/typebot.io/commit/db9a314b9f5eee989771570593d586f8d85ddbc3)]
- 🐛 Attempt to fix collaboration invitation email [[6e5f507](https://github.com/baptisteArno/typebot.io/commit/6e5f5071716312b63517b029de4b353b7074ad75)]
- 💚 Remove latest tag action [[6c1d9d4](https://github.com/baptisteArno/typebot.io/commit/6c1d9d419b852bdab9f7ad0eed10f44068152110)]

### Content

- 📝 Add workspace doc [[0dd99e0](https://github.com/baptisteArno/typebot.io/commit/0dd99e0802a822ba74c8672c1047a5d5edc40e19)]
- 📝 Add Troubleshoot sections [[f1f5299](https://github.com/baptisteArno/typebot.io/commit/f1f529949d400751c092f00e032891dd13cbbccb)]
- 📝 Add Metadata section in Settings [[5fa8dbf](https://github.com/baptisteArno/typebot.io/commit/5fa8dbfb7e13eb35c1219ecb0c877a54032f6019)]
- 📝 Add context menu doc [[2e2b1c1](https://github.com/baptisteArno/typebot.io/commit/2e2b1c1b6b9a3a81daff77493e8ec08782f0c087)]
- 📝 Precise what browsers blocks the popups [[273d476](https://github.com/baptisteArno/typebot.io/commit/273d4767f110a39f8b72ccf1c3b4965d39a3f2d6)]
- 📝 Add dynamic avatar guide [[cc71157](https://github.com/baptisteArno/typebot.io/commit/cc71157e0fcb3832dd3226e4ada42e89a632bde7)]

### Internal

- 🔒 Check token id before updating creds [[9cddc75](https://github.com/baptisteArno/typebot.io/commit/9cddc755a3087631605c91a8efce35b4ad74e916)]

### Miscellaneous

-  improve Dockerfile size and safety [[9839f5c](https://github.com/baptisteArno/typebot.io/commit/9839f5c1325deeb06162ee7a553b6cf34e769bcd)]


<a name="2.2.1"></a>
## 2.2.1 (2022-06-07)

### Fixed

- 🐛 Add public env var in runtime config [[a42e1ca](https://github.com/baptisteArno/typebot.io/commit/a42e1cad22621a9f4a8e0beff693bc58bb7531e3)]
- ✏️ Docker upgrade guide typo [[c67fa7d](https://github.com/baptisteArno/typebot.io/commit/c67fa7d9c1dcdf6c03cdde9a28dd3a12e046bdec)]
- 🐛 Google sheets callback crash when no code [[8ec117a](https://github.com/baptisteArno/typebot.io/commit/8ec117aee4cd50145c1133f8375320bad31f0c4d)]
- ✏️ Email integration youtube ID [[b403d9b](https://github.com/baptisteArno/typebot.io/commit/b403d9b346ba37f0d7f790506cc6cf4defd9aaa6)]
- ✏️ Docker upgrade instructions [[8eefd96](https://github.com/baptisteArno/typebot.io/commit/8eefd96d2fc5ba10912008a033413ee5cb25b882)]

### Content

- 📝 Update wordpress personalization [[3010976](https://github.com/baptisteArno/typebot.io/commit/301097623ba841312ef66c23d514105f276a2a29)]

### Internal

- 🗃️ Remove duplicate fields in PublicTypebot [[ad32ae0](https://github.com/baptisteArno/typebot.io/commit/ad32ae02ef4493af34c4e777a7305ffba24cbb7d)]

### Miscellaneous

-  remove unnecessary comment [[853b749](https://github.com/baptisteArno/typebot.io/commit/853b749e2c577aa1c0f25f9833930d1463752752)]
-  update docs [[237c388](https://github.com/baptisteArno/typebot.io/commit/237c388e31bdb774d9997c3029bf8a1f5e64d4cd)]
-  add azure-ad login option [[ee370b5](https://github.com/baptisteArno/typebot.io/commit/ee370b5f26b2a7e1f58031b29d563fd9f80e11c4)]


<a name="2.2.0"></a>
## 2.2.0 (2022-06-03)

### New features

- ✨ Revokable API tokens [[a0929c4](https://github.com/baptisteArno/typebot.io/commit/a0929c492b260e5e03c4ee0e41dacc120ca066fa)]
- ✨ Start preview from any block [[89d91f9](https://github.com/baptisteArno/typebot.io/commit/89d91f9114c0ce16cedd34ef8a2348c2c734571b)]
- ✨ Add Digital Product Payment template [[89d17a9](https://github.com/baptisteArno/typebot.io/commit/89d17a9ed3f02b6cf33e8382cb9a7135e7549d33)]

### UI/UX Improvements

- 🚸 Greater than / Less than [[43fb8a7](https://github.com/baptisteArno/typebot.io/commit/43fb8a7be078426a81903a1bd5849691f4743919)]
- 🚸 Improve plan upgrade flow [[87fe479](https://github.com/baptisteArno/typebot.io/commit/87fe47923eda1bea44001d1b2efe7f69521d4723)]
- 💄 Scroll when payment form appears [[caa6015](https://github.com/baptisteArno/typebot.io/commit/caa6015359614266b5d777218946488565d49882)]
- ⚡ Redirect on current window when embedded [[4f208a2](https://github.com/baptisteArno/typebot.io/commit/4f208a2d0546f0e21101288cfc7651542f54cbf9)]
- ⚡ Better payment accessibility [[c1461f0](https://github.com/baptisteArno/typebot.io/commit/c1461f075882b0fcdca4c6f33b6d295d83ccab5d)]
- ⚡ Accept variables as webhook data path [[26cf38f](https://github.com/baptisteArno/typebot.io/commit/26cf38fb2181de71fdc07663f70128088ae8bee0)]

### Fixed

- 🐛 Payment for zero-decimal currencies [[274f30c](https://github.com/baptisteArno/typebot.io/commit/274f30c6c23575ad435ebdb70d3d863861c0a5e9)]
- ✏️ Upgrade modal [[b176c4d](https://github.com/baptisteArno/typebot.io/commit/b176c4dd03498dc4ab3978c167755669a4c1d3a8)]
- 🐛 Redirect new tab backward [[9f58260](https://github.com/baptisteArno/typebot.io/commit/9f582606a792f34d8e75dc547d632c01ca459e05)]
- 🐛 Subscription cancel webhook [[3592321](https://github.com/baptisteArno/typebot.io/commit/35923215b9ace10dfc196689a08a214f8214eef8)]
- ✏️ Remove credentialsId in product payment [[05de48b](https://github.com/baptisteArno/typebot.io/commit/05de48b6a7bcfb5c1d9414ea534c0295aa56662f)]
- 🐛 Empty receipt email [[7aa6dab](https://github.com/baptisteArno/typebot.io/commit/7aa6dab78a80baf7ceb131d74c2d05c74c807ed3)]
- ✏️ Collab invite link [[c6bd3ea](https://github.com/baptisteArno/typebot.io/commit/c6bd3ea634e9bbed086bf89177a86c7521cd6d06)]
- 🐛 Payment receipt email parsing [[797ff18](https://github.com/baptisteArno/typebot.io/commit/797ff1892d43c383a07970436d92eea51b1868f5)]
- 🐛 Variable value reset [[a9f730b](https://github.com/baptisteArno/typebot.io/commit/a9f730b7019330f11dd5b64cc465c9f803508d05)]

### Content

- 📝 Import / Export flow [[e5d7f1d](https://github.com/baptisteArno/typebot.io/commit/e5d7f1d1ce52e2a242ff894b22af50ff486a6cec)]
- 📝 Add instructions for custom docker images [[97eb036](https://github.com/baptisteArno/typebot.io/commit/97eb0361c8d17a9433b7b6a910be5929d7076c73)]
- 📝 Explain how to pass parent URL [[61e4ca1](https://github.com/baptisteArno/typebot.io/commit/61e4ca13132ca72294620c7df18a2644367a8908)]

### Internal

- ♻️ Toast component [[12f2e40](https://github.com/baptisteArno/typebot.io/commit/12f2e401523c4bac8cace617c767540d43a5701b)]

### Miscellaneous

- 🧑‍💻 Input default autocompletes [[f42dd48](https://github.com/baptisteArno/typebot.io/commit/f42dd485334966e3aa41d76d1c422fdb2de983cb)]
-  ci: 👷 Remove docsearch scrapper [[b65d153](https://github.com/baptisteArno/typebot.io/commit/b65d153bf0cf5edef071a1a840699127e5f62242)]
-  build(docker): 👷 Build images on push [[5e19f79](https://github.com/baptisteArno/typebot.io/commit/5e19f796cc3199488b3839f2386f471b486b220a)]


<a name="2.1.2"></a>
## 2.1.2 (2022-05-30)

### Fixed

- 🐛 Number var [[d6b5568](https://github.com/baptisteArno/typebot.io/commit/d6b5568e033473beffec86df05e15c5bca26bda6)]
- 🐛 Multi-line var parsing for webhook [[d02f267](https://github.com/baptisteArno/typebot.io/commit/d02f2675883a7b636fa1a66922b64f85f781e5f5)]
- 🐛 Don&#x27;t parse &quot;004&quot; as number 4 [[e72934d](https://github.com/baptisteArno/typebot.io/commit/e72934d29af114dfc66d55776833d359a5ebe7af)]
- 🐛 Custom currency payment input [[2cb8330](https://github.com/baptisteArno/typebot.io/commit/2cb83307903e92d67bdf72d1df46dac3d2bcbf2f)]

### Content

- 📝 Fix FROM email quotes [[30d36b9](https://github.com/baptisteArno/typebot.io/commit/30d36b9a09647e3a259442f7c3342b690f3a0913)]

### Miscellaneous

- 🛂 Disable new user signups [[ff5c368](https://github.com/baptisteArno/typebot.io/commit/ff5c3683fcac487301b31ab6b855694c6f9d59d5)]
-  Update compose file [[2bdc1ce](https://github.com/baptisteArno/typebot.io/commit/2bdc1ce05635078b58cd8772c016e5e1a1dd3126)]
- 🧱 Improve runtime environment [[a04a11a](https://github.com/baptisteArno/typebot.io/commit/a04a11ae0272170e1f83f4c367b529afaff52efc)]
- 📦 Compatible with iPhone 6 [[92cd56e](https://github.com/baptisteArno/typebot.io/commit/92cd56e5d0e16de5a6b2a234c8a1293cdd68dadf)]


<a name="2.1.1"></a>
## 2.1.1 (2022-05-25)

### New features

- ✨ Payment input [[3a6ca3d](https://github.com/baptisteArno/typebot.io/commit/3a6ca3dbde916647f5ac7eaba28f5a3b8072f030)]

### UI/UX Improvements

- 💄 New URL image preview [[faffcc6](https://github.com/baptisteArno/typebot.io/commit/faffcc69a7ceda588ca2e095ca15bf15fd59c9a7)]
- 💄 Proactive message margin [[350719c](https://github.com/baptisteArno/typebot.io/commit/350719c7935604aef4ee5b353422203043921d8b)]
- 💄 Proactive message close icon [[ac278b9](https://github.com/baptisteArno/typebot.io/commit/ac278b9916c7af9daf3bef0daa4d4a97d04b7f50)]
- 💄 Hide avatar if not last block [[0de0d12](https://github.com/baptisteArno/typebot.io/commit/0de0d128b39716d9ababb468bbefc448fa04575c)]
- 💄 Add button ping if unique first [[d9e273b](https://github.com/baptisteArno/typebot.io/commit/d9e273b008376985992d4d32993c6aa13335738b)]
- ⚡ Delete workspace button [[b7b0344](https://github.com/baptisteArno/typebot.io/commit/b7b034432a03e579d42a47f8497a2891ce708e5b)]
- 💄 Variable button tiny dropdown [[0f38141](https://github.com/baptisteArno/typebot.io/commit/0f38141eb156196635aabad287cad30f99e9fdca)]

### Fixed

- 💚 Missing dependency [[4a5a92b](https://github.com/baptisteArno/typebot.io/commit/4a5a92b973ba2a5b74292ce7d67d01a27fb98051)]
- 🐛 Quit flow if redirecting [[91ea637](https://github.com/baptisteArno/typebot.io/commit/91ea637a0827c77b971e5a26e406f80b22af3728)]
- 🐛 Build syntax error [[71c9c74](https://github.com/baptisteArno/typebot.io/commit/71c9c743d4b501925a916e2abb0dca867285c849)]
- 🐛 Forwarded host check attempt [[c168b67](https://github.com/baptisteArno/typebot.io/commit/c168b678dd397a6c96afaca533a708145b099c67)]
- 🐛 Forwarded host checking&quot; [[a2dd26b](https://github.com/baptisteArno/typebot.io/commit/a2dd26b60f7e28c141f9df7066c9045bbcdc7571)]
- 🐛 Forwarded host checking [[37dea9c](https://github.com/baptisteArno/typebot.io/commit/37dea9c4030f06f8e73ba6ebc773a17ca9a6f911)]
- 🐛 Score addition [[1bb8952](https://github.com/baptisteArno/typebot.io/commit/1bb89527d544c648d846eacf5602ba40b94a4574)]
- 🐛 Ignoring port number when checking matching URL [[62162c6](https://github.com/baptisteArno/typebot.io/commit/62162c6c2a1a17e08a660dad4faed55e7815a95f)]
- 🐛 Standard embed when window is loaded [[ad69cc5](https://github.com/baptisteArno/typebot.io/commit/ad69cc5264b36b9d1a625e0c6a0901bf97aacf6e)]
- 🐛 Code block should never crash bot [[0beb2e6](https://github.com/baptisteArno/typebot.io/commit/0beb2e6619961737786374671b16881079741179)]
- 🐛 Standard embed [[c9b3b04](https://github.com/baptisteArno/typebot.io/commit/c9b3b047dcfb312a8d744bc475a7e57a3b972a41)]

### Content

- 📝 Improve popup delay builder [[62b77e4](https://github.com/baptisteArno/typebot.io/commit/62b77e49059ba3155e7eb81df5df60a9c5803204)]
- 📝 Callbacks URL typo [[447e87d](https://github.com/baptisteArno/typebot.io/commit/447e87de66774c123b7abde168789da343498c7e)]
- 📝 Edit single button color [[c57ed07](https://github.com/baptisteArno/typebot.io/commit/c57ed0777c33225c0ecc5e20cbf81b59077fcd49)]
- 📝 Improve hero wording and add Plausible [[f07db7f](https://github.com/baptisteArno/typebot.io/commit/f07db7f68adddf0eccaf2c4d7a41d6b265f57501)]
- 📝 initContainer typo [[24b077c](https://github.com/baptisteArno/typebot.io/commit/24b077c0e2d06700a94443acc2adc8954beb03ab)]
- 📝 Rename URL examples in config [[730de56](https://github.com/baptisteArno/typebot.io/commit/730de56374313deffb291393f9d0b9791c10eef9)]
- 📝 Add Code block [[fbcd46d](https://github.com/baptisteArno/typebot.io/commit/fbcd46dd9ca0a4ed7598988b82d9b3cd872c4dc3)]
- 📝 Add new preview [[bfd20cb](https://github.com/baptisteArno/typebot.io/commit/bfd20cbf63c7d625576750add1ebe14aa8eaa038)]
- 📝 Add demo in README [[71d96c9](https://github.com/baptisteArno/typebot.io/commit/71d96c98eac9f10722de84e14c51bb3596213271)]
- 📝 Improve Set variable [[55224c9](https://github.com/baptisteArno/typebot.io/commit/55224c9095de2041f71cdfcf33238f523f87f04e)]

### Internal

- 🔒 add gitlab pagination [[b39e892](https://github.com/baptisteArno/typebot.io/commit/b39e89202055a0cc7b9bbe36ac724267684a31f2)]
- 🔥 Remove ownerIds [[bda4116](https://github.com/baptisteArno/typebot.io/commit/bda4116fbc26840badf0b723727d58e12da06b54)]

### Miscellaneous

-  build: 👷 New compose file and entrypoints [[5d786f5](https://github.com/baptisteArno/typebot.io/commit/5d786f59cc6802945908040be86662690903807e)]
-  ci: 👷 Build and publish docker images on new version [[e7ae611](https://github.com/baptisteArno/typebot.io/commit/e7ae6118114a9d3145a536422ff55cb763d12b4a)]
-  Fixed CNAME domain [[47a7aa1](https://github.com/baptisteArno/typebot.io/commit/47a7aa165d8dbb9cc0d499a7b048f365e6a55605)]
- ⚗️ Await for result update [[391aead](https://github.com/baptisteArno/typebot.io/commit/391aeaddf12590db0ce7a40dce5a31d31285b971)]
-  fix(auth): add gitlab to hasNoAuthProvider check [[a178124](https://github.com/baptisteArno/typebot.io/commit/a178124ee988be9982f26ef25fbbc40d88dc877d)]
-  Update README.md [[137c493](https://github.com/baptisteArno/typebot.io/commit/137c4937d0401d0059aa8e0cedf02ef95e43a2c6)]


<a name="2.1.0"></a>
## 2.1.0 (2022-05-17)

### New features

- ✨ Team workspaces [[f0fdf08](https://github.com/baptisteArno/typebot.io/commit/f0fdf08b00f740c4804b49f45dcd8338e29e10fa)]

### UI/UX Improvements

- ⚡ Can disable query params auto hide [[4272186](https://github.com/baptisteArno/typebot.io/commit/42721865c5dade0dc40272f997e8f86c37701678)]
- 💄 Attempt to fix font loading [[46037c0](https://github.com/baptisteArno/typebot.io/commit/46037c039e92b31f233bcde38aa8aac91ba0325a)]

### Fixed

- 💚 Deployment [[210bad3](https://github.com/baptisteArno/typebot.io/commit/210bad32f905e0556cc56757d3327ed6c91b8851)]
- 🐛 Pass tests [[731e646](https://github.com/baptisteArno/typebot.io/commit/731e64637723b6758ebe82510bafcc6af48d7d80)]
- 🐛 Refresh prevent [[4d9796c](https://github.com/baptisteArno/typebot.io/commit/4d9796c55911c1c3bb6187b8c8e5f4c86279ba7c)]
- 🐛 Disable font optimization temporarly [[508c166](https://github.com/baptisteArno/typebot.io/commit/508c1660b45bdf149e2a6db5591074a928a57a90)]

### Miscellaneous

-  👷 Remove maintenance page [[cd24482](https://github.com/baptisteArno/typebot.io/commit/cd24482038788da75178f9a2e7f21b9e3bb820b6)]
-  Merge pull request [#36](https://github.com/baptisteArno/typebot.io/issues/36) from baptisteArno/feat/workspaces [[0e3ee9b](https://github.com/baptisteArno/typebot.io/commit/0e3ee9bee30200c999da8ead691c2a6be8276254)]


<a name="2.0.0"></a>
## 2.0.0 (2022-05-13)

### New features

- ✨ Custom head code [[2dc0e45](https://github.com/baptisteArno/typebot.io/commit/2dc0e45a65f00221dd5c43ee992ff1293cc24789)]
- ✨ Add Pabbly block [[348055d](https://github.com/baptisteArno/typebot.io/commit/348055d68ad3f74998598e3bf3b24bcd4ab2bff0)]
- ✨ Add Make.com block [[38c53fb](https://github.com/baptisteArno/typebot.io/commit/38c53fbbbce328d56763ee1fa8f092ec64e7b593)]
- ✨ Zoom in/out [[c5d3b92](https://github.com/baptisteArno/typebot.io/commit/c5d3b9214da850919eabea5124bde7a254991ddf)]
- ✨ Improve color picker [[15868f9](https://github.com/baptisteArno/typebot.io/commit/15868f99fcbac25939792bc989f596f74a77fa06)]
- ✨ New create typebot menu [[660b220](https://github.com/baptisteArno/typebot.io/commit/660b220f8d91d83e050045f4f09d59a965652fd0)]
- ✨ Custom icon on typebot [[525887a](https://github.com/baptisteArno/typebot.io/commit/525887a32ca781f36b91a08fa271b83713e74938)]
- ✨ Improve variables in executed codes [[db10f1e](https://github.com/baptisteArno/typebot.io/commit/db10f1ee89f17f85ff0deba3c365e8673f501a24)]
- ✨ Add first name for support bubble [[47403e3](https://github.com/baptisteArno/typebot.io/commit/47403e32b3fcc765393660fae82469f9a87a0adf)]
- ✨ Add customer support [[2ded3cd](https://github.com/baptisteArno/typebot.io/commit/2ded3cd9c7498c677647073605109e46c6291fdf)]
- ✨ Add Embed bubble [[953b95d](https://github.com/baptisteArno/typebot.io/commit/953b95d25409484f2b975fa166c015ffdd44d395)]
- ✨ Duplicate blocks &amp; steps [[c01ffa3](https://github.com/baptisteArno/typebot.io/commit/c01ffa3f0b2b093d6f27d80f95a45492fd6bb554)]
- ✨ Add new onboarding flow [[f4e6f63](https://github.com/baptisteArno/typebot.io/commit/f4e6f63b266bcfea7cc3abaced1ca304b0a48644)]
- ✨ Duplicate webhooks on typebot duplication [[b2bf6f0](https://github.com/baptisteArno/typebot.io/commit/b2bf6f09f616d1d16487f21183f5444b48f227a6)]
- ✨ Add auto open delay for bubble embed [[d6b9413](https://github.com/baptisteArno/typebot.io/commit/d6b94130cb72fb633c513e9bf7d73ce30d0ba29d)]
- ✨ Link typebot step [[7e61ab1](https://github.com/baptisteArno/typebot.io/commit/7e61ab19eb151e24b110e5a9e768324b0aa8fce4)]
- ✨ Add create result on page refresh option [[260819f](https://github.com/baptisteArno/typebot.io/commit/260819f124f314bf6df3553a5d2bfb73bb74a397)]
- ✨ Code step [[e3e07dd](https://github.com/baptisteArno/typebot.io/commit/e3e07ddd4dbae6e7b893a0d6be9f12b80d1a6c9c)]
- ✨ Edge menu on click [[3c67837](https://github.com/baptisteArno/typebot.io/commit/3c6783727e5d28322d282f5358030bf161103550)]
- ✨ Can edit answers by clicking on it [[f124914](https://github.com/baptisteArno/typebot.io/commit/f12491419d1b984e0f125d33970aa9267e07dddf)]
- ✨ Add logs in results [[ebf92b5](https://github.com/baptisteArno/typebot.io/commit/ebf92b5536c498e7bf95371eb044796b3786e811)]
- ✨ Restore published version button [[e17a1a0](https://github.com/baptisteArno/typebot.io/commit/e17a1a0869e7f87c55a32d4df316499567003914)]
- ✨ Add collaboration [[b9dafa6](https://github.com/baptisteArno/typebot.io/commit/b9dafa611e073e142fac7409c8098c20e3cef55b)]
- ✨ Add default country code phone [[6d455a3](https://github.com/baptisteArno/typebot.io/commit/6d455a3861d5160219c6a7a08a47828e7ddebf50)]
- ✨ Add Zapier step [[642a427](https://github.com/baptisteArno/typebot.io/commit/642a42779b81608c13b7032954a3779462558142)]
- ✨ Add {{state}} to body to get form state [[d0994e6](https://github.com/baptisteArno/typebot.io/commit/d0994e6577a442d651ea784c45e598f5c224af3d)]
- ✨ Add get sample result endpoint [[fd822a3](https://github.com/baptisteArno/typebot.io/commit/fd822a35a773cf71b25c0f7dce707b5335f8effa)]
- ✨ Add list results endpoint [[9dfcb30](https://github.com/baptisteArno/typebot.io/commit/9dfcb3036509ba7bb45a3cd6adb56817c5c59cbe)]
- ✨ Add email to &#x60;me&#x60; endpoint [[5edd63c](https://github.com/baptisteArno/typebot.io/commit/5edd63c5f6a33e8a3b1e13828a27697f403d3637)]
- ✨ Add routes for subscribing webhook [[68ae69f](https://github.com/baptisteArno/typebot.io/commit/68ae69f36641eccf75b4a4e983131fe289ade9f4)]
- ✨ Add cc &amp; bcc + Deletable credentials [[b89e9b1](https://github.com/baptisteArno/typebot.io/commit/b89e9b1b8242aafc775dca367f9c25f194b9587e)]
- ✨ Add custom domains [[f3ecb94](https://github.com/baptisteArno/typebot.io/commit/f3ecb948a1cc863b93b499bed8f87a5d1d483962)]
- ✨ Add variables in URL support [[6e0ab67](https://github.com/baptisteArno/typebot.io/commit/6e0ab675020f216aed55b8dd677898de2fd4b1e0)]
- ✨ Custom avatars [[d2ac13b](https://github.com/baptisteArno/typebot.io/commit/d2ac13ba5f9089eabaa84a060b50a6a519e4b38f)]
- ✨ Allow webhook with basic auth [[93e8f90](https://github.com/baptisteArno/typebot.io/commit/93e8f90ac33699c477c05cdf236ec6ec30823595)]
- ✨ Add support bubble [[f897102](https://github.com/baptisteArno/typebot.io/commit/f8971022197d3654dc54b19fedb1d1d46ba2fb01)]
- ✨ Add coupon code input [[b345131](https://github.com/baptisteArno/typebot.io/commit/b345131b0b352e6f8abb96f52a796da3a55f4c83)]
- ✨ Add link support in text bubbles [[0338aca](https://github.com/baptisteArno/typebot.io/commit/0338acae82120666d6448fcbeb956a89df0031f6)]
- ✨ Add retry bubbles [[8c8d77e](https://github.com/baptisteArno/typebot.io/commit/8c8d77e052013819c30d38d35ca1b4935a16132f)]
- ✨ Add send email integration [[d6238b3](https://github.com/baptisteArno/typebot.io/commit/d6238b3474e9dda8c5d8db514c72dbfbefa2354d)]
- ✨ Add lead generation template [[1f320c5](https://github.com/baptisteArno/typebot.io/commit/1f320c5d99c52995f3edac8af75ee7da462c767c)]
- ✨ Add unlock/lock sidebar [[1c5bd06](https://github.com/baptisteArno/typebot.io/commit/1c5bd06657bdd1453155965cf715af46c6e5e86c)]
- ✨ Add custom css settings [[21448bc](https://github.com/baptisteArno/typebot.io/commit/21448bcc8a56578e2ca5b12d6bb7672771709586)]
- ✨ Add chat theme settings [[b0abe5b](https://github.com/baptisteArno/typebot.io/commit/b0abe5b8fa5f88b912dd3d1821ce986c88f1d278)]
- ✨ Add auto save [[079cf5e](https://github.com/baptisteArno/typebot.io/commit/079cf5ec57fe09c4ae2e80061b6287162dad2991)]
- ✨ Add webhooks [[a58600a](https://github.com/baptisteArno/typebot.io/commit/a58600a38a9be025d956dd3dbda9d0020a70b630)]
- ✨ Add video bubble [[df2474e](https://github.com/baptisteArno/typebot.io/commit/df2474ef43c1ea4159dfe2ee2083748cfc5e91b3)]
- ✨ Add image bubble [[2d17897](https://github.com/baptisteArno/typebot.io/commit/2d178978ef79c78a6c10a07d72886ffdefb2536a)]
- ✨ Add Redirect step [[c43fd1d](https://github.com/baptisteArno/typebot.io/commit/c43fd1d386a8321b8461a0c468ee3dd081e48a97)]
- ✨ Add Google Analytics integration [[3506d86](https://github.com/baptisteArno/typebot.io/commit/3506d86d50a8994aa8b67a6808d9ce89f594c196)]
- ✨ Add Google Sheets integration [[f49b514](https://github.com/baptisteArno/typebot.io/commit/f49b5143cf6f6e06626929d46e2b05dde3317a77)]
- ✨ Add Condition step [[2814a35](https://github.com/baptisteArno/typebot.io/commit/2814a352b2f8db4b915a202d795c2750d231e650)]
- ✨ Add Set variable step [[4ccb7bc](https://github.com/baptisteArno/typebot.io/commit/4ccb7bca49aa10b6ebca09eba0274346814dfa04)]
- ✨ Add Export flow menu button [[659f50e](https://github.com/baptisteArno/typebot.io/commit/659f50eb06a01f0277836ac51b5b0ad1c42e20ef)]
- ✨ Add buttons input [[c02c61c](https://github.com/baptisteArno/typebot.io/commit/c02c61cd8ba2b62a31f3330ddfd6b4813be81b4d)]
- ✨ Add Phone number input [[b20bcb1](https://github.com/baptisteArno/typebot.io/commit/b20bcb14083619868c3ba971c41d60a92ca553ef)]
- ✨ Add Date input [[8cba7ff](https://github.com/baptisteArno/typebot.io/commit/8cba7ff37bc18fb41ef71c021fd741df39faf586)]
- ✨ Add URL input [[ce1b23a](https://github.com/baptisteArno/typebot.io/commit/ce1b23a0e7874548f75ee729fb12aed99cf132a3)]
- ✨ Add email input [[47162cb](https://github.com/baptisteArno/typebot.io/commit/47162cb28afb58e83458cd344ba18c27f6ad9787)]
- ✨ Add number input [[d54ebc0](https://github.com/baptisteArno/typebot.io/commit/d54ebc0cbe62fc253b513cbbccb7d03ca173516e)]
- ✨ Add text options [[f712c7a](https://github.com/baptisteArno/typebot.io/commit/f712c7ad98d04536965f95bc3d254bb9bc1cffb3)]

### UI/UX Improvements

- ⚡ Image picker and dynamic preview [[a89f4ec](https://github.com/baptisteArno/typebot.io/commit/a89f4ec5b60c674f49e94c7168e1f814d8914187)]
- ♿ Trap block title focus [[46f5d5d](https://github.com/baptisteArno/typebot.io/commit/46f5d5df9138974cf0727ec9c6706f574899caf6)]
- ⚡ Rename variable button [[2b56f83](https://github.com/baptisteArno/typebot.io/commit/2b56f83d4366861c81e8d47e86481fd7b437c96a)]
- 💄 Support bubble icon [[1becdad](https://github.com/baptisteArno/typebot.io/commit/1becdad79e6198d00e9810c23a47b62975481677)]
- 💄 Better chat widget icon [[a2cfecc](https://github.com/baptisteArno/typebot.io/commit/a2cfecc16c7f13b47820034a7c2ddd65a6b5463e)]
- 💄 Better long text input [[e339cc1](https://github.com/baptisteArno/typebot.io/commit/e339cc16725984ec0597a4e0cd33318e4556fbd2)]
- ⚡ Pass host URL params [[7b4dc47](https://github.com/baptisteArno/typebot.io/commit/7b4dc47f118b9f59fb25b43869464ed77e5b27a2)]
- ⚡ Better URL validation [[20c402a](https://github.com/baptisteArno/typebot.io/commit/20c402ad1b4043753cfe6c22c57ce10c14fe85a6)]
- ⚡ Show linked typebots results in webhook sample [[12f43cd](https://github.com/baptisteArno/typebot.io/commit/12f43cdb8877c719e81a6b932a0dba71ffae17ba)]
- 💄 Clear param on page load [[93811a3](https://github.com/baptisteArno/typebot.io/commit/93811a3c48ca43da8d3befbf9e4222d105a06f61)]
- ⚡ Attempt to make redirections more reliable [[a089a45](https://github.com/baptisteArno/typebot.io/commit/a089a451b627bcd33c31294591421c4b101eb66f)]
- ⚡ Improve logs details [[54a757b](https://github.com/baptisteArno/typebot.io/commit/54a757b21b78a224e2503ba70f262c79a7709fa6)]
- ⚡ Make linked bot edge id work [[e50ce64](https://github.com/baptisteArno/typebot.io/commit/e50ce645eb226406b30532b229fcfae56a8bdc96)]
- 💄 Scrollbar on embed [[1a59ce2](https://github.com/baptisteArno/typebot.io/commit/1a59ce20d2ee85ba01fd7ecf8984d671a41ba77c)]
- 🚸 Auto move board when dragging an edge [[b6ba40e](https://github.com/baptisteArno/typebot.io/commit/b6ba40e0095bbdda1b4e689f9921ef31a515931d)]
- ♿ Show Google Sheets detail [[4a2c662](https://github.com/baptisteArno/typebot.io/commit/4a2c6627c35ad372d5573a6733f3829cebe2aa65)]
- 💄 Add margins on bubbles [[611dbad](https://github.com/baptisteArno/typebot.io/commit/611dbad7cdaef8b331ce2e3f6e9f09545f2c7cbc)]
- 💄 Preview drawer zIndex [[f7e779b](https://github.com/baptisteArno/typebot.io/commit/f7e779b0663884bee766ed1c81d0b3f0b2a5c094)]
- 💄 Remove my avatar from quiz [[46a1145](https://github.com/baptisteArno/typebot.io/commit/46a114578ce13c8391ea2bd43c1099da970ade63)]
- 🚸 Pointer events none on video embed [[378fe0f](https://github.com/baptisteArno/typebot.io/commit/378fe0fe82628db3130c2736d7951acf5440da3e)]
- 💄 Center folder title [[1653b53](https://github.com/baptisteArno/typebot.io/commit/1653b539034510fd2f33a51d4af4c1ce2a5837a4)]
- 🚸 Scrollwheel zoom too much [[59ce711](https://github.com/baptisteArno/typebot.io/commit/59ce711303587b3c5b373b2db4945f1ca7b95c3b)]
- 💄 Improve onboarding [[b6d4001](https://github.com/baptisteArno/typebot.io/commit/b6d40016cdad6ff4b65e963d9eee71aa22bc1df5)]
- ♿ Improve graph navigation setting [[4502e68](https://github.com/baptisteArno/typebot.io/commit/4502e68065c5daf19285c3909f0c62935f1bad81)]
- ♿ Lowercase resiliency on &quot;contains&quot; operator [[519723b](https://github.com/baptisteArno/typebot.io/commit/519723b2d895bea93abcc5ec005f6ce81d617c7d)]
- ♿ Add more getting started videos [[eb4feb6](https://github.com/baptisteArno/typebot.io/commit/eb4feb61bdbebf4632cba403b8a539147f41132e)]
- ♿ Getting started editor modal [[786908e](https://github.com/baptisteArno/typebot.io/commit/786908e9cfbf1b1f3673ff14de58312e0ff29dcd)]
- ♿ Create new item when hitting enter [[6867143](https://github.com/baptisteArno/typebot.io/commit/68671433bc0cafc5894429fa4cd65dc019579ed0)]
- ♿ Improve previewing blocks [[327da31](https://github.com/baptisteArno/typebot.io/commit/327da3104dfb5bb957ad6ff731c934e3529fd3e4)]
- 💄 Change default block title [[82f7bf0](https://github.com/baptisteArno/typebot.io/commit/82f7bf0ed67fe0ebd0ee68d142231640f9b3f70b)]
- 💄 UI bump [[7f5d2f4](https://github.com/baptisteArno/typebot.io/commit/7f5d2f4173a61d52a64f5adfc81a812d0170b6db)]
- ⚡ Enforce lite badge even when removed [[3552279](https://github.com/baptisteArno/typebot.io/commit/355227939606169f1415bad157d095991cedc438)]
- 💄 Better code editor dynamic height [[d43623b](https://github.com/baptisteArno/typebot.io/commit/d43623bf592812b732fe7a7a8c74a9fb69ab2290)]
- ♿ Add data-block-name prop [[023a6f2](https://github.com/baptisteArno/typebot.io/commit/023a6f274a8b8e07e33fe3cec864e923b48e11ec)]
- ♿ Improve block focus [[261cd9a](https://github.com/baptisteArno/typebot.io/commit/261cd9a5c7d239e3317d2ffbde29ff218b2ff25c)]
- ♿ Improve format feedback [[90e837e](https://github.com/baptisteArno/typebot.io/commit/90e837e7c2eccac387dcd29b50bbfdfcfc070aa4)]
- ⚡ Await for async code block [[d756dff](https://github.com/baptisteArno/typebot.io/commit/d756dff99ef1c6d3a9ded1934d9d11e3023ec83b)]
- ♿ Add &#x27;Current&#x27; to Link typebot [[fb60dcf](https://github.com/baptisteArno/typebot.io/commit/fb60dcf5ff4486953b0d652c6463179ac3cc5ff6)]
- 🚸 More predictable edge management [[c507ef5](https://github.com/baptisteArno/typebot.io/commit/c507ef55ae4b1cc30efb4ebb9e6fae3b3aba8bf8)]
- ♿ Force viewer sub domain [[f9aba27](https://github.com/baptisteArno/typebot.io/commit/f9aba27aae1e6968cadde40d774433e13fbbdc49)]
- ♿ Improve inputs responsivity [[03aadab](https://github.com/baptisteArno/typebot.io/commit/03aadab4094c0460c85c3c2c29f192e7faf5b04e)]
- 🚸 Add Reply-To field for email sending [[ddb6798](https://github.com/baptisteArno/typebot.io/commit/ddb6798eba8b29e421674ca0b1e1c5cb7b51bf8e)]
- 💄 Remove v2 annoucements [[64bafd1](https://github.com/baptisteArno/typebot.io/commit/64bafd15a1af6a925efd142dc9b31872e7ad3599)]
- 💄 New README illustration [[d8fe530](https://github.com/baptisteArno/typebot.io/commit/d8fe53012dc0a4b1e35aaa33f4e5f46a79daf004)]
- 💄 Small visual fixes [[52b7733](https://github.com/baptisteArno/typebot.io/commit/52b773379e880083be3b32438d290d6ce330b82c)]
- 💄 Add interactive indications [[d0ece4c](https://github.com/baptisteArno/typebot.io/commit/d0ece4cc8fc1320ca91e8540c86e227157af1221)]
- 💄 Change buttons primary color [[76a8bcf](https://github.com/baptisteArno/typebot.io/commit/76a8bcfbaec4d19cc3335d4862dd9586b1daccff)]
- 💄 Add animation on scroll [[37b7ca3](https://github.com/baptisteArno/typebot.io/commit/37b7ca32e99953e6aa61c8277ba7932e878d8d84)]
- 💄 Refont LP for v2 [[21e926a](https://github.com/baptisteArno/typebot.io/commit/21e926a477b55bea0d7cda17fcddfadba7d12afc)]
- 💄 Better README illustration [[aeb0643](https://github.com/baptisteArno/typebot.io/commit/aeb06433af677fefc583cd873ef4c12102414e61)]
- 🚸 Improve equality check [[5228cff](https://github.com/baptisteArno/typebot.io/commit/5228cff4686f9c52e20004dbdee556f38bb181d9)]
- 🚸 Improve input variable behaviour (for loops) [[9123977](https://github.com/baptisteArno/typebot.io/commit/91239779f79431ac76dc886ae08a838ab502e2ec)]
- 🚸 Improve and unify inputs [[2c1f694](https://github.com/baptisteArno/typebot.io/commit/2c1f69439bbfa23ea3c93efaa71d6d7732d06f86)]
- ♿ Improve feedback redirect [[1bcc8ae](https://github.com/baptisteArno/typebot.io/commit/1bcc8aee10556fae44b39587f4ab9171d4b1a8c4)]
- ♿ Add sleekplan paths [[7b66494](https://github.com/baptisteArno/typebot.io/commit/7b6649408c37455551c63562cff016647fca3a5b)]
- ♿ Add SSO signin for Sleekplan [[57663fd](https://github.com/baptisteArno/typebot.io/commit/57663fd05c5ffe84afc117f41d1429902ee77674)]
- 🚸 Return empty string if evaluated JS is not defined [[0710403](https://github.com/baptisteArno/typebot.io/commit/07104038c4332162920cc39b0e1a6eb25db8c12b)]
- 🚸 Easy webhook config [[fd9c19a](https://github.com/baptisteArno/typebot.io/commit/fd9c19a4c29061ee9b0bb1464b54d51c3da7d5e6)]
- ♿ Improve feedback on GSheets errors [[d13ca0f](https://github.com/baptisteArno/typebot.io/commit/d13ca0fa9ac8bc2d7605f1adcf68fd15c7b7c964)]
- 💄 Don&#x27;t show avatar when only input [[9b8f153](https://github.com/baptisteArno/typebot.io/commit/9b8f153579cac287a0132144dcbe88fd233151fb)]
- ♿ Disable edge delete [[31f86d8](https://github.com/baptisteArno/typebot.io/commit/31f86d8ef454f1044d5512d88988399020afd32b)]
- ⚡ Better save management [[507fe4f](https://github.com/baptisteArno/typebot.io/commit/507fe4fa06476ce06d7f8500fa7280e4f6c74eb1)]
- 🚸 Always evaluate Set variable [[a5a1fef](https://github.com/baptisteArno/typebot.io/commit/a5a1fef597576339643736742109e28726ff052a)]
- ⚡ Smooth panning even with complexe flow [[e9a9dc0](https://github.com/baptisteArno/typebot.io/commit/e9a9dc00e2ac1ea0a3a8b8071b5c9b5b3b526a27)]
- ♿ Add modal that asks for checking Google checkboxes [[5a06bb0](https://github.com/baptisteArno/typebot.io/commit/5a06bb0500434a8d59612ef6451b5581b95a0034)]
- ♿ Display &quot;Log not found&quot; [[8029775](https://github.com/baptisteArno/typebot.io/commit/8029775660c3db2dd48fa410f6b87e2bf3adb8c5)]
- ♿ Better Gsheets dropdowns [[205c347](https://github.com/baptisteArno/typebot.io/commit/205c3477205ef6731d98121b6db34fa55eca76a8)]
- ♿ Better item sample parsing [[dc51010](https://github.com/baptisteArno/typebot.io/commit/dc510100e509db21e2f000ddc220d6d076f2b735)]
- ♿ Hide steps sidebar scrollbar [[0df719d](https://github.com/baptisteArno/typebot.io/commit/0df719d5315fedecd5e783aeb5765aa53c5dc9aa)]
- ♿ Typebot header back to folder if exists [[cb51e6b](https://github.com/baptisteArno/typebot.io/commit/cb51e6bd200a8c6d0553592e7c4ed87530c1d7a7)]
- ♿ Smarter website input [[c5b378d](https://github.com/baptisteArno/typebot.io/commit/c5b378dfad0288705a24f080ed87e63d3b75f6ab)]
- 💄 Add user avatar in support bubble [[b0d7be4](https://github.com/baptisteArno/typebot.io/commit/b0d7be4471686448a4eeb555c166b32817d40a95)]
- ♿ Overflow clip [[74b3464](https://github.com/baptisteArno/typebot.io/commit/74b34644745114d5ef26d24726e9d09d929563b4)]
- ♿ Better autoSave handler [[8171edb](https://github.com/baptisteArno/typebot.io/commit/8171edb290f17dae42925b07390d277208504a58)]
- 💄 Item node overflow when long word [[2a6a474](https://github.com/baptisteArno/typebot.io/commit/2a6a47409213615a6c7ed493c0d3ef22f19a652c)]
- 💄 Change social logins buttons [[c5972ec](https://github.com/baptisteArno/typebot.io/commit/c5972ec91b30aec55027eb8dbd4b358ff88397d9)]
- 💄 Make steps side bar scrollable [[f7d6f0b](https://github.com/baptisteArno/typebot.io/commit/f7d6f0b766e9b503e718062323b043a35ffa33cf)]
- 💄 Social login colored logos [[00c3588](https://github.com/baptisteArno/typebot.io/commit/00c35886a4473fea7868fd92c720f2f08e2d91ae)]
- ♿ Improve code editor readiness [[daaa8a0](https://github.com/baptisteArno/typebot.io/commit/daaa8a0a2d344d5850c38f936f4450e308ca62e1)]
- ♿ Save both bots when updating name or publicId [[2eee226](https://github.com/baptisteArno/typebot.io/commit/2eee226a88ffa8e7fc5adf7af8cfb53bda651015)]
- ⚡ Improve graph transition perf [[714f7c8](https://github.com/baptisteArno/typebot.io/commit/714f7c8ce505f4bae901e55e5ae81dadfecbd373)]
- ⚡ Add docs and connect Stripe [[56bd5fa](https://github.com/baptisteArno/typebot.io/commit/56bd5fafc38f1a50053d43e9b7bc5ffd5a26a6bb)]
- ⚡ Add msw and mock authentication [[b1f54b7](https://github.com/baptisteArno/typebot.io/commit/b1f54b77c687f03d95830e044d559cfab396154c)]
- ⚡ Migrate to Playwright [[73f277f](https://github.com/baptisteArno/typebot.io/commit/73f277fce7078f70e89702f2aa30daa8b3a7a218)]
- 💄 Face lift [[44b4785](https://github.com/baptisteArno/typebot.io/commit/44b478550f73171caa899d27c732e6ca22afb0f3)]

### Fixed

- 🐛 Webhook duplication [[7507a1a](https://github.com/baptisteArno/typebot.io/commit/7507a1ab1e1ff9d0c7d9633e49068e7809e65e2e)]
- 🐛 Airtable real-time [[936dde2](https://github.com/baptisteArno/typebot.io/commit/936dde2195708eb19bcf4d6e02f3eb6299c16c11)]
- 🐛 Throttle incoming typebot to avoid overwrite bug [[6af47f0](https://github.com/baptisteArno/typebot.io/commit/6af47f0277b52f22bfa1ccbf24314b1ff3c6fbbc)]
- 🐛 Algolia contextual search [[22e4873](https://github.com/baptisteArno/typebot.io/commit/22e4873c115ea61cd1bd3b642cbaadfd7d3008e0)]
- 🐛 Misc [[092f16d](https://github.com/baptisteArno/typebot.io/commit/092f16d3c1df469f31fb451055734dbb64dd2269)]
- 🐛 Remove missing creds GFont error [[c4cf793](https://github.com/baptisteArno/typebot.io/commit/c4cf793b5da487eef7348103f8a0c6de1355ed7e)]
- 🐛 Bubble not displaying with proactive message [[ad3a140](https://github.com/baptisteArno/typebot.io/commit/ad3a140982ee890e206b6f7bc6b44fe0b42cc03f)]
- 🐛 Make custom domain fetching more predictable [[8fdfda6](https://github.com/baptisteArno/typebot.io/commit/8fdfda64829d301c6cf8e8ba8c001f38071cc37a)]
- 🐛 Delete domain when Vercel doesn&#x27;t have it [[28710dd](https://github.com/baptisteArno/typebot.io/commit/28710dddc72f09731d8eddfa1c38aff62d5ee123)]
- 🐛 Embed bubble variable [[4d98de2](https://github.com/baptisteArno/typebot.io/commit/4d98de2c7014e3c9d8e22b1050ccd0cd36753ebe)]
- 🐛 add missing account attributes [[b28fb06](https://github.com/baptisteArno/typebot.io/commit/b28fb063293ed4e698daf8a15b72b094cb9519f8)]
- 🐛 Avoid variables duplication [[b175974](https://github.com/baptisteArno/typebot.io/commit/b1759749e47536e926fa74e6d2eee5b7ee829989)]
- 🐛 Nested typebots webhhok exec [[9fbe1cc](https://github.com/baptisteArno/typebot.io/commit/9fbe1cc34c94fae08b813ba6b46e5af70a3aa5a7)]
- 🐛 webhookId in non webhook step [[240cbee](https://github.com/baptisteArno/typebot.io/commit/240cbeed626c2cac9e6df6f7cd59caa6e580e0d1)]
- 🐛 Exporting many results [[281fddc](https://github.com/baptisteArno/typebot.io/commit/281fddc8efa39f3ca8a29583689ef264c7cc41dc)]
- 🐛 Export all for free users [[df3e926](https://github.com/baptisteArno/typebot.io/commit/df3e92685e698ba7816ff2b4726e3506379b2421)]
- 💚 Database default URL [[a49d1ca](https://github.com/baptisteArno/typebot.io/commit/a49d1cac0368fbe774042aeaad6c87f445de3c89)]
- 🐛 Fix multiple cc bcc email [[7b8169c](https://github.com/baptisteArno/typebot.io/commit/7b8169c9ae9defda56396087522ec934d6412f57)]
- 🐛 Typebot import with items [[cd879ee](https://github.com/baptisteArno/typebot.io/commit/cd879eee5fafdfb2f3790b1cb75dae5abca8fef3)]
- 🐛 Linked typebot webhook [[8981a57](https://github.com/baptisteArno/typebot.io/commit/8981a572ed3b713e407a0c2a3314b10d4dd91d1d)]
- 🐛 Result creation fail [[82446c4](https://github.com/baptisteArno/typebot.io/commit/82446c41af903e450469084267647b5837a26cee)]
- 🐛 Graph navigation [[0c23f2d](https://github.com/baptisteArno/typebot.io/commit/0c23f2dbcdc774d2745554b994b0e009ac67dc9b)]
- 🐛 Graceful fail if typebot not found [[fffcb06](https://github.com/baptisteArno/typebot.io/commit/fffcb060ac6f4d3166965d51c982bd466071e884)]
- 🐛 Template modal scroll [[e941ce1](https://github.com/baptisteArno/typebot.io/commit/e941ce1e13bdcb5c980a35a9340600fb8524070b)]
- 🐛 Fix item list delete [[c5ffd8c](https://github.com/baptisteArno/typebot.io/commit/c5ffd8cb7444768da4eea727ab87c62eafb67d1e)]
- 🐛 Safari context menu trap [[144ffae](https://github.com/baptisteArno/typebot.io/commit/144ffaeb031603dc8bd6ddfb70146e870fedf686)]
- 🐛 Delete collaborator [[c5919a7](https://github.com/baptisteArno/typebot.io/commit/c5919a766f9f991c4c9349051fc39155af23eff6)]
- 🐛 undefined when copying custom domain [[6e90ad1](https://github.com/baptisteArno/typebot.io/commit/6e90ad1b70bfaa80f8d7861d68dcbbc5bb88bdb0)]
- 🐛 jump to login for no reason [[25961d3](https://github.com/baptisteArno/typebot.io/commit/25961d32fcc629bd1e9920d5d926b0d8d0a73645)]
- 🐛 Fix variables parsing [[e9c3ec1](https://github.com/baptisteArno/typebot.io/commit/e9c3ec1e4658c1f9f9dbe1433dd433c8b4360ed4)]
- 🐛 Docker build &#x27;qs&#x27; missing [[366f93f](https://github.com/baptisteArno/typebot.io/commit/366f93fd50c0c345170d925f000a9b1f22a05fff)]
- 🚑 Preview panel not showing [[8f36516](https://github.com/baptisteArno/typebot.io/commit/8f36516e4b9acc749051243948f7fd56529a3c5d)]
- 🐛 UpgradeModal ending with a dot [[1fb4328](https://github.com/baptisteArno/typebot.io/commit/1fb4328938de58abfbab5fa39484135b586ad5c3)]
- 🐛 Wrap webhook evalution in try catch [[eb5a5d9](https://github.com/baptisteArno/typebot.io/commit/eb5a5d9a15731f911516df52f49788578f236e5a)]
- 🐛 Command typo [[ceedb05](https://github.com/baptisteArno/typebot.io/commit/ceedb05b64b21b5f6358c705a835974036b5c500)]
- 🐛 Overflow issue on Safari [[56f1d5f](https://github.com/baptisteArno/typebot.io/commit/56f1d5fbbf636a0ae4c8a75a3d47b18fee9df7ab)]
- 💚 Improve linked typebot test robustness [[f6b5189](https://github.com/baptisteArno/typebot.io/commit/f6b518989c8eabd444c295942161074c5ac690fb)]
- 🐛 Current id bug when linking to current bot [[da95cbd](https://github.com/baptisteArno/typebot.io/commit/da95cbd355a5fb0d0cd08fb67ade6d5377f025e5)]
- 🐛 FIx rewrite pages [[0822703](https://github.com/baptisteArno/typebot.io/commit/082270370b5b3d546c76677f4e004567a4871619)]
- 🐛 Auto open chat bubble [[a4d4576](https://github.com/baptisteArno/typebot.io/commit/a4d4576e48b2cc7ba3539be421220b19f79854d2)]
- 🚑 Webhook return func [[3585e63](https://github.com/baptisteArno/typebot.io/commit/3585e63c48b67f7447720281dd94819a6cacae99)]
- 🚑 Webhook in viewer [[22a36e6](https://github.com/baptisteArno/typebot.io/commit/22a36e6de7aab896fec1aadd3b75e50b0d4ac311)]
- 🐛 Webhook call on linked typebot [[86117d6](https://github.com/baptisteArno/typebot.io/commit/86117d6d3c9852551c529826c46999a5a24f8c80)]
- 🐛 misc [[c7d5373](https://github.com/baptisteArno/typebot.io/commit/c7d53731273b259656cdcd675171217f8cf8f989)]
- 🐛 useLogs returns nothing [[2461dd8](https://github.com/baptisteArno/typebot.io/commit/2461dd89be4b517d4584042e7a03c7ee1644efc4)]
- 🐛 Attempt to fix prerender error [[21311a6](https://github.com/baptisteArno/typebot.io/commit/21311a6eca511bd8d435ff8d600bc974a6afbc4d)]
- 🐛 Attempt to fix auto zoom on Android [[8d6330f](https://github.com/baptisteArno/typebot.io/commit/8d6330f6fd0a6fedc2d0263801f22c20007f0461)]
- 🐛 Phone input overflow on mobile [[236c63d](https://github.com/baptisteArno/typebot.io/commit/236c63d7db31fa9792b09025ef94c9b6522c1f5a)]
- 🐛 Fix the whole docker deployment pipeline [[1f992c6](https://github.com/baptisteArno/typebot.io/commit/1f992c6779258f51023d9aac6d4a744d06aa58e8)]
- 🐛 Fix edge on item offset top on drop [[c64afb7](https://github.com/baptisteArno/typebot.io/commit/c64afb7073267b1c2853aada92d7c9b4cd43586a)]
- 🚑 DB migration [[43fa411](https://github.com/baptisteArno/typebot.io/commit/43fa411320ab711b9f4057eb9eef93387585e8f5)]
- 🐛 Save variables from webhooks in results [[60dcd5c](https://github.com/baptisteArno/typebot.io/commit/60dcd5c246337203c523f23d0b41a284b9ec6eeb)]
- 🐛 Undo with item change [[cd6c5c0](https://github.com/baptisteArno/typebot.io/commit/cd6c5c04c5436f893d9291e10190bdc249ca7da8)]
- 🐛 Step undefined items duplicate [[f869ca3](https://github.com/baptisteArno/typebot.io/commit/f869ca377a2e002eaa4bbdf2c8e1bcae9c6c9501)]
- 🐛 When URL is empty [[84dda32](https://github.com/baptisteArno/typebot.io/commit/84dda32b13be7404d637266dc74d4059c8f38d59)]
- 🐛 Make sure to build typebot-js on prepare [[194a5fb](https://github.com/baptisteArno/typebot.io/commit/194a5fbae161665f5632a94307aa8d0b3b2138b9)]
- 🐛 docker build [[f22fbc9](https://github.com/baptisteArno/typebot.io/commit/f22fbc9ade26560e4da8070525b4962be9d7c328)]
- 🐛 Duplicate steps with items [[d06cbea](https://github.com/baptisteArno/typebot.io/commit/d06cbeac7325a591b55f160f2fc54413b2c4957c)]
- 🐛 Debounce value on popover close [[f3c5f6b](https://github.com/baptisteArno/typebot.io/commit/f3c5f6bea2154bf820b70693edc91989c9f0beef)]
- 🐛 Better result initialization [[de78482](https://github.com/baptisteArno/typebot.io/commit/de784820ebcbaa87066efb1424137b3ad3515741)]
- 🐛 Encode hidden variables properly [[2ae326c](https://github.com/baptisteArno/typebot.io/commit/2ae326c102a14c2eeeee6f6e8aac1186a72d3c1c)]
- 🐛 Support bubble closes on save [[9fe85cd](https://github.com/baptisteArno/typebot.io/commit/9fe85cd9133f99becef4e32b8354375c66364d0a)]
- 🐛 Minor changes and improved accessibility [[b784e89](https://github.com/baptisteArno/typebot.io/commit/b784e8918e3191a034835af69acf71975aadd3af)]
- 🐛 PDF embed viewer [[bcff2e0](https://github.com/baptisteArno/typebot.io/commit/bcff2e0c1466350b170b25f987b00f08f81e1aba)]
- 🚑 Step id duplication [[b8019f3](https://github.com/baptisteArno/typebot.io/commit/b8019f3732779cc57e8c89a74a04221c775cc3b3)]
- 🚑 Viewer host [[e502413](https://github.com/baptisteArno/typebot.io/commit/e502413ecf79ae8ed31000431f67f8be923fb18d)]
- 🐛 Sample result w/ loops [[11101a4](https://github.com/baptisteArno/typebot.io/commit/11101a4600c885c93e057a78c5b584c25e0faa7d)]
- 🐛 Sample result w/ multi input blocks [[7399140](https://github.com/baptisteArno/typebot.io/commit/7399140e498c1d23cec6ad43738c39f5f0734b0a)]
- 🐛 Shortcode default URL [[5d3010d](https://github.com/baptisteArno/typebot.io/commit/5d3010d280d4e254d3af4cd324b2edfbec8e40e0)]
- 🐛 subscribeWebhook upsert [[cfbea6b](https://github.com/baptisteArno/typebot.io/commit/cfbea6bbbaf3e338d40ea1e3b30f0d616fa69ff6)]
- 🐛 Result parsing csv [[c437211](https://github.com/baptisteArno/typebot.io/commit/c4372113272243eef2c6a8eba3515b7dc9344db9)]
- 🐛 Parse variables for code step [[fb3d2bc](https://github.com/baptisteArno/typebot.io/commit/fb3d2bc9e6cf989f6b68325869a78441a34f00c5)]
- 🐛 Fix inconsistent webhook saving [[eef60fd](https://github.com/baptisteArno/typebot.io/commit/eef60fdf691f5b07b882286012acdf31706367f2)]
- 🚑 Custom domain lookup [[666f0c3](https://github.com/baptisteArno/typebot.io/commit/666f0c36bf02c6d7d442cb6a2b5414651399a453)]
- 🐛 Fix date picker UI on iOS [[8954730](https://github.com/baptisteArno/typebot.io/commit/89547305089d2936414f55791f30e9684db3f780)]
- 💚 Fix docker-compose builder entrypoint [[e4a3722](https://github.com/baptisteArno/typebot.io/commit/e4a3722c14ceb32b4eea459346da1c70e35cc522)]
- 🐛 Fix block title select on Chrome and Safari [[80679df](https://github.com/baptisteArno/typebot.io/commit/80679dfbd09ec9b28f76dc1d4b5fc3d095d86499)]
- 🐛 Duplicate webhook id [[1dbbc9a](https://github.com/baptisteArno/typebot.io/commit/1dbbc9a2517095ef0aacf7da30efbb5d93653be4)]
- 🐛 FIx Webhook settings debounce [[31298e3](https://github.com/baptisteArno/typebot.io/commit/31298e39c18342be87778d655ef8f78dcd78ac7e)]
- 🐛 Link to public bot CORS [[9427b2a](https://github.com/baptisteArno/typebot.io/commit/9427b2a823805ebbc30a481d84b0804aa9433fce)]
- 🐛 Attempt to fix auth issue behind proxy [[30fe7b3](https://github.com/baptisteArno/typebot.io/commit/30fe7b3db0baa9bc23c338265ca60b3095d791f0)]
- 🐛 Variables button in text editor [[36838f0](https://github.com/baptisteArno/typebot.io/commit/36838f05d3312b85271e32e74d933dcec1466139)]
- 🐛 Display results for blocks w/ multiple inputs [[4767cdc](https://github.com/baptisteArno/typebot.io/commit/4767cdc5421acd7c6c555c8f5c4134fa383b4b01)]
- 💚 Potentially fix turborepo cache [[7f82604](https://github.com/baptisteArno/typebot.io/commit/7f826047403818ceee76229c8b727feaa568a06c)]
- 🐛 Shared typebot case sensitivity [[b2784f1](https://github.com/baptisteArno/typebot.io/commit/b2784f19fd9fe60bcc24dc09fd42a0148fc5112f)]
- 🐛 Force display block on lite badge [[4c65b4c](https://github.com/baptisteArno/typebot.io/commit/4c65b4ce30f45f943fbc79a1549c93e0ef79739b)]
- 🐛 Avatar display on mobile [[ed9d791](https://github.com/baptisteArno/typebot.io/commit/ed9d791aacb35b2eb4adac08145a5c5830a9f394)]
- 🐛 Attempt to fix Google Sheets refresh [[c7d31be](https://github.com/baptisteArno/typebot.io/commit/c7d31bebf83b932d0f3326ee5614df8c90a6a6b3)]
- 🐛 Attempt to fix loading issue in iframe safari [[93639c1](https://github.com/baptisteArno/typebot.io/commit/93639c1fc6c932d8e1fe8b58b72809664605b532)]
- 🐛 Chat chunk management [[4714e80](https://github.com/baptisteArno/typebot.io/commit/4714e8046a16ce85ea398c55643e29ada06360e9)]
- 🐛 Fix subscribe webhook method [[831150e](https://github.com/baptisteArno/typebot.io/commit/831150e0404bca591a16f28680ea5d004dad5d30)]
- 🐛 Get data when extracting 1 column [[1bf3baf](https://github.com/baptisteArno/typebot.io/commit/1bf3bafb60dd84ab5c786d138e3f1ca4b842e8ad)]
- 🚑 Fix multiple avatars [[6ea23ef](https://github.com/baptisteArno/typebot.io/commit/6ea23ef63eb6c8d6870bea018e069581f821569d)]
- 🐛 outgoingEdgeId remaining when moving step [[6b34f76](https://github.com/baptisteArno/typebot.io/commit/6b34f7660471e29e25805ebe7c30b2aa27e425ba)]
- 🐛 Standalone &#x27;?&#x27; when no query params [[d6c3e8d](https://github.com/baptisteArno/typebot.io/commit/d6c3e8d41afb10a6c994cb9f6c6d9e32e9f26842)]
- 🐛 Drag single step from block [[ae347ee](https://github.com/baptisteArno/typebot.io/commit/ae347eeb53702074819ce13ba84e47ad6cd77a4a)]
- 🐛 Export header valid name [[71b2b84](https://github.com/baptisteArno/typebot.io/commit/71b2b84cdf609da9ac391526c7fb43965a2ac111)]
- 🐛 subscribe unsub zapier [[4630512](https://github.com/baptisteArno/typebot.io/commit/4630512b8ba8f4dfed23754d6f17ae398c9d8bdf)]
- 🐛 Fix duplication when customDomain is set [[33497b8](https://github.com/baptisteArno/typebot.io/commit/33497b876620ad51b9b844065f943b25f13c7ea7)]
- 🐛 Fix basic auth header without &#x27;:&#x27; [[8552cc2](https://github.com/baptisteArno/typebot.io/commit/8552cc237bc65b158f4533b51817b05cced42af1)]
- 🐛 Tiny bugs (Sentry) [[9e08ff5](https://github.com/baptisteArno/typebot.io/commit/9e08ff574b76399df4c058f56e2412a08d8f739c)]
- 🐛 Properly handle variable avatars [[d21b172](https://github.com/baptisteArno/typebot.io/commit/d21b1722b51f551b15d75404e2df9119f5658dc3)]
- 🐛 Start block was deletable [[8533bb9](https://github.com/baptisteArno/typebot.io/commit/8533bb92a856917c98c3db15e028f955111b7c14)]
- 🚑 Don&#x27;t allow user without id [[7e7596d](https://github.com/baptisteArno/typebot.io/commit/7e7596d75e548ec21d2e98b2d2417c4046a1ed4a)]
- 🐛 Equal condition number vs string [[dd671a5](https://github.com/baptisteArno/typebot.io/commit/dd671a5d2c570558d5ad2d2a40561d774a384152)]
- 🚑 Duplicate typebot [[aca7d68](https://github.com/baptisteArno/typebot.io/commit/aca7d68360c8129e3f9212d899f147c649dc4b3d)]
- 🐛 Typing emulation on arabic chars [[b6618ba](https://github.com/baptisteArno/typebot.io/commit/b6618ba16557af2bf666e35f4579660c2f9fcad9)]
- 🐛 Smash tiny bugs [[1dc2264](https://github.com/baptisteArno/typebot.io/commit/1dc2264bdfefd1331076fa9681b4042280e4981b)]
- 🚑 Webhook and instant updates [[d49461c](https://github.com/baptisteArno/typebot.io/commit/d49461cde68cc5dfd52d2fe900c4f60e1de61fe3)]
- 🐛 Parse condition value variable [[65c206e](https://github.com/baptisteArno/typebot.io/commit/65c206e00ab87935fdd8ce278c7f674cf7a6bd74)]
- 🐛 Custom metadata in viewer [[6ec8d06](https://github.com/baptisteArno/typebot.io/commit/6ec8d06b97d3dc37015ec05aabe2ab0723578ad0)]
- 🐛 Edge not properly connecting to step target [[7a4b96f](https://github.com/baptisteArno/typebot.io/commit/7a4b96ff7e04471e560f95f42aab37b74d0afd90)]
- 🐛 Settings modal moving block [[3456e5a](https://github.com/baptisteArno/typebot.io/commit/3456e5af82ad16bb9fd2fab05494745c9d2f2af7)]
- 🐛 Typebot support bubble hidden vars [[341cd15](https://github.com/baptisteArno/typebot.io/commit/341cd15e0bd9e963c9e79f683700b52d7456706b)]
- 🐛 Custom path on domain [[291b4b3](https://github.com/baptisteArno/typebot.io/commit/291b4b31597293891d84fa6aa2b5f5bad8e2ffd4)]
- 💚 Use MIGRATION_DATABASE_URL [[a58c400](https://github.com/baptisteArno/typebot.io/commit/a58c400a7df36f20b1e596d0c58f726852c7f492)]
- 🐛 Collect prefilled variables in db [[aaf78e8](https://github.com/baptisteArno/typebot.io/commit/aaf78e8a54e8e606e909d0181cac241638259816)]
- 🐛 Frame load on Safari [[4b26ab3](https://github.com/baptisteArno/typebot.io/commit/4b26ab331d83ef59682b7144fdfc93aaddcd0283)]
- 🐛 No request if not published [[0bb50f9](https://github.com/baptisteArno/typebot.io/commit/0bb50f9e78a4c70c46ffc7688094e13c9d368403)]
- 🐛 Publish button sync [[adf99ac](https://github.com/baptisteArno/typebot.io/commit/adf99ac30c7a095cf85e6cf5e10f3756306a789d)]
- 🐛 Delete edge when adding last step [[67ccf07](https://github.com/baptisteArno/typebot.io/commit/67ccf07a610461f2c512af80d737990bbd9c3080)]
- 🐛 quick fixes [[b95d907](https://github.com/baptisteArno/typebot.io/commit/b95d907e8f5a1a12178f436788db932b0e848072)]
- 🐛 Duplicate typebot [[ea80fd6](https://github.com/baptisteArno/typebot.io/commit/ea80fd6d3ec3e31c99b3cfb2f1d94f45c1c4b749)]
- 💚 Incomplete results [[e6f6e25](https://github.com/baptisteArno/typebot.io/commit/e6f6e2523c13d5bce7d30900e22bab21778677d8)]
- 🐛 Import from file button [[5a060c7](https://github.com/baptisteArno/typebot.io/commit/5a060c7f7e65c456d5bb7394d352ef929c0fd33c)]
- 🐛 Fix email step in viewer [[d19b26e](https://github.com/baptisteArno/typebot.io/commit/d19b26e7dee0dfd6b6110ef4e8f517ef47c2be6b)]
- 🐛 Analytics board [[7c164e2](https://github.com/baptisteArno/typebot.io/commit/7c164e25d733266b154a32d8c60cf289a410fccb)]
- 🐛 Loading rows [[93fed89](https://github.com/baptisteArno/typebot.io/commit/93fed893c05f023a6e04b816f5bff9c7e065864f)]
- 💚 Attempt to fix LP rewrites [[19f4fdb](https://github.com/baptisteArno/typebot.io/commit/19f4fdb83a4db45d4e940db247793587bf37eb63)]
- 🐛 Fix scrolling behavior and avatar position [[f4336b8](https://github.com/baptisteArno/typebot.io/commit/f4336b83cc5de98f81ec8e4a02c7f68a10d013f6)]
- 🐛 Fix save button [[66f3e7e](https://github.com/baptisteArno/typebot.io/commit/66f3e7ee7cf1a4ba0d4ca1c55f4692d650fb8d44)]
- 💚 Fix tests [[ab34f95](https://github.com/baptisteArno/typebot.io/commit/ab34f95cce53499d41ecddf8fb289ac85691ec7a)]
- 💚 Fix e2e window reload bug [[8391bcc](https://github.com/baptisteArno/typebot.io/commit/8391bcce5e071605f217f424aa65985242794571)]
- 🐛 Step node drag [[6fe27bd](https://github.com/baptisteArno/typebot.io/commit/6fe27bd8eac9d7d43ec1139e3d3893264e2bb41a)]
- 🐛 Production bug [[eea522f](https://github.com/baptisteArno/typebot.io/commit/eea522f5bd972a09aa5e251d267e901af756e517)]

### Content

- 📝 Fix links and update doc [[ddaaa68](https://github.com/baptisteArno/typebot.io/commit/ddaaa68e282f1f702c8ddd10fda4a3b9412279b4)]
- 📝 Webhook block [[2271da8](https://github.com/baptisteArno/typebot.io/commit/2271da8870448a2e2128ed696abaf792ab7c1939)]
- 📝 Theme [[a848fa0](https://github.com/baptisteArno/typebot.io/commit/a848fa0a15da679b1384a1177174435d2004f0ff)]
- 📝 Email block [[f5404f9](https://github.com/baptisteArno/typebot.io/commit/f5404f96d5af656078ec3772fef0ea2873994247)]
- 📝 Typing emulation [[bf766e5](https://github.com/baptisteArno/typebot.io/commit/bf766e5cd90ea46e6875bbd3b5a239f2d3a13c20)]
- 📝 add gitlab idp env variables [[b2b0685](https://github.com/baptisteArno/typebot.io/commit/b2b0685298d5417475b21885d5b198a3a9a306bb)]
- 📝 Add callback URL instructions [[e569e59](https://github.com/baptisteArno/typebot.io/commit/e569e59699dd8b4e102f2d193f54771b112116e2)]
- 📝 Simplified API endpoints [[29254f6](https://github.com/baptisteArno/typebot.io/commit/29254f675c6d0c1364ee3d22762e32140dd3fff3)]
- 📝 Improve configuration doc [[18319c8](https://github.com/baptisteArno/typebot.io/commit/18319c88c8b46db30e93c0d40da00c71e0401675)]
- 📝 Add about page [[6a8d6d4](https://github.com/baptisteArno/typebot.io/commit/6a8d6d4d9a7e88a0352b3707fa1422e35c06a6db)]
- 📝 Better explain base url config [[a5491dc](https://github.com/baptisteArno/typebot.io/commit/a5491dc7a87f51f2cff6b35c5d217c63a06fd87d)]
- 📝 Add Lead Scoring template [[a08618d](https://github.com/baptisteArno/typebot.io/commit/a08618d24ebace50c4cd7a450c9dfb7e0796da86)]
- 📝 Condition block [[b1d30fc](https://github.com/baptisteArno/typebot.io/commit/b1d30fcb3bd965ab0ca293669fef058f9048708e)]
- 📝 Add Quizz [[5aac822](https://github.com/baptisteArno/typebot.io/commit/5aac8229d2b888348dd7b88948076cd3ce944da2)]
- 📝 Add privacy policies explanation [[e653ced](https://github.com/baptisteArno/typebot.io/commit/e653cedee92442feb7f6bfa3f4c8fb5223e00871)]
- 📝 Add &quot;Set variable&quot; doc [[af9e08f](https://github.com/baptisteArno/typebot.io/commit/af9e08fea0a76149d01b4124f6b4705d65740433)]
- 📝 Add &#x60;hiddenVariables&#x60; JS instructions [[38c39d4](https://github.com/baptisteArno/typebot.io/commit/38c39d4a3130de6b775ae0b48156337c0c0a30a9)]
- 📝 Add License paragraph in README [[3a7078d](https://github.com/baptisteArno/typebot.io/commit/3a7078d0d05338020f34e1a2fb5d4a16d6927ef9)]
- 📝 Add &quot;Stay up-to-date&quot; section in README [[bd702f2](https://github.com/baptisteArno/typebot.io/commit/bd702f2ebab8f4168e32de4e3ddc4b038d20a9b9)]
- 📝 Add 3rd testimonial [[d4022c6](https://github.com/baptisteArno/typebot.io/commit/d4022c6e3fb5aca1da3e1f8d8bf59a37bfe459eb)]
- 📝 Update typebot URL in embed instructions [[71816f7](https://github.com/baptisteArno/typebot.io/commit/71816f76ad54c1f264072abe4492264b722d9f07)]
- 📝 Fix A record CM name [[53fb34d](https://github.com/baptisteArno/typebot.io/commit/53fb34d2adda98cf99ec4c3097af05fd04d5f658)]
- 📝 Add &quot;Human takeover&quot; faq [[3d4f90d](https://github.com/baptisteArno/typebot.io/commit/3d4f90de16b763e723c5ae8ab720c6a32b4153ef)]
- 📝 Change SEO related info [[8ba231f](https://github.com/baptisteArno/typebot.io/commit/8ba231f39305c4647bc8f236859151cbba7740b7)]
- 📝 Update env var and write Configuration doc [[69248f9](https://github.com/baptisteArno/typebot.io/commit/69248f94d49e8361d22dd6473a247f94a74d033b)]
- 📝 Update README and contribution instructions [[b37db3c](https://github.com/baptisteArno/typebot.io/commit/b37db3cee3f62eba6a2bd5085e08e87da82ad4b4)]
- 📝 Add Google Sheets video [[6cf89d8](https://github.com/baptisteArno/typebot.io/commit/6cf89d8d9c468faa562935d51f6c2350757357e3)]
- 📝 Add RTL guide [[533fdb1](https://github.com/baptisteArno/typebot.io/commit/533fdb1b3a293f75380bfcc583d8b031ce4b5420)]
- 📝 Update feedback board links [[e73fce3](https://github.com/baptisteArno/typebot.io/commit/e73fce3907acb8e4b96b8544d1c9d90219b3e703)]
- 📝 Init cool README (WIP) [[63a90f2](https://github.com/baptisteArno/typebot.io/commit/63a90f2deb3ff35a0fcd3d18c9282b5f56e49921)]
- 📝 Remove the 3 months notice on FAQ [[4bb5a57](https://github.com/baptisteArno/typebot.io/commit/4bb5a57f695168c5ff41fb24b72c747beda90bd1)]
- 📝 Add API overview [[3ecde23](https://github.com/baptisteArno/typebot.io/commit/3ecde23e51a4c6274eabdee44143584830983e3e)]
- 📝 Add MailerLite guide [[37ef56b](https://github.com/baptisteArno/typebot.io/commit/37ef56bfc4ee345c7ecf40575538c8ff20a0afa2)]
- 📝 Default retry message bubble [[feb966d](https://github.com/baptisteArno/typebot.io/commit/feb966d51314c2cbbd775e7bc73930043698fe32)]
- 📝 Variables doc [[9b9e0f6](https://github.com/baptisteArno/typebot.io/commit/9b9e0f6312eacdfe8eca6eb61386fdc167222587)]
- 📝 Add 2.0 annoucement modal [[ab9c55e](https://github.com/baptisteArno/typebot.io/commit/ab9c55e2971893623d51c596c36d0c348b71c056)]
- 📝 Add FAQ [[c502bbb](https://github.com/baptisteArno/typebot.io/commit/c502bbb93bb86936c909f914381f6fc694b6f1a7)]
- 📝 Add code blocks in embed instructions [[276f1c1](https://github.com/baptisteArno/typebot.io/commit/276f1c1e90f7c36d7329d3410e634d0aed73daf1)]
- 📝 Add embed instructions [[65b30bf](https://github.com/baptisteArno/typebot.io/commit/65b30bfc489fdfebc8e8a047383840cf9ff6ea7f)]

### Internal

- 🔒 Enforce Sheets security [[78c4596](https://github.com/baptisteArno/typebot.io/commit/78c4596e9348f872576234a692fcf6b1fd8044e1)]
- 🔒 add checking for required group [[3db753e](https://github.com/baptisteArno/typebot.io/commit/3db753e886955f7f534d0d0af7f18beb96c845c9)]
- 🔒 add gitlab provider [[a4a62f2](https://github.com/baptisteArno/typebot.io/commit/a4a62f23b6595166fb660134a258f6569d7f512e)]
- 🔒 Still investigating sheets creds issue [[606932a](https://github.com/baptisteArno/typebot.io/commit/606932a77e030296d200472fcbb3a48a0ed7b5ff)]
- 🔒 Investigate on why spreadsheets sometimes fail [[bdd7a17](https://github.com/baptisteArno/typebot.io/commit/bdd7a1712eb7995a241ac6771ec03814659f927a)]
- 🔒 Enforce credentials security [[ed68096](https://github.com/baptisteArno/typebot.io/commit/ed680969f9e3acc3404d52952b983cd601a9ec09)]
- 🔒 Better guard spreadsheets GET [[97ba29f](https://github.com/baptisteArno/typebot.io/commit/97ba29f80193dff79abe821c9cfc92f7822aabe5)]
- ♻️ Simplify header [[1fdf7e7](https://github.com/baptisteArno/typebot.io/commit/1fdf7e734b41df8befca1589750277c7eb119962)]
- 🗃️ Add custom domain primary key [[a533552](https://github.com/baptisteArno/typebot.io/commit/a533552b40f2475a673c5603809cefa447beb77b)]
- ♻️ Migrate from short-uuid to cuid lib [[1423c14](https://github.com/baptisteArno/typebot.io/commit/1423c145472f86af6fb78a5e9496da46119fb416)]
- 🔒 Change Google fonts key [[89ac0f8](https://github.com/baptisteArno/typebot.io/commit/89ac0f89cd440fa526cd6db3e746bd3317e378dd)]
- 🏗️ Add docker image and deployment features [[e886d1b](https://github.com/baptisteArno/typebot.io/commit/e886d1b0794f310741b69d982b1cb0a6742f7fc4)]
- ♻️ Migrate to dequal [[5c524a0](https://github.com/baptisteArno/typebot.io/commit/5c524a0432513c4e30eb2760cd25b7dc82661d30)]
- 🏗️ Import typebot-js source [[d134a26](https://github.com/baptisteArno/typebot.io/commit/d134a265cd8a7b667c78dc3f66d3e5d9a5054d7e)]
- 🔒 Add extra user check in api [[ec18912](https://github.com/baptisteArno/typebot.io/commit/ec18912879f48a240288cb0260d4bf46ba6bb6c2)]
- 🏗️ Add minio in local config [[7045c02](https://github.com/baptisteArno/typebot.io/commit/7045c02a15168ddf3a4a89f8fe3cac6765accae3)]
- 🏗️ Add script package [[eb23ad6](https://github.com/baptisteArno/typebot.io/commit/eb23ad61a7bf87e49ea4609fe06c8edf985ee9d6)]
- 🏗️ Add wordpress plugin [[27bff8c](https://github.com/baptisteArno/typebot.io/commit/27bff8c4b775ba770ec453024ca1c71a8ba0f4de)]
- 🚚 Add /typebot-lib/v2 endpoint [[64990fc](https://github.com/baptisteArno/typebot.io/commit/64990fc6074f055b0d1f26fb3918c562502d9907)]
- ♻️ Remove any trace of Cypress [[658202e](https://github.com/baptisteArno/typebot.io/commit/658202eaee425e44a1233ef52ec848ac1a84aa1d)]
- 🗃️ Add createdAt and updatedAt [[a499d85](https://github.com/baptisteArno/typebot.io/commit/a499d85c9804c575863bcd757d0c6ae9dccbb68b)]
- 🔥 Remove save button [[1b900b3](https://github.com/baptisteArno/typebot.io/commit/1b900b3f5d8f4f31bec99ea69080645955f09a75)]
- 🗃️ Add api token [[5a80774](https://github.com/baptisteArno/typebot.io/commit/5a80774ff5467812b995be2b28c38cf3f06d24be)]
- 🔧 Ignore Resize exceeded error in Sentry [[3313bda](https://github.com/baptisteArno/typebot.io/commit/3313bdaa8a0a4931ed87002f651d0a6daa5899b7)]
- 🏗️ Add sentry to viewer [[b339add](https://github.com/baptisteArno/typebot.io/commit/b339add83866f13074c4dd1f2b0d1c4144c7ce9b)]
- 🏗️ Remove frame security headers on LP [[aeb3e4c](https://github.com/baptisteArno/typebot.io/commit/aeb3e4caa7f74675472901da3ce4c30e78f471a8)]
- 🏗️ include sentry.properties [[e2606eb](https://github.com/baptisteArno/typebot.io/commit/e2606ebf1193c5de23439ecb3cbd49604be38bca)]
- 🏗️ Add Sentry to builder [[8501d39](https://github.com/baptisteArno/typebot.io/commit/8501d39234bf312a3dc0fe99cbaa68f795d9c549)]
- ♻️ Better S3 env var format [[9c20ef0](https://github.com/baptisteArno/typebot.io/commit/9c20ef00b931e194526a8194474c8de24f96aa1d)]
- ♻️ Revert tables to arrays [[524ef08](https://github.com/baptisteArno/typebot.io/commit/524ef0812c60a23e3e63a9f2db587a06cb392714)]
- ♻️ Undo / Redo buttons + structure refacto [[8a350ee](https://github.com/baptisteArno/typebot.io/commit/8a350eee6c93abec6bce40351a0b4ef0b854defe)]
- ♻️ Add defaults everywhere (+ settings page)): [[c5aaa32](https://github.com/baptisteArno/typebot.io/commit/c5aaa323d1d5a4d684d51f071284663a864de713)]
- ♻️ Add Edges table in Typebot [[8bbd897](https://github.com/baptisteArno/typebot.io/commit/8bbd8977b2697e616ca38e4880397af85e7440a0)]
- ♻️ Normalize data [[9fa4c7d](https://github.com/baptisteArno/typebot.io/commit/9fa4c7dffa4b7ef6fa67a5205400fd6781664e21)]
- 🔧 Optimize bot-engine [[90d7a73](https://github.com/baptisteArno/typebot.io/commit/90d7a7343ef556ac585049d9082f5247a8156cbb)]

### Miscellaneous

- 📦 Update packages [[6c29865](https://github.com/baptisteArno/typebot.io/commit/6c2986590b79d9a16d4e747f2b89e975eeef5147)]
-  Merge pull request [#35](https://github.com/baptisteArno/typebot.io/issues/35) from baptisteArno/fix/google-font-error [[176cb4e](https://github.com/baptisteArno/typebot.io/commit/176cb4ed552c7a08c38174376cb784a521f20e19)]
-  Merge pull request [#32](https://github.com/baptisteArno/typebot.io/issues/32) from laurin-wolf/10-add-gitlab-idp [[a863a4c](https://github.com/baptisteArno/typebot.io/commit/a863a4cb21a4c987d360cf610d3325b49c71d119)]
- 📦 Update typebot lib declarations [[1139569](https://github.com/baptisteArno/typebot.io/commit/113956929303325d1c810f56996c4d831c8e9464)]
- 🛂 Temporarily disable Make.com [[cff5ec6](https://github.com/baptisteArno/typebot.io/commit/cff5ec67deae7125b9e70ba6d780c0a319781a14)]
-  Merge branch &#x27;main&#x27; of https://github.com/baptisteArno/typebot.io [[f788541](https://github.com/baptisteArno/typebot.io/commit/f7885415d84c97dbec70f42c13fbcae6f12ad333)]
- 🚧 Help to debug evaluated expressions [[e1d7533](https://github.com/baptisteArno/typebot.io/commit/e1d7533384f792e4f7158619ee820ae5a0b1a38a)]
-  fix(auth):🐛explicitly set linkAccount user values , [#10](https://github.com/baptisteArno/typebot.io/issues/10) [[97b14f1](https://github.com/baptisteArno/typebot.io/commit/97b14f19f089c2e68f4d88ffbf8b58f1a1633dd2)]
-  Merge pull request [#24](https://github.com/baptisteArno/typebot.io/issues/24) from baptisteArno/feat/disable-smtp-auth [[1820686](https://github.com/baptisteArno/typebot.io/commit/18206866b8fb59f75822f78ec6d922b2b4b49ca6)]
-  feat(auth): 👷 Disable smtp auth [[c657850](https://github.com/baptisteArno/typebot.io/commit/c6578505a511e46e6d7cb977d313efc6a3c9ce0f)]
-  Merge pull request [#21](https://github.com/baptisteArno/typebot.io/issues/21) from baptisteArno/feat/zoom [[47947a6](https://github.com/baptisteArno/typebot.io/commit/47947a6a142951b9148a1812eaec6434ba39cfbe)]
-  build: 👷 Add Sentry context [[fb3bba8](https://github.com/baptisteArno/typebot.io/commit/fb3bba897f844e9f51dc1158909ac541f91c18c9)]
- 💫 Add name in user creation webhook [[4c9f97b](https://github.com/baptisteArno/typebot.io/commit/4c9f97b25470253da7735060096435b4125fd51a)]
-  Merge pull request [#20](https://github.com/baptisteArno/typebot.io/issues/20) from baptisteArno/fix/delete-collaborator [[6314ce2](https://github.com/baptisteArno/typebot.io/commit/6314ce2f6259dca659cbc08b9a916d5941c0283a)]
-  Merge branch &#x27;main&#x27; of https://github.com/baptisteArno/typebot.io [[6ba6466](https://github.com/baptisteArno/typebot.io/commit/6ba646618d217c7476a89758fba99f13936925df)]
-  Merge pull request [#18](https://github.com/baptisteArno/typebot.io/issues/18) from baptisteArno/fix/docker-prod [[5ce0212](https://github.com/baptisteArno/typebot.io/commit/5ce021247638185e7b857f57d2d80586d85701f7)]
-  Merge pull request [#16](https://github.com/baptisteArno/typebot.io/issues/16) from baptisteArno/fix/uprade-modal-directory-typo [[a6a2fcc](https://github.com/baptisteArno/typebot.io/commit/a6a2fccdb8dd4a752f4372503ba660e73786bbf7)]
-  Merge pull request [#14](https://github.com/baptisteArno/typebot.io/issues/14) from baptisteArno/fix/linked-typebot [[5903120](https://github.com/baptisteArno/typebot.io/commit/59031206aec39ab07542e9d41f1fd3f4b333ec26)]
- 📦 Update packages [[0500981](https://github.com/baptisteArno/typebot.io/commit/05009814d4afcaebc57d0e1fea22c926efb808a2)]
- 🛂 Make sure booleans are parsed in table [[f7d12dc](https://github.com/baptisteArno/typebot.io/commit/f7d12dc9954ff9c984fbd11f28eb91bc1e9a8125)]
- 🛂 Improve collab permissions [[bb194b1](https://github.com/baptisteArno/typebot.io/commit/bb194b1dbbcf6b8bfc4af64e124d98e3531e8566)]
-  build(self-host): 👷 Add chown Dockerfile [[f9a30bc](https://github.com/baptisteArno/typebot.io/commit/f9a30bc4ca9228b10bc08773e724e8d092213443)]
- 🛂 Make sure branding is forced on file import [[0704213](https://github.com/baptisteArno/typebot.io/commit/07042137fb79ada80b57b1873cdfefd14373ab8d)]
- 🩹 Fix build [[ec8a27e](https://github.com/baptisteArno/typebot.io/commit/ec8a27e972f5d72841d38967e84ddaf0b3584663)]
-  build: 👷 Add Plan in support bubble [[380eae5](https://github.com/baptisteArno/typebot.io/commit/380eae545b16ef209a34d21a8d762be6da6daed4)]
-  chore: 👷 Add user info on Google sheets endpoints for Sentry [[0e14a23](https://github.com/baptisteArno/typebot.io/commit/0e14a238be9f071955b951ab4858eb7f457b5657)]
-  fix(hotfix): [[cc1dd51](https://github.com/baptisteArno/typebot.io/commit/cc1dd5152ea3fe59e9aa32da70326260587b6017)]
- 📄 Change patch webhook to post [[1c758d3](https://github.com/baptisteArno/typebot.io/commit/1c758d39e5c3653a2d97c2b4f492d3db38bba7ac)]
- 🩹 Switch from stepId to id (for Zapier) [[e3704f6](https://github.com/baptisteArno/typebot.io/commit/e3704f6dd9586ac163f572d840ce24742a654ce4)]
- 🛂 Add god rule to view typebots [[5d9356b](https://github.com/baptisteArno/typebot.io/commit/5d9356bd9cfb2f55de126c21e4a33976d232539a)]
- 🛂 Protect from others to consult typebots and folders [[f6d5eb5](https://github.com/baptisteArno/typebot.io/commit/f6d5eb577755e9f28c27265c3fe263ea8749e009)]
- 🛂 Add context variables to support typebot [[7402ad5](https://github.com/baptisteArno/typebot.io/commit/7402ad5f6d6bdafaca6b867f4f1810695bf2c03e)]
-  ci: 👷 Add connection pooling DB [[1c178e0](https://github.com/baptisteArno/typebot.io/commit/1c178e01a67a5e68a2b8ce6bd3d4939217b601f9)]
-  fix: Fix db critical [[558a603](https://github.com/baptisteArno/typebot.io/commit/558a60329d9e398fd4b455e049a0e2470e1705c6)]
-  build: 👷 Fix error page [[7ebfd43](https://github.com/baptisteArno/typebot.io/commit/7ebfd43db82fd1c3fa935e7434692c9075fcecb3)]
-  fix(editor): source endpoint even on buttons step [[0336bc2](https://github.com/baptisteArno/typebot.io/commit/0336bc2a421ccfd4560f86ea4fecac69297a6652)]
- 🩹 Avatar scroll on media bubbles [[1d3917f](https://github.com/baptisteArno/typebot.io/commit/1d3917f4403ca968e79bcb3ce68a9573ae7166cf)]
- 🩹 Vs pages typebot [[b1916e4](https://github.com/baptisteArno/typebot.io/commit/b1916e4f9c19c5b3f9ad4d76e78fa8555dbd1029)]
-  build: 👷 Remove Sentry traceSampling [[a8a03fb](https://github.com/baptisteArno/typebot.io/commit/a8a03fbcf2f51e13960fa7ca4cae7b10b2cbe2da)]
- 💅 Show when the bot is published [[8583e2a](https://github.com/baptisteArno/typebot.io/commit/8583e2a1ba76cfdc114241a59d38bf93ea946726)]
- 🩹 Slow down graph panning on Chromium [[130f85e](https://github.com/baptisteArno/typebot.io/commit/130f85e3c9832c1a68d807798f598c43468ae1dd)]
- 📦 Update packages [[e7d1f5d](https://github.com/baptisteArno/typebot.io/commit/e7d1f5d67488e9a9498bcc22badf13152c78d24c)]
- 💅 Add access to v1 banner [[1fbe324](https://github.com/baptisteArno/typebot.io/commit/1fbe324e4396b562a52d01d9cd99111eebccdb80)]
- 🛂 Use env file from builder for db [[80c15f9](https://github.com/baptisteArno/typebot.io/commit/80c15f9491b176921cd62a8500488be9087eb03a)]
- 💫 Can pan graph with mouse + click [[1033e42](https://github.com/baptisteArno/typebot.io/commit/1033e42b60867ebbc245b42abf66ea9b5dc385aa)]
- 👔 Send email disabled in preview [[f8a6415](https://github.com/baptisteArno/typebot.io/commit/f8a64151ef2341ffc67f74bbb1ab6bc0c2aaea9b)]
- 🛂 Limit typebot branding [[f57827c](https://github.com/baptisteArno/typebot.io/commit/f57827c5303287fefa46a313cd7617c27b37b79b)]
- 🛂 Limit analytics [[f46ba38](https://github.com/baptisteArno/typebot.io/commit/f46ba381adffb02408b742f00c0c2ecd96a9f267)]
- 🛂 Limit incomplete submissions [[ec470b5](https://github.com/baptisteArno/typebot.io/commit/ec470b578c1d2aa769838b566d60a3c652164fac)]
- 🛂 Limit create folder to Pro user [[3a7b9a0](https://github.com/baptisteArno/typebot.io/commit/3a7b9a0c6321d330f3162d361bebaf8a2cd0e912)]
- 🗑️ Tidy up env files [[901e2f3](https://github.com/baptisteArno/typebot.io/commit/901e2f39b089d7a62e39f025c6c55cd8aafc89ff)]
- 🛂 Fix viewer host env name [[92515ef](https://github.com/baptisteArno/typebot.io/commit/92515efcc3358a1b6100268884a0052b2970460e)]
- 🛂 Dynamically parse the viewer api host [[cfbf3d4](https://github.com/baptisteArno/typebot.io/commit/cfbf3d4c0dfdc72567fdc56e0c6a988446abb1a9)]
- 🗑️ Clean up gitignores [[c66827b](https://github.com/baptisteArno/typebot.io/commit/c66827b606f2708a4dbcffb05b8043356ce0843a)]
- 📦 Import existing Landing page [[36be357](https://github.com/baptisteArno/typebot.io/commit/36be3577e19aa7f9ef42fe08575da27afb2c103b)]
- 🩹 typebot buttons menu [[fc1d654](https://github.com/baptisteArno/typebot.io/commit/fc1d6547720fb6d3cd5fa22f90d7254819d6f94e)]
-  chore(e2e): 👷  Fix e2e pipeline [[02bd2b9](https://github.com/baptisteArno/typebot.io/commit/02bd2b94ba2c4f61f88c1501e3c57e35a8525517)]
-  ci(deployment): 👷 Add e2e tests on Vercel deployment [[65209c2](https://github.com/baptisteArno/typebot.io/commit/65209c26387420bbfde0f7d2d12f9fbb805a534d)]
- ⚗️ Add export results [[6c1e0fd](https://github.com/baptisteArno/typebot.io/commit/6c1e0fd345ba0d81f418236a85b20518ffa764bd)]
- ⚗️ Add infinite scroll in results table [[72454c0](https://github.com/baptisteArno/typebot.io/commit/72454c0f68b870c0a59992d34e8f86af677584c6)]
- ⚗️ Add delete results logic [[8ddf608](https://github.com/baptisteArno/typebot.io/commit/8ddf608c9ecd71376cf4125e74899e4b4e60a9cc)]
- 🧪 Add delete tests on dashboard [[6db34a8](https://github.com/baptisteArno/typebot.io/commit/6db34a8d4f3b8b7ef736b3ea355223c1305952d2)]
- 🖐️ Analytics drop off rates [[6322402](https://github.com/baptisteArno/typebot.io/commit/6322402c96265b78890c8143e72c5beebfc6c528)]
- 🪥 Consult submissions [[1093453](https://github.com/baptisteArno/typebot.io/commit/1093453c07f7ff99b9a9cfb1be4947ba098f2499)]
- 🧰 Aggregate utils &amp; set up results collection in viewer [[f088f69](https://github.com/baptisteArno/typebot.io/commit/f088f694b97cf591a37053a4aa8adf7d77999b37)]
- 🧯 Fix template page [[447172d](https://github.com/baptisteArno/typebot.io/commit/447172d0cb436fe5fa69c1d835855989000a4352)]
-  Add e2e tests for account [[8c826fc](https://github.com/baptisteArno/typebot.io/commit/8c826fcf709ad4d8f199ad1e48d7e1883c9246ea)]
-  Add user account page [[e10fe1a](https://github.com/baptisteArno/typebot.io/commit/e10fe1a1868054e8b7683c7701274d8d4ad1469f)]
- 🦴 Add results backbone [[698867d](https://github.com/baptisteArno/typebot.io/commit/698867da5d39d256b11526cbd1616d06bd37d988)]
- 🦴 Add viewer backbone [[d369b4d](https://github.com/baptisteArno/typebot.io/commit/d369b4d941a73db4edbad85e57eec223ee3a8c50)]
- 🦴 Add share page backbone [[9a78a34](https://github.com/baptisteArno/typebot.io/commit/9a78a341d278beaec13c1b8cb84d6bd9d7ee1e9f)]
- 🦴 Add settings page backbone [[79aede1](https://github.com/baptisteArno/typebot.io/commit/79aede1f3f520849c7fc68bf99aa9ae9ab5bbbce)]
- 💼 Add license to package.jsons [[4d8056d](https://github.com/baptisteArno/typebot.io/commit/4d8056dfe8dcfb01beac113c87c2ea5cd9c1f792)]
- 🦴 Add theme page backbone [[30ddb14](https://github.com/baptisteArno/typebot.io/commit/30ddb143b474fc03e1fd0a07266a5e31d883deb5)]
- 🤽 Update turborepo [[6ee0647](https://github.com/baptisteArno/typebot.io/commit/6ee0647384d465cd1a3d0712c199285741f25bf2)]
- 🚀 Init preview and typebot cotext in editor [[b7cdc0d](https://github.com/baptisteArno/typebot.io/commit/b7cdc0d14a83891786507f6cdf76339b320461c3)]
- 🛠️ Adapt Cypress to Turbo Repo [[a54e42f](https://github.com/baptisteArno/typebot.io/commit/a54e42f255ac791251baf582e4925c7c58246603)]
- 🚀 Init Turbo Repo [[772b16c](https://github.com/baptisteArno/typebot.io/commit/772b16c6ce887d70f4615d8155160d3a8fc32113)]
-  Add Graph draft [[da9459e](https://github.com/baptisteArno/typebot.io/commit/da9459edf3b244145c742b5168c54b290f7066d9)]
-  Update README.md [[0f85d2c](https://github.com/baptisteArno/typebot.io/commit/0f85d2cd94e39d1fd138c227dce493126f600bf8)]
-  Create LICENSE [[e3ab332](https://github.com/baptisteArno/typebot.io/commit/e3ab3320349e7a65692a2f6d38627a910f1252de)]
-  Create FUNDING.yml [[dd3d11b](https://github.com/baptisteArno/typebot.io/commit/dd3d11bcb34ccf50814c2fe78038ba247fe240d5)]
- 🚀 Init bot-engine [[9dbad1d](https://github.com/baptisteArno/typebot.io/commit/9dbad1dbab22cf9a20d959ffbced6fff5ba1e74f)]
- 💅 Renamed prisma package to db [[641ba3d](https://github.com/baptisteArno/typebot.io/commit/641ba3db8af43d1dd9940b1d9ab2426a13c6d950)]
- 📤 Remove workspace file from git [[17665de](https://github.com/baptisteArno/typebot.io/commit/17665def128efaa2914286f993e0aa6497a0cfb7)]
- 🧯 Fix auth with db sessions [[575361e](https://github.com/baptisteArno/typebot.io/commit/575361ec19036b4b8e7d7e16d1c0fb1a69d61ca5)]
- 🖨️ Add prisma deploy script [[e2659b4](https://github.com/baptisteArno/typebot.io/commit/e2659b49e8a49e3ae72f9d0047bb10689c4adf86)]
-  Add Dashboard [[54a641b](https://github.com/baptisteArno/typebot.io/commit/54a641b819c2c83a474bc6e1b708e2218d0162ea)]
-  Add authentication [[5e14a94](https://github.com/baptisteArno/typebot.io/commit/5e14a94dea907712b6bb43ec963e04355f4a3cb5)]
-  Set node-linker to node_modules [[68dd491](https://github.com/baptisteArno/typebot.io/commit/68dd491eca6f812c60383c49ae2ad376513d4264)]
-  Init project [[6fe9807](https://github.com/baptisteArno/typebot.io/commit/6fe9807fbe460efe673ad19b0518faca546dcbff)]


