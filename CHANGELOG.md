# Changelog

<a name="2.8.11"></a>

## 2.8.11 (2022-12-25)

### Summary

The new dark mode is here! 🌑

You can now add a GTM container ID directly in the Settings tab to enable GTM in your typebot.

Rating input now has a "One click submission", that disable the "Send" button.

### Added

- ✨ (rating) Add one click submit option [[449080b](https://github.com/baptisteArno/typebot.io/commit/449080b0add0ef570ffd27de94f39b939f6a5e83)]
- ✨ Add Google Tag Manager ([#185](https://github.com/baptisteArno/typebot.io/issues/185)) [[a898a7a](https://github.com/baptisteArno/typebot.io/commit/a898a7aa4128ba1baff1d645bbcef3ec867a3a38)]
- ✨ Add dark mode ([#191](https://github.com/baptisteArno/typebot.io/issues/191)) [[3394fa5](https://github.com/baptisteArno/typebot.io/commit/3394fa5e0a7ee9448fc31e3c1dd1700f64306ab7)]

### Changed

- ⬆️ Upgrade dependencies [[b0075fd](https://github.com/baptisteArno/typebot.io/commit/b0075fd374e3a8480535289c093afbd6f89c6089)]
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

### Miscellaneous

- 📝 Explain how code works in Set variable block [[2934af8](https://github.com/baptisteArno/typebot.io/commit/2934af883585562512dd98a781a0cfb6adfc25e3)]
- 📝 Add &quot;How to&quot; section in Buttons block doc [[11ff7ea](https://github.com/baptisteArno/typebot.io/commit/11ff7eab56c3b54f0271a33ba313e2b90d879fa7)]
- ⚗️ Implement bot v2 MVP ([#194](https://github.com/baptisteArno/typebot.io/issues/194)) [[1a3869a](https://github.com/baptisteArno/typebot.io/commit/1a3869ae6d9fa92fc71ef9d981bfffb8e4ee4ecc)]
- 🩹 Fix dark mode bg remaining issues [[d1b5b6e](https://github.com/baptisteArno/typebot.io/commit/d1b5b6ebe66efce61e207e80f60d198cb47fbfd9)]
- 📝 (lp) Add new testimonial [[2bec6bd](https://github.com/baptisteArno/typebot.io/commit/2bec6bda83a977468bffd0aace1e22aa75b1c2ee)]

<a name="2.8.10"></a>

## 2.8.10 (2022-12-18)

### Fixed

- 🚑 (results) Fix results page crash [[6e5786c](https://github.com/baptisteArno/typebot.io/commit/6e5786cfc3ef9bd5e5a5e272c1ca636b6ba6b4f8)]

<a name="2.8.9"></a>

## 2.8.9 (2022-12-18)

### Summary

Tons of database-related improvements and user experience improvements.

New Google Sheets Get data filtering. You can now select rows based on multiple column values and it will select a random row that matches your filter.

### Added

- ✨ (googleSheets) Advanced get filtering [[dcec1f0](https://github.com/baptisteArno/typebot.io/commit/dcec1f0a5c1fb81a3971952cd6af1117925c7b2d)]

### Changed

- ⬆️ Upgrade dependencies [[f46ce47](https://github.com/baptisteArno/typebot.io/commit/f46ce4781f154cabed74d5fe2335849ff180651c)]
- 🔧 Add cross env compatibility to scripts ([#184](https://github.com/baptisteArno/typebot.io/issues/184)) [[2cc61b1](https://github.com/baptisteArno/typebot.io/commit/2cc61b1bf1f36e533d87b10151db8f4045434618)]
- 🚸 (editor) Automatically move graph on first group on mount [[6c55510](https://github.com/baptisteArno/typebot.io/commit/6c55510d80bce5a9383b84d35c018c2c10bb9352)]
- 🚸 (workspace) Keep workspaceId in memory even when logging out [[578e41c](https://github.com/baptisteArno/typebot.io/commit/578e41c09f53620052eb38a859667735a2c26709)]
- ⚡ (dashboard) Improve folders and typebots get queries [[3ab047a](https://github.com/baptisteArno/typebot.io/commit/3ab047a48753783d173fa384543ffbbbbc84aa2a)]
- 🗃️ Write faster prisma queries [[7eac2c7](https://github.com/baptisteArno/typebot.io/commit/7eac2c71100dbe9e74afdb204eb62bcd229457d2)]
- 🗃️ Revert usage query back optimization [[fe8a531](https://github.com/baptisteArno/typebot.io/commit/fe8a531715487e4b2ec9f55e68c393377a1bd98c)]
- 🗃️ Optimize usage queries [[d6f90af](https://github.com/baptisteArno/typebot.io/commit/d6f90af126929dfc36af4284384dc75d99df0d11)]

### Fixed

- 💚 Fix sentry not receiving events [[68de7b7](https://github.com/baptisteArno/typebot.io/commit/68de7b720fa327ffdac39e45814fe41f6939f013)]
- 🐛 (typebotLink) Populate variable value when linked typebot is injected [[92dc797](https://github.com/baptisteArno/typebot.io/commit/92dc797b6c61818b584034348dcc0575ba0f19fc)]
- 🐛 (workspace) Read custom limits even without CUSTOM plan [[fd6b94b](https://github.com/baptisteArno/typebot.io/commit/fd6b94bb1b61f2ce416e2f004afb52dde36dbdb4)]
- 🐛 (typebotLink) Make sure to update all linked bot variable values [[656d1e3](https://github.com/baptisteArno/typebot.io/commit/656d1e3cade64c7aaca448c9801dff6c400fd174)]
- 🐛 (typebotLink) Fix fetching when typebot ID is current bot ID [[54dee6e](https://github.com/baptisteArno/typebot.io/commit/54dee6e3628b06a9525d57ef08f98602662a4de9)]
- 🚑 Disable usage check on viewer [[855a285](https://github.com/baptisteArno/typebot.io/commit/855a2856c81614966c8227f52d95475cc5f334b0)]

### Miscellaneous

- 📝 Add embed PDF from Google Drive instructions [[8b631d7](https://github.com/baptisteArno/typebot.io/commit/8b631d77eb492e597f957024b9857c4999d028fe)]
- 📝 Improve prefilled variables clarity [[141ffd3](https://github.com/baptisteArno/typebot.io/commit/141ffd35f7e5a4687f7fb4450e50e286a3a2d746)]

<a name="2.8.8"></a>

## 2.8.8 (2022-12-05)

### Added

- ✨ Enable Make.com and implement help doc buttons [[d75eceb](https://github.com/baptisteArno/typebot.io/commit/d75eceb23f1fe737a8f2104b2bc6d318d3c6a471)]
- ✨ Add webhook blocks API public endpoints [[c799717](https://github.com/baptisteArno/typebot.io/commit/c7997179053f91d383c3c31d884f30f2196d1c69)]

### Changed

- ⬆️ Upgrade dependencies [[2932043](https://github.com/baptisteArno/typebot.io/commit/293204305636d7871214945314d9a2249f39f452)]
- 🗃️ Update non-string variable values in Database [[461d2e2](https://github.com/baptisteArno/typebot.io/commit/461d2e2746de2888e76d1137b8d25136c7150cae)]
- 🔧 Enable usage limits on viewer [[cfcecaa](https://github.com/baptisteArno/typebot.io/commit/cfcecaaa1713780d1d95712315d80dbfcf13efb5)]
- 💄 (lp) Add 2 other testimonials [[03b09ad](https://github.com/baptisteArno/typebot.io/commit/03b09ad6eb6a2465189f0e603e15925740a7239b)]
- 💄 (lp) Update wall of love [[bdf7c0d](https://github.com/baptisteArno/typebot.io/commit/bdf7c0d5c02710be230f3c14b85dddbffb0e4671)]

### Fixed

- 🐛 (textBubble) Fix link parsing in text editor [[b4dc640](https://github.com/baptisteArno/typebot.io/commit/b4dc64028cb2affc3a8a487cf6c04285e64329b1)]
- 🐛 Fix api doc CORS [[94a57ae](https://github.com/baptisteArno/typebot.io/commit/94a57aea216c51e46e0566851a45d185b516d0f7)]
- 🚑 Attempt to fix prisma not defined trpc [[3c8820b](https://github.com/baptisteArno/typebot.io/commit/3c8820b2129ba1f5ec5ba89334c4b66a0568fd38)]
- 🐛 (billing) Fix currency possible mismatch on sub update [[f9ffdbc](https://github.com/baptisteArno/typebot.io/commit/f9ffdbc4c52b4d6e0027eee83209cf2c5794157a)]
- 🐛 (results) Fix export accessor parsing [[43a85b5](https://github.com/baptisteArno/typebot.io/commit/43a85b5529081c4dc90aa8d71721b21c266de7de)]
- 🐛 (viewer) Save new variables even if empty list [[49ba434](https://github.com/baptisteArno/typebot.io/commit/49ba43435012b73f1e5ed5318739e63b772cbc69)]

### Miscellaneous

- 📝 Update minio setup instructions [[4b2f42b](https://github.com/baptisteArno/typebot.io/commit/4b2f42b40d638d22603103560010c86306bb8bc7)]
- 📝 Improve Chatwoot block instructions [[ca8240b](https://github.com/baptisteArno/typebot.io/commit/ca8240ba291004f1cfe59f43a00ab64bb01287f6)]
- 📝 Improve Google config instructions [[41149b0](https://github.com/baptisteArno/typebot.io/commit/41149b07c6dba08a224042d0fe05d3e9bacd2f0a)]
- ⚗️ Implement chat API [[bf0d0c2](https://github.com/baptisteArno/typebot.io/commit/bf0d0c2475b0a394ca08fa9c629ac5ecf3ad74de)]
- 📝 Improve send email doc [[3e80af6](https://github.com/baptisteArno/typebot.io/commit/3e80af638b16d19e8522fc0887b26d1692c742bd)]

<a name="2.8.7"></a>

## 2.8.7 (2022-11-27)

### Added

- 📈 (lp) Add Vercel analytics [[b29f732](https://github.com/baptisteArno/typebot.io/commit/b29f7325ad8bb6a47306f87d5513222d386242f0)]
- ✨ Add audio bubble block [[7db0e01](https://github.com/baptisteArno/typebot.io/commit/7db0e01acae0731d3537e702438289c56634a60c)]
- ✨ (settings) Add a &quot;disable responses saving&quot; option [[473d315](https://github.com/baptisteArno/typebot.io/commit/473d315e0fc3fb7b7a24408480d67e1400a269f1)]

### Changed

- 🗃️ Add answer - groupId index [[9d69470](https://github.com/baptisteArno/typebot.io/commit/9d6947063069c80ef755724b8a89460acc4bf91a)]
- 🔧 Update db turbo scripts [[bdf4e83](https://github.com/baptisteArno/typebot.io/commit/bdf4e8361720175d1c8f1cd2fc10eadf6908f025)]
- ♻️ Add shared eslint config [[451ffbc](https://github.com/baptisteArno/typebot.io/commit/451ffbcacfe4a0417a5642a40eed533565513cd9)]
- ♻️ (results) Introduce tRPC and use it for the results [[d58f9bd](https://github.com/baptisteArno/typebot.io/commit/d58f9bd3a19f4c963c46ec0673ee45854a9a9118)]
- 🔧 Add Tanzania phone option [[c9cc82c](https://github.com/baptisteArno/typebot.io/commit/c9cc82cc0821390b85a0bcc23dc6fd0a3a6fbee7)]
- ♻️ (editor) Migrate from react-draggable to @use-gesture [[7632c54](https://github.com/baptisteArno/typebot.io/commit/7632c5426c026eb1fa15f5dab20e68b4f0735fa5)]
- 🚸 (typebotLink) Add icon in typebots dropdown [[0c3dcc5](https://github.com/baptisteArno/typebot.io/commit/0c3dcc522e95a313701431617c8eab8a4c381f8f)]
- 🚸 (bot) Avoid waiting for blocks with no returned data [[2bd7cee](https://github.com/baptisteArno/typebot.io/commit/2bd7cee58e90824d5058119288cf1e466c95f800)]
- 🚸 (condition) Enable multiple condition items in one block [[6725c17](https://github.com/baptisteArno/typebot.io/commit/6725c17a02f0df499b1dee3b1c3e909def649426)]

### Fixed

- ✏️ Remove &quot;Notion&quot; keywords where it&#x27;s supposed to be &quot;Typebot&quot; [[ce20f96](https://github.com/baptisteArno/typebot.io/commit/ce20f960f2093660104d0cc93d0405fc83bf1250)]
- 🐛 (graph) Make the text bubble selectable without moving group [[0593d2e](https://github.com/baptisteArno/typebot.io/commit/0593d2ead8df6ba5749887f26cccf4ce942411c7)]
- 🐛 (results) Fix results display when variable has undefined value [[d80cc1b](https://github.com/baptisteArno/typebot.io/commit/d80cc1b248275f28928c87d076dba3fcfdc11e89)]
- 🐛 (dashboard) Fix a bug preventing user to see settings content [[ec0e4be](https://github.com/baptisteArno/typebot.io/commit/ec0e4bee77422750dd5b2bbbcae4876e4664e77d)]
- 💚 (docs) Fix api schema generation in CI [[635e688](https://github.com/baptisteArno/typebot.io/commit/635e6887f37616ae22d681095b1f41a3d095afe1)]
- 🚑 (results) Fix results display when variable has null value [[e6dceca](https://github.com/baptisteArno/typebot.io/commit/e6dceca9f3124774f03a69cd90477f07a8796144)]
- 🐛 (workspace) Filter out guests from members list count [[04af489](https://github.com/baptisteArno/typebot.io/commit/04af489119c9577e900efb28853d53ea65bec76e)]
- 🐛 (bot) Fix input prefill when linked to another typebot [[5619eef](https://github.com/baptisteArno/typebot.io/commit/5619eef459f4c67b3667b4f9ec6bc2e277febbf7)]
- 🐛 (results) Fix export results when more than 200 [[8c15fd1](https://github.com/baptisteArno/typebot.io/commit/8c15fd17a1405f9ef8b16d171536b0a9cb15053c)]
- 🐛 Fix new image upload refresh when URL is the same [[fbd3304](https://github.com/baptisteArno/typebot.io/commit/fbd33046a1c16aabe7538315837825ebd892140e)]
- 🐛 (editor) Fix empty typebot name not editable [[2489318](https://github.com/baptisteArno/typebot.io/commit/2489318fa59e70335964f7d96dba029797fb4a4b)]
- 🐛 (audioBubble) Remove .ogg upload option because of Safari incompatibility [[e09adf5](https://github.com/baptisteArno/typebot.io/commit/e09adf5c643cd23de84ab0e676b27d5f8b6650f9)]
- 🐛 (editor) Make sure typebot name can be editable if empty [[c7fde1d](https://github.com/baptisteArno/typebot.io/commit/c7fde1d0bc5ff124265f74e3ceb5845561e49726)]
- 🚑 (lp) Temporarily disable plausible [[d2f617f](https://github.com/baptisteArno/typebot.io/commit/d2f617ff1e831fa4b03c7a15ef45a9b7a44134fc)]
- 🐛 (editor) Fix undo / redo not working properly on button nodes [[c4a4aa3](https://github.com/baptisteArno/typebot.io/commit/c4a4aa3e8313e6d7fa6b961679c7b27bbdeb9dc5)]
- 🚑 (bot) Fix custom email from field without name [[4e6b8ed](https://github.com/baptisteArno/typebot.io/commit/4e6b8ed521b1274a3d9f4a2556a3a9f8fd4211e1)]

### Miscellaneous

- ⚰️ (results) Remove results server parser [[9548733](https://github.com/baptisteArno/typebot.io/commit/9548733543a79575148aa62669a76b1b80cfacca)]
- 🛂 Add backup and restore database scripts [[3645607](https://github.com/baptisteArno/typebot.io/commit/3645607ed423236433a1690c31d770e9214c60b4)]
- 📝 Introduce auto generate API doc [[11695ef](https://github.com/baptisteArno/typebot.io/commit/11695efb57011d5899202f474e688a77dd5a9f32)]
- ⚰️ (docs) Remove old link [[feaf49f](https://github.com/baptisteArno/typebot.io/commit/feaf49f137d9c7cf666e78aca8eff8f58621a35b)]
- 📦 (wordpress) Update package version [[78fd974](https://github.com/baptisteArno/typebot.io/commit/78fd974ebe9e681555dfc85faa64c5d04c47a5b2)]
- 📝 Add Chatwoot integration doc [[96eb77d](https://github.com/baptisteArno/typebot.io/commit/96eb77d94bfb960b73a3e44119eb8deb8a48181a)]
- 🛂 Add setCustomPlan script [[6fdbf98](https://github.com/baptisteArno/typebot.io/commit/6fdbf98eedb0c15138383ae258ba57c7dd4b08a5)]
- 🧑‍💻 (typebot-js) Implement easier commands: open / close / toggle [[087d24e](https://github.com/baptisteArno/typebot.io/commit/087d24e58735091a2fa758821da7423b54dc99cd)]
- 🔊 Send trpc internal errors to Sentry [[0090065](https://github.com/baptisteArno/typebot.io/commit/00900657b2cb83029117772fc6ffe2936488c821)]

<a name="2.8.5"></a>

## 2.8.5 (2022-11-15)

### Added

- ✨ Add Chatwoot livechat integration [[ea84039](https://github.com/baptisteArno/typebot.io/commit/ea840390248cfa966e550c25d9af806bd4397295)]
- ✨ (logic) Add execute in parent window context for code block [[b31b603](https://github.com/baptisteArno/typebot.io/commit/b31b603cc786d5b7b5205db838332f671ea6c324)]

### Changed

- ⬆️ Upgrade dependencies [[bae710f](https://github.com/baptisteArno/typebot.io/commit/bae710fb1c09071258804a0cbc1f47a6211123fa)]
- ♻️ (bot) Change to features-centric folder structure [[9720944](https://github.com/baptisteArno/typebot.io/commit/972094425ae72f8b962617ec54bccb89a396efb8)]
- ♻️ (models) Change to features-centric folder structure [[a5c8a8a](https://github.com/baptisteArno/typebot.io/commit/a5c8a8a95cf108c8ad4d068f4a51675b888f7c89)]
- ♻️ (viewer) Change to features-centric folder structure [[a9d0479](https://github.com/baptisteArno/typebot.io/commit/a9d04798bcd0d5d9c2d15ed573e9e1b60ed066c8)]
- ♻️ (builder) Change to features-centric folder structure [[643571f](https://github.com/baptisteArno/typebot.io/commit/643571fe7d2a39f398269636bb57c7e8ae3f7a4e)]
- 🚸 (sendEmail) Make custom sender name optional [[3686465](https://github.com/baptisteArno/typebot.io/commit/3686465a85d21bf6342ab8395a5037063e379cac)]
- 🚸 (chatwoot) Make sure to close the chat bubble before opening Chatwoot [[d01549f](https://github.com/baptisteArno/typebot.io/commit/d01549fee6f0a9898a909496acaede91e5d0e17c)]
- ♻️ Improve file upload management [[d102fe1](https://github.com/baptisteArno/typebot.io/commit/d102fe118c3fd0dad96e692932d9792bdb4d514f)]
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

### Miscellaneous

- 🧑‍💻 (typebot-js) Add closeChatBubble event data [[54a1dc0](https://github.com/baptisteArno/typebot.io/commit/54a1dc04313d7fbc46795cf65e123a588245cd66)]

<a name="2.8.3"></a>

## 2.8.3 (2022-11-02)

### Added

- ✨ (billing) Implement custom plan [[385853c](https://github.com/baptisteArno/typebot.io/commit/385853ca3c80d04635be91b84db8be54c85bf437)]
- 👷‍♂️ Auto move project card to review column [[3f7dc79](https://github.com/baptisteArno/typebot.io/commit/3f7dc79918cf8455d33d0b64a90dfa9bc3e83a74)]
- 👷‍♂️ Add script to deploy only dev or main branches on Vercel [[8582c6e](https://github.com/baptisteArno/typebot.io/commit/8582c6e841797dfe98685907663b145bc1cb675d)]
- 👷‍♂️ Add auto link labeled issues to project [[e2e1c09](https://github.com/baptisteArno/typebot.io/commit/e2e1c098a215a80cd026235a2cca50efc642303e)]
- ✅ (webhook) Improve bot test [[264711b](https://github.com/baptisteArno/typebot.io/commit/264711b02957e043a0f1add65842ec903c80acd7)]
- ✨ (lp) Add custom chats and storage in pricing cards [[57c814c](https://github.com/baptisteArno/typebot.io/commit/57c814ceca777379b7a4b2a3657fac944435e9e2)]
- 👷‍♂️ Add auto tag and release actions [[f9a8e78](https://github.com/baptisteArno/typebot.io/commit/f9a8e789047c55fffa475eb3b87e51a3324e65a9)]
- ✨ (template) Add FAQ bot template [[b87ba40](https://github.com/baptisteArno/typebot.io/commit/b87ba4023dea7b47c835fe11a9d36a653d5469b0)]

### Changed

- 🚸 (googleSheets) Set value to null if not found from sheet [[4828547](https://github.com/baptisteArno/typebot.io/commit/48285479cc23377ba54bd61ad9a77f0e077c8592)]
- 🚸 (textBubble) Allow mailto and tel links [[baa63a7](https://github.com/baptisteArno/typebot.io/commit/baa63a781066879c0e01cfe85fcf584beb40c018)]
- 🗃️ Add typebotId index on Result table [[f8e770c](https://github.com/baptisteArno/typebot.io/commit/f8e770c8757b93e751ddb117f7d303600ec0b517)]
- 🚸 (share) Sanitize URL ID [[020a37c](https://github.com/baptisteArno/typebot.io/commit/020a37c1f32a1d0b44246c9364df471fe8ed51ce)]
- ⚡ (bot) Improve variables parsing and predictability [[3dc3ab2](https://github.com/baptisteArno/typebot.io/commit/3dc3ab201db001eff8319cb8978c1073b79f1198)]
- 🚸 (bot) disable auto focus on mobile [[40d2db5](https://github.com/baptisteArno/typebot.io/commit/40d2db59dc5168c0dd55eb9f790f308cdf63e333)]
- 🏗️ Use tsup for bot and typebot-js packages [[e8baaca](https://github.com/baptisteArno/typebot.io/commit/e8baaca2a2a44a80a40518e08f0af36c6528ce2a)]

### Fixed

- 🐛 (billing) Upgrade again after cancelling [[d132cb1](https://github.com/baptisteArno/typebot.io/commit/d132cb118afee2bcaaf43f31e0fe0b155aff8e80)]
- 🐛 (settings) Fix remember session switch [[36a2fe3](https://github.com/baptisteArno/typebot.io/commit/36a2fe3a70a7373fd08d72ba362bc5249b1078a8)]
- 🚑 (bot) Fix set variable number computation [[7b0bd08](https://github.com/baptisteArno/typebot.io/commit/7b0bd08dc81ac61d6788630a0b18097d0183147e)]
- 🐛 (analytics) Fix multi usage query timeout [[9cb7f8c](https://github.com/baptisteArno/typebot.io/commit/9cb7f8cd96338a8736686cfd1e73a72dcb401164)]
- 💚 Fix auto release actions [[f437ad6](https://github.com/baptisteArno/typebot.io/commit/f437ad6473562025ec2134805709390e000a0f5a)]
- 🐛 (editor) inconsistency in route change auto save [[b46d352](https://github.com/baptisteArno/typebot.io/commit/b46d35214d68fc60719128d5ea50b26d0a1b1e4d)]
- 🐛 (stripe) add back subscription delete webhook handler [[d1cc918](https://github.com/baptisteArno/typebot.io/commit/d1cc9180c893db8d230af9acf52f8a3beaed6e54)]

### Miscellaneous

- 📝 Add instruction for AWS S3 endpoint [[d6dffa9](https://github.com/baptisteArno/typebot.io/commit/d6dffa924eb0368c26fb3139856338197aa75281)]
- 📦 Update packages [[ff52a67](https://github.com/baptisteArno/typebot.io/commit/ff52a676f6c31be9a3b80a7b4d7710def5204958)]

<a name="2.8.1"></a>

## 2.8.1 (2022-10-09)

### Added

- ✨ (editor) Add unpublish and close typebot options [[bfed599](https://github.com/baptisteArno/typebot.io/commit/bfed59969599abc5a844540bd981f7dca7435f0e)]

### Changed

- 🚸 (bot) Display inputs to the right s… [[aea9021](https://github.com/baptisteArno/typebot.io/commit/aea9021eb881f3f20e31a9680d0dd7cba9b0ee4e)]
- 🚸 (sendEmail) Better result logging [[7ca97d4](https://github.com/baptisteArno/typebot.io/commit/7ca97d4606c26d5b9aae94ad292bfe053002696c)]

### Fixed

- 🐛 (bubbles) Fix giphy search input buggy [[88c4076](https://github.com/baptisteArno/typebot.io/commit/88c40766645d93729495618144083b2fe7b6ed36)]

### Miscellaneous

- 📦 Upgrade deps [[5289a96](https://github.com/baptisteArno/typebot.io/commit/5289a96940e2bcc74532a08a91b081131bc17616)]
- 📝 Update changelog [[471ffe8](https://github.com/baptisteArno/typebot.io/commit/471ffe8e217f9b0c48c040d7115b46a5269088c1)]

<a name="2.8.0"></a>

## 2.8.0 (2022-10-02)

### Added

- 🔊 (sendEmail) Add log when smtp config is failing [[75ca255](https://github.com/baptisteArno/typebot.io/commit/75ca255af22bed3646ca3de11f03ce49e7866ab3)]
- ✨ (lp) Add new pricing page [[c94a658](https://github.com/baptisteArno/typebot.io/commit/c94a6581be077d5c8403004f688d3213a80d80a5)]
- 👷‍♂️ Transpile components for better DX [[c1dd4d4](https://github.com/baptisteArno/typebot.io/commit/c1dd4d403e17d0ccdcc44d6c0ff0dc8bad7c15be)]
- ✨ Add usage-based new pricing plans [[898367a](https://github.com/baptisteArno/typebot.io/commit/898367a33be70d86b765421462d1c288d0c8cc05)]

### Changed

- 🚸 (inputs) Improve date input response bubble formatting [[fac70b9](https://github.com/baptisteArno/typebot.io/commit/fac70b96395f0554168d650c3971ed388f1b8f0e)]
- ♻️ (usage) Remove limit until temporarily [[3bec24a](https://github.com/baptisteArno/typebot.io/commit/3bec24a8cc3c0aa8d68f5ba44d96aea725bd4e77)]

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

### Miscellaneous

- 📦 Upgrade deps to latest version [[a947c1c](https://github.com/baptisteArno/typebot.io/commit/a947c1ce34cd8d7adbe8d63b317f10122a20c295)]
- 🧑‍💻 (emails) Add decent emails management [[1654de3](https://github.com/baptisteArno/typebot.io/commit/1654de3c1f4449161511a3890a5f540bb6034653)]

<a name="2.7.1"></a>

## 2.7.1 (2022-09-12)

### Fixed

- 🐛 (webhook) Don&#x27;t send body when GET method is used [[4a04d1c](https://github.com/baptisteArno/typebot.io/commit/4a04d1ccbac67526a376ed798704e153cd63a37e)]
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

### Miscellaneous

- 📝 More explicite set variable compute examples [[a161180](https://github.com/baptisteArno/typebot.io/commit/a16118027d2adb0aedd76902cf8d2d83692bb949)]
- 🧑‍💻 (smtp) Use secure prop instead of ignoreTLS [[cf07cfe](https://github.com/baptisteArno/typebot.io/commit/cf07cfe3abadac0bcdbb136896e6f2cfe71fd142)]

<a name="2.6.2"></a>

## 2.6.2 (2022-08-29)

### Miscellaneous

- 📦 Add cz-emoji [[d94879e](https://github.com/baptisteArno/typebot.io/commit/d94879ec3b2d1bc3ac8461f4626e0073c0f62cd6)]
- chore: upgrade packages [[57866c4](https://github.com/baptisteArno/typebot.io/commit/57866c4aa3d210d24cedaecfa81b45c1a2550f7a)]
- fix(webhooks): improve body parsing [[43891b0](https://github.com/baptisteArno/typebot.io/commit/43891b06aaa85ba297cd0d65526f0307cb8e5858)]
- fix(results): crash when variable is object [[02bb7f5](https://github.com/baptisteArno/typebot.io/commit/02bb7f5ea774eb3f71ebb75aad811730be9031cf)]
- build: upgrade packages [[5928142](https://github.com/baptisteArno/typebot.io/commit/59281426b0d5be31a6b85ec5c71bd47d5f06c614)]
- fix(typebotLink): current typebot dropdown [[93161b7](https://github.com/baptisteArno/typebot.io/commit/93161b74b2b53ea997d6328a3e618fc1023c8d11)]
- fix(paymentInput): don&#x27;t proceed when modal closed [[bd41d7f](https://github.com/baptisteArno/typebot.io/commit/bd41d7fc9be01fb307cf42fcdf6e0835a03729e1)]
- build(results): add log to investigate crash [[1318d27](https://github.com/baptisteArno/typebot.io/commit/1318d27c74dccd4647d7f9e669d196cbd8069100)]

<a name="2.6.1"></a>

## 2.6.1 (2022-08-18)

### Miscellaneous

- build: bump version [[ec7de58](https://github.com/baptisteArno/typebot.io/commit/ec7de582bddd20091d7c696c7ac11453c2ee05dc)]
- fix(engine): reset button type to submit [[741f31a](https://github.com/baptisteArno/typebot.io/commit/741f31a05ec4fd617d4886f9ff9ac05638b57833)]
- fix(bot): pay button not submitting [[f9c16ce](https://github.com/baptisteArno/typebot.io/commit/f9c16ce4c4382a24af04f4f6517c8c11a6af551f)]
- fix(bot): google pay autocomplete [[dc5a38c](https://github.com/baptisteArno/typebot.io/commit/dc5a38cacfc2b77366bb6e9acea14849eb09c5c2)]
- docs: add a custom domain [[6928848](https://github.com/baptisteArno/typebot.io/commit/69288484ed204a320c2767403ff09df5af660536)]
- feat(inputs): improve input focus behavior [[fd01793](https://github.com/baptisteArno/typebot.io/commit/fd0179359495a5999b6c4e2cc893f958b55235e7)]
- ci: avoid triggering npm publish on any tag [[008724a](https://github.com/baptisteArno/typebot.io/commit/008724a3b1235b91a843a3d545912800e41b2053)]

<a name="2.6.0"></a>

## 2.6.0 (2022-08-13)

### Miscellaneous

- build: bump version [[e16ca64](https://github.com/baptisteArno/typebot.io/commit/e16ca6411891fc0ae1e5d22a6445a3da395ae93d)]
- fix(giphy): search [[5333ba9](https://github.com/baptisteArno/typebot.io/commit/5333ba9088fd27e23e19802c35ae1af5aa617810)]
- docs: add members and guests [[6716cf2](https://github.com/baptisteArno/typebot.io/commit/6716cf2484fdc771636c5b183278bef7dcaab68e)]
- fix(results): crash when accessor contains a dot [[361092f](https://github.com/baptisteArno/typebot.io/commit/361092ffa59b330574358439e844b09b70d6cbf0)]
- fix(collaboration): env var typo [[823793a](https://github.com/baptisteArno/typebot.io/commit/823793aab49ab3feb5562d8fd87a8a4e4f36caea)]
- docs: improve set current date wording [[f9ab0e8](https://github.com/baptisteArno/typebot.io/commit/f9ab0e8a762a2778aa569cc41c602276b59525d9)]
- build: add pnpm [[ee338f6](https://github.com/baptisteArno/typebot.io/commit/ee338f62dc0923bf20b62b0a7696cf99d296611d)]
- docs: update vercel cli command (closes [#116](https://github.com/baptisteArno/typebot.io/issues/116)) [[8c3b505](https://github.com/baptisteArno/typebot.io/commit/8c3b5058f1e2c30a8017e01b883e3e3b2a4b5feb)]
- docs: link to current typebot [[0e3ce7e](https://github.com/baptisteArno/typebot.io/commit/0e3ce7e7a704f346f377518874b3700a12a1d094)]
- docs: add builder url in viewer config [[5ff9afc](https://github.com/baptisteArno/typebot.io/commit/5ff9afc2b049dd6828dd8fa3e8468449ad761e93)]
- docs: add extract cookie example [[47d24c4](https://github.com/baptisteArno/typebot.io/commit/47d24c444782aace04e4134158a64f09baa99a20)]
- docs: add lp and docs start instructions [[22eb48b](https://github.com/baptisteArno/typebot.io/commit/22eb48be0b9222152c8836cdd937bf1f135ba54a)]
- feat(results): remove incomplete results limitation [[7d0a526](https://github.com/baptisteArno/typebot.io/commit/7d0a5267362a18a46be0d7de631cc07d8feda561)]
- fix(docs): openssl command [[bd0d995](https://github.com/baptisteArno/typebot.io/commit/bd0d995c2ce5b125dfb797234f79a8d6fe9b754a)]
- fix(bot): mobile keyboard covering input [[f1a01bf](https://github.com/baptisteArno/typebot.io/commit/f1a01bf6632197fa4c992fea64b0429856040c67)]
- fix(db): switch blockId and groupId on old answers [[b62b955](https://github.com/baptisteArno/typebot.io/commit/b62b955c07ac536898a4cb610f5caedff98824e0)]
- fix: viewer general config table [[c2ff1ff](https://github.com/baptisteArno/typebot.io/commit/c2ff1ff68f4cf7d6c26f9a477c544c3d43659450)]
- fix(templates): duplicate resultsPreference conflict [[481f617](https://github.com/baptisteArno/typebot.io/commit/481f61714ed22e8198319bb53b0536b4571ab104)]
- chore: update msw [[6822b77](https://github.com/baptisteArno/typebot.io/commit/6822b778975631bb79b09b12f94b4ba870e045f7)]
- fix: remove json escape for single variable body [[d6aa6e7](https://github.com/baptisteArno/typebot.io/commit/d6aa6e7c752e26933e46edefd71d5f16aa5750c1)]

<a name="2.5.1"></a>

## 2.5.1 (2022-06-29)

### Changed

- 🚸 Add version number in settings modal [[8c86cb8](https://github.com/baptisteArno/typebot.io/commit/8c86cb8684841f25330aa2b77671e57648d46ca2)]
- ♿ Another attempt to disable autofill on text input [[3600783](https://github.com/baptisteArno/typebot.io/commit/3600783439bd432117364a647bd900ffe21bec21)]

### Fixed

- 🐛 From name behavior [[f4c81f2](https://github.com/baptisteArno/typebot.io/commit/f4c81f2f0785f91113bb0f737fb5aaf192be16f9)]
- 💚 Remove unused package [[edec5ba](https://github.com/baptisteArno/typebot.io/commit/edec5ba904020742fb61c07c484d9d3c8eafc6a3)]

### Miscellaneous

- 📝 Add General settings [[7caac2b](https://github.com/baptisteArno/typebot.io/commit/7caac2bc25b8ede84f9ff6abbc8c07dab1e7a2c4)]
- 📝 Improve docker guides and examples [[d1e94ee](https://github.com/baptisteArno/typebot.io/commit/d1e94ee562f3c724f312659835a2d978972dcf0c)]

<a name="2.5.0"></a>

## 2.5.0 (2022-06-27)

### Changed

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

### Miscellaneous

- 📝 Add TLS explanations for smtp config [[8c93674](https://github.com/baptisteArno/typebot.io/commit/8c936741f3d0b9d4b1f174838a095bc34158cc18)]
- build: Archive results to still be able to check usage [[3a4f263](https://github.com/baptisteArno/typebot.io/commit/3a4f263c71cf391b96527ed9938fe73f9fc737e2)]

<a name="2.4.0"></a>

## 2.4.0 (2022-06-22)

### Added

- ✨ Add a Help button [[5ef89f7](https://github.com/baptisteArno/typebot.io/commit/5ef89f7501950e8210459c0e643932e8830ded90)]
- ✨ Support variables in buttons [[46900ac](https://github.com/baptisteArno/typebot.io/commit/46900ac6df264fa88467a0a38d4e4fb4000c48bf)]

### Changed

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

### Security

- 🔒 Improve delete security checks [[9352587](https://github.com/baptisteArno/typebot.io/commit/93525872980f7d1a05a714f8ed855ff2dbed681e)]

### Miscellaneous

- ci: 👷 Simplify build on Vercel [[3392e04](https://github.com/baptisteArno/typebot.io/commit/3392e04d38c2c86af52622bb24a4930d6d3e6c18)]
- Merge branch &#x27;main&#x27; of https://github.com/baptisteArno/typebot.io [[1931a5c](https://github.com/baptisteArno/typebot.io/commit/1931a5c9c015dcd25115ee25eaed744ede672a6c)]
- 🛂 Hide folders for guests [[85601fc](https://github.com/baptisteArno/typebot.io/commit/85601fc1def252eda0543cbe71490a8d713f795e)]
- 📝 Add doc for every block [[283509e](https://github.com/baptisteArno/typebot.io/commit/283509ed59140efe50d13d6cd1ef996aaa81cd00)]
- 🔨 Run Playwright tests on pull request [[8358de1](https://github.com/baptisteArno/typebot.io/commit/8358de1dabbf9a14ad14cf3bf2696d4f183416c8)]

<a name="2.3.0"></a>

## 2.3.0 (2022-06-13)

### Added

- ✨ Add file upload input [[75365a0](https://github.com/baptisteArno/typebot.io/commit/75365a0d822fd6e18f0ec6d12287bb03598ea0b0)]
- ✨ Custom email body and HTML content [[97980f4](https://github.com/baptisteArno/typebot.io/commit/97980f42ca255e2e7d690a2c1a39c9732bda1fc1)]
- ✨ Add Rating input [[b1aecf8](https://github.com/baptisteArno/typebot.io/commit/b1aecf843b28e0c06cf7c43f59cc5ebd661da416)]

### Changed

- 🔧 Add ignoreTLS option for SMTP creds [[3105ade](https://github.com/baptisteArno/typebot.io/commit/3105adedb39c05f207f7193bcfdccc841506c870)]
- ⚡ Improve first paint delay [[aeaaa5c](https://github.com/baptisteArno/typebot.io/commit/aeaaa5c39814fccfdcdcd35e4c601ef2643826f1)]
- ♻️ Rename step to block [[2df8338](https://github.com/baptisteArno/typebot.io/commit/2df833850504fa2bb8653494a0e3abb120abde1f)]
- 🚸 Attempt to remove Chrome auto complete [[8751766](https://github.com/baptisteArno/typebot.io/commit/8751766d0e2a1e8ee399c4d64e2e333700e73f30)]

### Fixed

- 🚑 Add a variable update queue to avoid initial crash [[87a9e7e](https://github.com/baptisteArno/typebot.io/commit/87a9e7e337569da3c16efc17c7ac62ddc1e03270)]
- 💚 Attempt to fix cached prisma models [[4fd5d45](https://github.com/baptisteArno/typebot.io/commit/4fd5d452a378b0ff7c937ae9670356352728f4fc)]
- ✏️ Remove quotes from email config [[0a45a31](https://github.com/baptisteArno/typebot.io/commit/0a45a31007013cf914ae3dd6feddab151aaac4ed)]

### Security

- 🔒 Add verification on backend for file input deployment [[14afd22](https://github.com/baptisteArno/typebot.io/commit/14afd2249e9615a0e4a616df81d95032416bd8fa)]

### Miscellaneous

- ci: 👷 Auto create tags [[5c54bb7](https://github.com/baptisteArno/typebot.io/commit/5c54bb7755f4ecad319910d7cd1aa87ef5d89b79)]
- 📝 Indicate where var dropdown is available [[177789c](https://github.com/baptisteArno/typebot.io/commit/177789c1a693c1c4ac8ae0c5f6467c25c38a52c2)]
- 🧑‍💻 Keep host avatar when group starts with input [[910b871](https://github.com/baptisteArno/typebot.io/commit/910b87155659c6592f20643ac7609cba0fb2c6f5)]
- 🛂 Restrict file upload input [[353923e](https://github.com/baptisteArno/typebot.io/commit/353923e029426ae748476b2a6462aa043fda2fb1)]
- 📝 Improve hidden variables doc [[d4c52d4](https://github.com/baptisteArno/typebot.io/commit/d4c52d47b31ce3c70067e6fc3938f728757b2b9f)]
- 📝 Update email doc [[6657a85](https://github.com/baptisteArno/typebot.io/commit/6657a85573b00b44b61acbd85b41296da680a8ee)]
- 📝 Update video in README for mobile [[1b569da](https://github.com/baptisteArno/typebot.io/commit/1b569dae99a2d4f138530b058b58006fea81922b)]

<a name="2.2.9"></a>

## 2.2.9 (2022-07-07)

### Added

- ✨ Brand new Results table [[d84f990](https://github.com/baptisteArno/typebot.io/commit/d84f99074ddc02794e7c90fa121a573adc619763)]
- 📈 Inject user id for Sentry [[cf6e8a2](https://github.com/baptisteArno/typebot.io/commit/cf6e8a21be3ac714f136cecfbb6744618dc0a457)]

### Changed

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

### Security

- 🔒 Check token id before updating creds [[9cddc75](https://github.com/baptisteArno/typebot.io/commit/9cddc755a3087631605c91a8efce35b4ad74e916)]

### Miscellaneous

- improve Dockerfile size and safety [[9839f5c](https://github.com/baptisteArno/typebot.io/commit/9839f5c1325deeb06162ee7a553b6cf34e769bcd)]
- 📝 Add workspace doc [[0dd99e0](https://github.com/baptisteArno/typebot.io/commit/0dd99e0802a822ba74c8672c1047a5d5edc40e19)]
- 📝 Add Troubleshoot sections [[f1f5299](https://github.com/baptisteArno/typebot.io/commit/f1f529949d400751c092f00e032891dd13cbbccb)]
- 📝 Add Metadata section in Settings [[5fa8dbf](https://github.com/baptisteArno/typebot.io/commit/5fa8dbfb7e13eb35c1219ecb0c877a54032f6019)]
- 📝 Add context menu doc [[2e2b1c1](https://github.com/baptisteArno/typebot.io/commit/2e2b1c1b6b9a3a81daff77493e8ec08782f0c087)]
- 📝 Precise what browsers blocks the popups [[273d476](https://github.com/baptisteArno/typebot.io/commit/273d4767f110a39f8b72ccf1c3b4965d39a3f2d6)]
- 📝 Add dynamic avatar guide [[cc71157](https://github.com/baptisteArno/typebot.io/commit/cc71157e0fcb3832dd3226e4ada42e89a632bde7)]

<a name="2.2.1"></a>

## 2.2.1 (2022-06-07)

### Changed

- 🎨 Build types from validation schemas [[e79ff09](https://github.com/baptisteArno/typebot.io/commit/e79ff09b0f0bdfc50a85784c51ee699743647351)]
- 🗃️ Remove duplicate fields in PublicTypebot [[ad32ae0](https://github.com/baptisteArno/typebot.io/commit/ad32ae02ef4493af34c4e777a7305ffba24cbb7d)]

### Fixed

- 🐛 Add public env var in runtime config [[a42e1ca](https://github.com/baptisteArno/typebot.io/commit/a42e1cad22621a9f4a8e0beff693bc58bb7531e3)]
- ✏️ Docker upgrade guide typo [[c67fa7d](https://github.com/baptisteArno/typebot.io/commit/c67fa7d9c1dcdf6c03cdde9a28dd3a12e046bdec)]
- 🐛 Google sheets callback crash when no code [[8ec117a](https://github.com/baptisteArno/typebot.io/commit/8ec117aee4cd50145c1133f8375320bad31f0c4d)]
- ✏️ Email integration youtube ID [[b403d9b](https://github.com/baptisteArno/typebot.io/commit/b403d9b346ba37f0d7f790506cc6cf4defd9aaa6)]
- ✏️ Docker upgrade instructions [[8eefd96](https://github.com/baptisteArno/typebot.io/commit/8eefd96d2fc5ba10912008a033413ee5cb25b882)]

### Miscellaneous

- 📝 Update wordpress personalization [[3010976](https://github.com/baptisteArno/typebot.io/commit/301097623ba841312ef66c23d514105f276a2a29)]
- remove unnecessary comment [[853b749](https://github.com/baptisteArno/typebot.io/commit/853b749e2c577aa1c0f25f9833930d1463752752)]
- update docs [[237c388](https://github.com/baptisteArno/typebot.io/commit/237c388e31bdb774d9997c3029bf8a1f5e64d4cd)]
- add azure-ad login option [[ee370b5](https://github.com/baptisteArno/typebot.io/commit/ee370b5f26b2a7e1f58031b29d563fd9f80e11c4)]

<a name="2.2.0"></a>

## 2.2.0 (2022-06-03)

### Added

- ✨ Revokable API tokens [[a0929c4](https://github.com/baptisteArno/typebot.io/commit/a0929c492b260e5e03c4ee0e41dacc120ca066fa)]
- ✨ Start preview from any block [[89d91f9](https://github.com/baptisteArno/typebot.io/commit/89d91f9114c0ce16cedd34ef8a2348c2c734571b)]
- ✨ Add Digital Product Payment template [[89d17a9](https://github.com/baptisteArno/typebot.io/commit/89d17a9ed3f02b6cf33e8382cb9a7135e7549d33)]

### Changed

- ♻️ Toast component [[12f2e40](https://github.com/baptisteArno/typebot.io/commit/12f2e401523c4bac8cace617c767540d43a5701b)]
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

### Miscellaneous

- 📝 Import / Export flow [[e5d7f1d](https://github.com/baptisteArno/typebot.io/commit/e5d7f1d1ce52e2a242ff894b22af50ff486a6cec)]
- 🧑‍💻 Input default autocompletes [[f42dd48](https://github.com/baptisteArno/typebot.io/commit/f42dd485334966e3aa41d76d1c422fdb2de983cb)]
- 📝 Add instructions for custom docker images [[97eb036](https://github.com/baptisteArno/typebot.io/commit/97eb0361c8d17a9433b7b6a910be5929d7076c73)]
- ci: 👷 Remove docsearch scrapper [[b65d153](https://github.com/baptisteArno/typebot.io/commit/b65d153bf0cf5edef071a1a840699127e5f62242)]
- 📝 Explain how to pass parent URL [[61e4ca1](https://github.com/baptisteArno/typebot.io/commit/61e4ca13132ca72294620c7df18a2644367a8908)]
- build(docker): 👷 Build images on push [[5e19f79](https://github.com/baptisteArno/typebot.io/commit/5e19f796cc3199488b3839f2386f471b486b220a)]

<a name="2.1.2"></a>

## 2.1.2 (2022-05-30)

### Fixed

- 🐛 Number var [[d6b5568](https://github.com/baptisteArno/typebot.io/commit/d6b5568e033473beffec86df05e15c5bca26bda6)]
- 🐛 Multi-line var parsing for webhook [[d02f267](https://github.com/baptisteArno/typebot.io/commit/d02f2675883a7b636fa1a66922b64f85f781e5f5)]
- 🐛 Don&#x27;t parse &quot;004&quot; as number 4 [[e72934d](https://github.com/baptisteArno/typebot.io/commit/e72934d29af114dfc66d55776833d359a5ebe7af)]
- 🐛 Custom currency payment input [[2cb8330](https://github.com/baptisteArno/typebot.io/commit/2cb83307903e92d67bdf72d1df46dac3d2bcbf2f)]

### Miscellaneous

- 🛂 Disable new user signups [[ff5c368](https://github.com/baptisteArno/typebot.io/commit/ff5c3683fcac487301b31ab6b855694c6f9d59d5)]
- Update compose file [[2bdc1ce](https://github.com/baptisteArno/typebot.io/commit/2bdc1ce05635078b58cd8772c016e5e1a1dd3126)]
- 🧱 Improve runtime environment [[a04a11a](https://github.com/baptisteArno/typebot.io/commit/a04a11ae0272170e1f83f4c367b529afaff52efc)]
- 📦 Compatible with iPhone 6 [[92cd56e](https://github.com/baptisteArno/typebot.io/commit/92cd56e5d0e16de5a6b2a234c8a1293cdd68dadf)]
- 📝 Fix FROM email quotes [[30d36b9](https://github.com/baptisteArno/typebot.io/commit/30d36b9a09647e3a259442f7c3342b690f3a0913)]

<a name="2.1.1"></a>

## 2.1.1 (2022-05-25)

### Added

- ✨ Payment input [[3a6ca3d](https://github.com/baptisteArno/typebot.io/commit/3a6ca3dbde916647f5ac7eaba28f5a3b8072f030)]
- 🔊 Better log when can&#x27;t find a typebot [[0f06aae](https://github.com/baptisteArno/typebot.io/commit/0f06aae80cd12ad350c80d959992ba010fadd958)]

### Changed

- 💄 New URL image preview [[faffcc6](https://github.com/baptisteArno/typebot.io/commit/faffcc69a7ceda588ca2e095ca15bf15fd59c9a7)]
- 💄 Proactive message margin [[350719c](https://github.com/baptisteArno/typebot.io/commit/350719c7935604aef4ee5b353422203043921d8b)]
- 💄 Proactive message close icon [[ac278b9](https://github.com/baptisteArno/typebot.io/commit/ac278b9916c7af9daf3bef0daa4d4a97d04b7f50)]
- 💄 Hide avatar if not last block [[0de0d12](https://github.com/baptisteArno/typebot.io/commit/0de0d128b39716d9ababb468bbefc448fa04575c)]
- 💄 Add button ping if unique first [[d9e273b](https://github.com/baptisteArno/typebot.io/commit/d9e273b008376985992d4d32993c6aa13335738b)]
- ⚡ Delete workspace button [[b7b0344](https://github.com/baptisteArno/typebot.io/commit/b7b034432a03e579d42a47f8497a2891ce708e5b)]
- 💄 Variable button tiny dropdown [[0f38141](https://github.com/baptisteArno/typebot.io/commit/0f38141eb156196635aabad287cad30f99e9fdca)]
- 🎨 Code format [[98c1dea](https://github.com/baptisteArno/typebot.io/commit/98c1dea92aba60e449a5a205af2ed91b9f899811)]

### Removed

- 🔥 Remove ownerIds [[bda4116](https://github.com/baptisteArno/typebot.io/commit/bda4116fbc26840badf0b723727d58e12da06b54)]

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

### Security

- 🔒 add gitlab pagination [[b39e892](https://github.com/baptisteArno/typebot.io/commit/b39e89202055a0cc7b9bbe36ac724267684a31f2)]

### Miscellaneous

- build: 👷 New compose file and entrypoints [[5d786f5](https://github.com/baptisteArno/typebot.io/commit/5d786f59cc6802945908040be86662690903807e)]
- ci: 👷 Build and publish docker images on new version [[e7ae611](https://github.com/baptisteArno/typebot.io/commit/e7ae6118114a9d3145a536422ff55cb763d12b4a)]
- 📝 Improve popup delay builder [[62b77e4](https://github.com/baptisteArno/typebot.io/commit/62b77e49059ba3155e7eb81df5df60a9c5803204)]
- 📝 Callbacks URL typo [[447e87d](https://github.com/baptisteArno/typebot.io/commit/447e87de66774c123b7abde168789da343498c7e)]
- 📝 Edit single button color [[c57ed07](https://github.com/baptisteArno/typebot.io/commit/c57ed0777c33225c0ecc5e20cbf81b59077fcd49)]
- 📝 Improve hero wording and add Plausible [[f07db7f](https://github.com/baptisteArno/typebot.io/commit/f07db7f68adddf0eccaf2c4d7a41d6b265f57501)]
- Fixed CNAME domain [[47a7aa1](https://github.com/baptisteArno/typebot.io/commit/47a7aa165d8dbb9cc0d499a7b048f365e6a55605)]
- ⚗️ Await for result update [[391aead](https://github.com/baptisteArno/typebot.io/commit/391aeaddf12590db0ce7a40dce5a31d31285b971)]
- 📝 initContainer typo [[24b077c](https://github.com/baptisteArno/typebot.io/commit/24b077c0e2d06700a94443acc2adc8954beb03ab)]
- fix(auth): add gitlab to hasNoAuthProvider check [[a178124](https://github.com/baptisteArno/typebot.io/commit/a178124ee988be9982f26ef25fbbc40d88dc877d)]
- 📝 Rename URL examples in config [[730de56](https://github.com/baptisteArno/typebot.io/commit/730de56374313deffb291393f9d0b9791c10eef9)]
- 📝 Add Code block [[fbcd46d](https://github.com/baptisteArno/typebot.io/commit/fbcd46dd9ca0a4ed7598988b82d9b3cd872c4dc3)]
- Update README.md [[137c493](https://github.com/baptisteArno/typebot.io/commit/137c4937d0401d0059aa8e0cedf02ef95e43a2c6)]
- 📝 Add new preview [[bfd20cb](https://github.com/baptisteArno/typebot.io/commit/bfd20cbf63c7d625576750add1ebe14aa8eaa038)]
- 📝 Add demo in README [[71d96c9](https://github.com/baptisteArno/typebot.io/commit/71d96c98eac9f10722de84e14c51bb3596213271)]
- 🔨 Add migration recover script [[d0119ee](https://github.com/baptisteArno/typebot.io/commit/d0119ee24b27f8f6626a219fdd16d594103f82f2)]
- 📝 Improve Set variable [[55224c9](https://github.com/baptisteArno/typebot.io/commit/55224c9095de2041f71cdfcf33238f523f87f04e)]

<a name="2.1.0"></a>

## 2.1.0 (2022-05-17)

### Added

- ✨ Team workspaces [[f0fdf08](https://github.com/baptisteArno/typebot.io/commit/f0fdf08b00f740c4804b49f45dcd8338e29e10fa)]

### Changed

- ⚡ Can disable query params auto hide [[4272186](https://github.com/baptisteArno/typebot.io/commit/42721865c5dade0dc40272f997e8f86c37701678)]
- 💄 Attempt to fix font loading [[46037c0](https://github.com/baptisteArno/typebot.io/commit/46037c039e92b31f233bcde38aa8aac91ba0325a)]

### Fixed

- 💚 Deployment [[210bad3](https://github.com/baptisteArno/typebot.io/commit/210bad32f905e0556cc56757d3327ed6c91b8851)]
- 🐛 Pass tests [[731e646](https://github.com/baptisteArno/typebot.io/commit/731e64637723b6758ebe82510bafcc6af48d7d80)]
- 🐛 Refresh prevent [[4d9796c](https://github.com/baptisteArno/typebot.io/commit/4d9796c55911c1c3bb6187b8c8e5f4c86279ba7c)]
- 🐛 Disable font optimization temporarly [[508c166](https://github.com/baptisteArno/typebot.io/commit/508c1660b45bdf149e2a6db5591074a928a57a90)]

### Miscellaneous

- 👷 Remove maintenance page [[cd24482](https://github.com/baptisteArno/typebot.io/commit/cd24482038788da75178f9a2e7f21b9e3bb820b6)]
- Merge pull request [#36](https://github.com/baptisteArno/typebot.io/issues/36) from baptisteArno/feat/workspaces [[0e3ee9b](https://github.com/baptisteArno/typebot.io/commit/0e3ee9bee30200c999da8ead691c2a6be8276254)]

<a name="2.0.0"></a>

## 2.0.0 (2022-05-13)

### Added

- ✅ Fix e2e tests [[e268638](https://github.com/baptisteArno/typebot.io/commit/e268638786310cd0ade6967825ea3dd212a5f78f)]
- 🔊 Log incoming data to investigate inconsistency [[9213dd3](https://github.com/baptisteArno/typebot.io/commit/9213dd33feb1656ed4716f1138df1b27e48ad9dc)]
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
- 📈 Add Plausible Analytics [[bdfd7ac](https://github.com/baptisteArno/typebot.io/commit/bdfd7ac1bc22aecad5d1a7cc5da2cc9d6a0e6baf)]
- ✨ Add support bubble [[f897102](https://github.com/baptisteArno/typebot.io/commit/f8971022197d3654dc54b19fedb1d1d46ba2fb01)]
- ✨ Add coupon code input [[b345131](https://github.com/baptisteArno/typebot.io/commit/b345131b0b352e6f8abb96f52a796da3a55f4c83)]
- ✨ Add link support in text bubbles [[0338aca](https://github.com/baptisteArno/typebot.io/commit/0338acae82120666d6448fcbeb956a89df0031f6)]
- ✨ Add retry bubbles [[8c8d77e](https://github.com/baptisteArno/typebot.io/commit/8c8d77e052013819c30d38d35ca1b4935a16132f)]
- ✨ Add send email integration [[d6238b3](https://github.com/baptisteArno/typebot.io/commit/d6238b3474e9dda8c5d8db514c72dbfbefa2354d)]
- ✨ Add lead generation template [[1f320c5](https://github.com/baptisteArno/typebot.io/commit/1f320c5d99c52995f3edac8af75ee7da462c767c)]
- ✨ Add unlock/lock sidebar [[1c5bd06](https://github.com/baptisteArno/typebot.io/commit/1c5bd06657bdd1453155965cf715af46c6e5e86c)]
- ✨ Add custom css settings [[21448bc](https://github.com/baptisteArno/typebot.io/commit/21448bcc8a56578e2ca5b12d6bb7672771709586)]
- ✨ Add chat theme settings [[b0abe5b](https://github.com/baptisteArno/typebot.io/commit/b0abe5b8fa5f88b912dd3d1821ce986c88f1d278)]
- ✅ Add general theme settings tests [[619d10a](https://github.com/baptisteArno/typebot.io/commit/619d10ae4e161c27a970d2cb453af9af13984f32)]
- ✨ Add auto save [[079cf5e](https://github.com/baptisteArno/typebot.io/commit/079cf5ec57fe09c4ae2e80061b6287162dad2991)]
- ✨ Add webhooks [[a58600a](https://github.com/baptisteArno/typebot.io/commit/a58600a38a9be025d956dd3dbda9d0020a70b630)]
- ✨ Add video bubble [[df2474e](https://github.com/baptisteArno/typebot.io/commit/df2474ef43c1ea4159dfe2ee2083748cfc5e91b3)]
- ✨ Add image bubble [[2d17897](https://github.com/baptisteArno/typebot.io/commit/2d178978ef79c78a6c10a07d72886ffdefb2536a)]
- ✨ Add Redirect step [[c43fd1d](https://github.com/baptisteArno/typebot.io/commit/c43fd1d386a8321b8461a0c468ee3dd081e48a97)]
- ✨ Add Google Analytics integration [[3506d86](https://github.com/baptisteArno/typebot.io/commit/3506d86d50a8994aa8b67a6808d9ce89f594c196)]
- ✨ Add Google Sheets integration [[f49b514](https://github.com/baptisteArno/typebot.io/commit/f49b5143cf6f6e06626929d46e2b05dde3317a77)]
- ✨ Add Condition step [[2814a35](https://github.com/baptisteArno/typebot.io/commit/2814a352b2f8db4b915a202d795c2750d231e650)]
- ✨ Add Set variable step [[4ccb7bc](https://github.com/baptisteArno/typebot.io/commit/4ccb7bca49aa10b6ebca09eba0274346814dfa04)]
- ✅ Add Button targets e2e tests [[13f72f5](https://github.com/baptisteArno/typebot.io/commit/13f72f5ff7dab08671542c5a644c0d77dc908c9d)]
- ✨ Add Export flow menu button [[659f50e](https://github.com/baptisteArno/typebot.io/commit/659f50eb06a01f0277836ac51b5b0ad1c42e20ef)]
- ✨ Add buttons input [[c02c61c](https://github.com/baptisteArno/typebot.io/commit/c02c61cd8ba2b62a31f3330ddfd6b4813be81b4d)]
- ✨ Add Phone number input [[b20bcb1](https://github.com/baptisteArno/typebot.io/commit/b20bcb14083619868c3ba971c41d60a92ca553ef)]
- ✨ Add Date input [[8cba7ff](https://github.com/baptisteArno/typebot.io/commit/8cba7ff37bc18fb41ef71c021fd741df39faf586)]
- ✨ Add URL input [[ce1b23a](https://github.com/baptisteArno/typebot.io/commit/ce1b23a0e7874548f75ee729fb12aed99cf132a3)]
- ✨ Add email input [[47162cb](https://github.com/baptisteArno/typebot.io/commit/47162cb28afb58e83458cd344ba18c27f6ad9787)]
- ✨ Add number input [[d54ebc0](https://github.com/baptisteArno/typebot.io/commit/d54ebc0cbe62fc253b513cbbccb7d03ca173516e)]
- ✅ Add e2e tests [[2a04030](https://github.com/baptisteArno/typebot.io/commit/2a040308db7b4ea357da04e74834105e6346dabc)]
- ✨ Add text options [[f712c7a](https://github.com/baptisteArno/typebot.io/commit/f712c7ad98d04536965f95bc3d254bb9bc1cffb3)]

### Changed

- ⚡ Image picker and dynamic preview [[a89f4ec](https://github.com/baptisteArno/typebot.io/commit/a89f4ec5b60c674f49e94c7168e1f814d8914187)]
- ♿ Trap block title focus [[46f5d5d](https://github.com/baptisteArno/typebot.io/commit/46f5d5df9138974cf0727ec9c6706f574899caf6)]
- ⚡ Rename variable button [[2b56f83](https://github.com/baptisteArno/typebot.io/commit/2b56f83d4366861c81e8d47e86481fd7b437c96a)]
- 💄 Support bubble icon [[1becdad](https://github.com/baptisteArno/typebot.io/commit/1becdad79e6198d00e9810c23a47b62975481677)]
- 🎨 Formatting [[fe26e89](https://github.com/baptisteArno/typebot.io/commit/fe26e8990286e6cea1ad5d4bb2af4a323e3523a0)]
- 💄 Better chat widget icon [[a2cfecc](https://github.com/baptisteArno/typebot.io/commit/a2cfecc16c7f13b47820034a7c2ddd65a6b5463e)]
- 💄 Better long text input [[e339cc1](https://github.com/baptisteArno/typebot.io/commit/e339cc16725984ec0597a4e0cd33318e4556fbd2)]
- ⚡ Pass host URL params [[7b4dc47](https://github.com/baptisteArno/typebot.io/commit/7b4dc47f118b9f59fb25b43869464ed77e5b27a2)]
- 🚨 Not a number warning [[1d82940](https://github.com/baptisteArno/typebot.io/commit/1d82940ed7a6ca2d0875bdcab271b2d034f48a47)]
- ⚡ Better URL validation [[20c402a](https://github.com/baptisteArno/typebot.io/commit/20c402ad1b4043753cfe6c22c57ce10c14fe85a6)]
- ⚡ Show linked typebots results in webhook sample [[12f43cd](https://github.com/baptisteArno/typebot.io/commit/12f43cdb8877c719e81a6b932a0dba71ffae17ba)]
- ⏪ Remove credentials name check [[937621e](https://github.com/baptisteArno/typebot.io/commit/937621ee07df3adf56eff93b8d2ba2cbbf6f4580)]
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
- 🎨 Improve typebot import [[b38b114](https://github.com/baptisteArno/typebot.io/commit/b38b114f12966d14fd2cf6af6e98f1f70e380f70)]
- 🚸 Pointer events none on video embed [[378fe0f](https://github.com/baptisteArno/typebot.io/commit/378fe0fe82628db3130c2736d7951acf5440da3e)]
- 💄 Center folder title [[1653b53](https://github.com/baptisteArno/typebot.io/commit/1653b539034510fd2f33a51d4af4c1ce2a5837a4)]
- 🚸 Scrollwheel zoom too much [[59ce711](https://github.com/baptisteArno/typebot.io/commit/59ce711303587b3c5b373b2db4945f1ca7b95c3b)]
- 💄 Improve onboarding [[b6d4001](https://github.com/baptisteArno/typebot.io/commit/b6d40016cdad6ff4b65e963d9eee71aa22bc1df5)]
- ♿ Improve graph navigation setting [[4502e68](https://github.com/baptisteArno/typebot.io/commit/4502e68065c5daf19285c3909f0c62935f1bad81)]
- ♿ Lowercase resiliency on &quot;contains&quot; operator [[519723b](https://github.com/baptisteArno/typebot.io/commit/519723b2d895bea93abcc5ec005f6ce81d617c7d)]
- ♿ Add more getting started videos [[eb4feb6](https://github.com/baptisteArno/typebot.io/commit/eb4feb61bdbebf4632cba403b8a539147f41132e)]
- ♿ Getting started editor modal [[786908e](https://github.com/baptisteArno/typebot.io/commit/786908e9cfbf1b1f3673ff14de58312e0ff29dcd)]
- ♻️ Simplify header [[1fdf7e7](https://github.com/baptisteArno/typebot.io/commit/1fdf7e734b41df8befca1589750277c7eb119962)]
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
- ⏪ Make sure old viewer URL still works [[b16c47a](https://github.com/baptisteArno/typebot.io/commit/b16c47adb9ce024f75ca316e1937d596f657555c)]
- ♿ Improve inputs responsivity [[03aadab](https://github.com/baptisteArno/typebot.io/commit/03aadab4094c0460c85c3c2c29f192e7faf5b04e)]
- 🚸 Add Reply-To field for email sending [[ddb6798](https://github.com/baptisteArno/typebot.io/commit/ddb6798eba8b29e421674ca0b1e1c5cb7b51bf8e)]
- 🗃️ Add custom domain primary key [[a533552](https://github.com/baptisteArno/typebot.io/commit/a533552b40f2475a673c5603809cefa447beb77b)]
- ♻️ Migrate from short-uuid to cuid lib [[1423c14](https://github.com/baptisteArno/typebot.io/commit/1423c145472f86af6fb78a5e9496da46119fb416)]
- 💄 Remove v2 annoucements [[64bafd1](https://github.com/baptisteArno/typebot.io/commit/64bafd15a1af6a925efd142dc9b31872e7ad3599)]
- 💄 New README illustration [[d8fe530](https://github.com/baptisteArno/typebot.io/commit/d8fe53012dc0a4b1e35aaa33f4e5f46a79daf004)]
- 💄 Small visual fixes [[52b7733](https://github.com/baptisteArno/typebot.io/commit/52b773379e880083be3b32438d290d6ce330b82c)]
- 💄 Add interactive indications [[d0ece4c](https://github.com/baptisteArno/typebot.io/commit/d0ece4cc8fc1320ca91e8540c86e227157af1221)]
- 💄 Change buttons primary color [[76a8bcf](https://github.com/baptisteArno/typebot.io/commit/76a8bcfbaec4d19cc3335d4862dd9586b1daccff)]
- 💄 Add animation on scroll [[37b7ca3](https://github.com/baptisteArno/typebot.io/commit/37b7ca32e99953e6aa61c8277ba7932e878d8d84)]
- 💄 Refont LP for v2 [[21e926a](https://github.com/baptisteArno/typebot.io/commit/21e926a477b55bea0d7cda17fcddfadba7d12afc)]
- 💄 Better README illustration [[aeb0643](https://github.com/baptisteArno/typebot.io/commit/aeb06433af677fefc583cd873ef4c12102414e61)]
- 🎨 Deploy v2.1.0 [[8f07df8](https://github.com/baptisteArno/typebot.io/commit/8f07df8a05366f5e95ffb73fa687528cdc7945d3)]
- 🎨 Update instructions for 2.2.0 [[69701d1](https://github.com/baptisteArno/typebot.io/commit/69701d12b90eecbc4bc66b065ab81f8e01aaded6)]
- 🎨 Ask for URL instead of publishId [[5a2df9f](https://github.com/baptisteArno/typebot.io/commit/5a2df9fe727273462a7c428988cfe5a22b0c3832)]
- 🏗️ Add docker image and deployment features [[e886d1b](https://github.com/baptisteArno/typebot.io/commit/e886d1b0794f310741b69d982b1cb0a6742f7fc4)]
- ♻️ Migrate to dequal [[5c524a0](https://github.com/baptisteArno/typebot.io/commit/5c524a0432513c4e30eb2760cd25b7dc82661d30)]
- 🏗️ Import typebot-js source [[d134a26](https://github.com/baptisteArno/typebot.io/commit/d134a265cd8a7b667c78dc3f66d3e5d9a5054d7e)]
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
- 🏗️ Add minio in local config [[7045c02](https://github.com/baptisteArno/typebot.io/commit/7045c02a15168ddf3a4a89f8fe3cac6765accae3)]
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
- 🏗️ Add script package [[eb23ad6](https://github.com/baptisteArno/typebot.io/commit/eb23ad61a7bf87e49ea4609fe06c8edf985ee9d6)]
- 🏗️ Add wordpress plugin [[27bff8c](https://github.com/baptisteArno/typebot.io/commit/27bff8c4b775ba770ec453024ca1c71a8ba0f4de)]
- 🚚 Add /typebot-lib/v2 endpoint [[64990fc](https://github.com/baptisteArno/typebot.io/commit/64990fc6074f055b0d1f26fb3918c562502d9907)]
- ♻️ Remove any trace of Cypress [[658202e](https://github.com/baptisteArno/typebot.io/commit/658202eaee425e44a1233ef52ec848ac1a84aa1d)]
- 🗃️ Add createdAt and updatedAt [[a499d85](https://github.com/baptisteArno/typebot.io/commit/a499d85c9804c575863bcd757d0c6ae9dccbb68b)]
- 🗃️ Add api token [[5a80774](https://github.com/baptisteArno/typebot.io/commit/5a80774ff5467812b995be2b28c38cf3f06d24be)]
- 💄 Change social logins buttons [[c5972ec](https://github.com/baptisteArno/typebot.io/commit/c5972ec91b30aec55027eb8dbd4b358ff88397d9)]
- 🔧 Ignore Resize exceeded error in Sentry [[3313bda](https://github.com/baptisteArno/typebot.io/commit/3313bdaa8a0a4931ed87002f651d0a6daa5899b7)]
- 💄 Make steps side bar scrollable [[f7d6f0b](https://github.com/baptisteArno/typebot.io/commit/f7d6f0b766e9b503e718062323b043a35ffa33cf)]
- 💄 Social login colored logos [[00c3588](https://github.com/baptisteArno/typebot.io/commit/00c35886a4473fea7868fd92c720f2f08e2d91ae)]
- ♿ Improve code editor readiness [[daaa8a0](https://github.com/baptisteArno/typebot.io/commit/daaa8a0a2d344d5850c38f936f4450e308ca62e1)]
- 🏗️ Add sentry to viewer [[b339add](https://github.com/baptisteArno/typebot.io/commit/b339add83866f13074c4dd1f2b0d1c4144c7ce9b)]
- ♿ Save both bots when updating name or publicId [[2eee226](https://github.com/baptisteArno/typebot.io/commit/2eee226a88ffa8e7fc5adf7af8cfb53bda651015)]
- ⚡ Improve graph transition perf [[714f7c8](https://github.com/baptisteArno/typebot.io/commit/714f7c8ce505f4bae901e55e5ae81dadfecbd373)]
- ⚡ Add docs and connect Stripe [[56bd5fa](https://github.com/baptisteArno/typebot.io/commit/56bd5fafc38f1a50053d43e9b7bc5ffd5a26a6bb)]
- 🏗️ Remove frame security headers on LP [[aeb3e4c](https://github.com/baptisteArno/typebot.io/commit/aeb3e4caa7f74675472901da3ce4c30e78f471a8)]
- 🏗️ include sentry.properties [[e2606eb](https://github.com/baptisteArno/typebot.io/commit/e2606ebf1193c5de23439ecb3cbd49604be38bca)]
- 🏗️ Add Sentry to builder [[8501d39](https://github.com/baptisteArno/typebot.io/commit/8501d39234bf312a3dc0fe99cbaa68f795d9c549)]
- ♻️ Better S3 env var format [[9c20ef0](https://github.com/baptisteArno/typebot.io/commit/9c20ef00b931e194526a8194474c8de24f96aa1d)]
- ⚡ Add msw and mock authentication [[b1f54b7](https://github.com/baptisteArno/typebot.io/commit/b1f54b77c687f03d95830e044d559cfab396154c)]
- ♻️ Revert tables to arrays [[524ef08](https://github.com/baptisteArno/typebot.io/commit/524ef0812c60a23e3e63a9f2db587a06cb392714)]
- ♻️ Undo / Redo buttons + structure refacto [[8a350ee](https://github.com/baptisteArno/typebot.io/commit/8a350eee6c93abec6bce40351a0b4ef0b854defe)]
- ⚡ Migrate to Playwright [[73f277f](https://github.com/baptisteArno/typebot.io/commit/73f277fce7078f70e89702f2aa30daa8b3a7a218)]
- ♻️ Add defaults everywhere (+ settings page)): [[c5aaa32](https://github.com/baptisteArno/typebot.io/commit/c5aaa323d1d5a4d684d51f071284663a864de713)]
- ♻️ Add Edges table in Typebot [[8bbd897](https://github.com/baptisteArno/typebot.io/commit/8bbd8977b2697e616ca38e4880397af85e7440a0)]
- 💄 Face lift [[44b4785](https://github.com/baptisteArno/typebot.io/commit/44b478550f73171caa899d27c732e6ca22afb0f3)]
- ⏪ Remove migration files and push until db is stable [[77b553a](https://github.com/baptisteArno/typebot.io/commit/77b553acf5b1ba1d121620a9f8ad140cc611f9d5)]
- ♻️ Normalize data [[9fa4c7d](https://github.com/baptisteArno/typebot.io/commit/9fa4c7dffa4b7ef6fa67a5205400fd6781664e21)]
- 🔧 Optimize bot-engine [[90d7a73](https://github.com/baptisteArno/typebot.io/commit/90d7a7343ef556ac585049d9082f5247a8156cbb)]

### Removed

- 🔥 Remove save button [[1b900b3](https://github.com/baptisteArno/typebot.io/commit/1b900b3f5d8f4f31bec99ea69080645955f09a75)]

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

### Security

- 🔒 Enforce Sheets security [[78c4596](https://github.com/baptisteArno/typebot.io/commit/78c4596e9348f872576234a692fcf6b1fd8044e1)]
- 🔒 add checking for required group [[3db753e](https://github.com/baptisteArno/typebot.io/commit/3db753e886955f7f534d0d0af7f18beb96c845c9)]
- 🔒 add gitlab provider [[a4a62f2](https://github.com/baptisteArno/typebot.io/commit/a4a62f23b6595166fb660134a258f6569d7f512e)]
- 🔒 Still investigating sheets creds issue [[606932a](https://github.com/baptisteArno/typebot.io/commit/606932a77e030296d200472fcbb3a48a0ed7b5ff)]
- 🔒 Investigate on why spreadsheets sometimes fail [[bdd7a17](https://github.com/baptisteArno/typebot.io/commit/bdd7a1712eb7995a241ac6771ec03814659f927a)]
- 🔒 Enforce credentials security [[ed68096](https://github.com/baptisteArno/typebot.io/commit/ed680969f9e3acc3404d52952b983cd601a9ec09)]
- 🔒 Better guard spreadsheets GET [[97ba29f](https://github.com/baptisteArno/typebot.io/commit/97ba29f80193dff79abe821c9cfc92f7822aabe5)]
- 🔒 Change Google fonts key [[89ac0f8](https://github.com/baptisteArno/typebot.io/commit/89ac0f89cd440fa526cd6db3e746bd3317e378dd)]
- 🔒 Add extra user check in api [[ec18912](https://github.com/baptisteArno/typebot.io/commit/ec18912879f48a240288cb0260d4bf46ba6bb6c2)]

### Miscellaneous

- 📦 Update packages [[6c29865](https://github.com/baptisteArno/typebot.io/commit/6c2986590b79d9a16d4e747f2b89e975eeef5147)]
- 📝 Fix links and update doc [[ddaaa68](https://github.com/baptisteArno/typebot.io/commit/ddaaa68e282f1f702c8ddd10fda4a3b9412279b4)]
- 📝 Webhook block [[2271da8](https://github.com/baptisteArno/typebot.io/commit/2271da8870448a2e2128ed696abaf792ab7c1939)]
- 📝 Theme [[a848fa0](https://github.com/baptisteArno/typebot.io/commit/a848fa0a15da679b1384a1177174435d2004f0ff)]
- 📝 Email block [[f5404f9](https://github.com/baptisteArno/typebot.io/commit/f5404f96d5af656078ec3772fef0ea2873994247)]
- Merge pull request [#35](https://github.com/baptisteArno/typebot.io/issues/35) from baptisteArno/fix/google-font-error [[176cb4e](https://github.com/baptisteArno/typebot.io/commit/176cb4ed552c7a08c38174376cb784a521f20e19)]
- 📝 Typing emulation [[bf766e5](https://github.com/baptisteArno/typebot.io/commit/bf766e5cd90ea46e6875bbd3b5a239f2d3a13c20)]
- Merge pull request [#32](https://github.com/baptisteArno/typebot.io/issues/32) from laurin-wolf/10-add-gitlab-idp [[a863a4c](https://github.com/baptisteArno/typebot.io/commit/a863a4cb21a4c987d360cf610d3325b49c71d119)]
- 📦 Update typebot lib declarations [[1139569](https://github.com/baptisteArno/typebot.io/commit/113956929303325d1c810f56996c4d831c8e9464)]
- 🛂 Temporarily disable Make.com [[cff5ec6](https://github.com/baptisteArno/typebot.io/commit/cff5ec67deae7125b9e70ba6d780c0a319781a14)]
- 📝 add gitlab idp env variables [[b2b0685](https://github.com/baptisteArno/typebot.io/commit/b2b0685298d5417475b21885d5b198a3a9a306bb)]
- Merge branch &#x27;main&#x27; of https://github.com/baptisteArno/typebot.io [[f788541](https://github.com/baptisteArno/typebot.io/commit/f7885415d84c97dbec70f42c13fbcae6f12ad333)]
- 🚧 Help to debug evaluated expressions [[e1d7533](https://github.com/baptisteArno/typebot.io/commit/e1d7533384f792e4f7158619ee820ae5a0b1a38a)]
- fix(auth):🐛explicitly set linkAccount user values , [#10](https://github.com/baptisteArno/typebot.io/issues/10) [[97b14f1](https://github.com/baptisteArno/typebot.io/commit/97b14f19f089c2e68f4d88ffbf8b58f1a1633dd2)]
- 📝 Add callback URL instructions [[e569e59](https://github.com/baptisteArno/typebot.io/commit/e569e59699dd8b4e102f2d193f54771b112116e2)]
- 📝 Simplified API endpoints [[29254f6](https://github.com/baptisteArno/typebot.io/commit/29254f675c6d0c1364ee3d22762e32140dd3fff3)]
- 📝 Improve configuration doc [[18319c8](https://github.com/baptisteArno/typebot.io/commit/18319c88c8b46db30e93c0d40da00c71e0401675)]
- Merge pull request [#24](https://github.com/baptisteArno/typebot.io/issues/24) from baptisteArno/feat/disable-smtp-auth [[1820686](https://github.com/baptisteArno/typebot.io/commit/18206866b8fb59f75822f78ec6d922b2b4b49ca6)]
- feat(auth): 👷 Disable smtp auth [[c657850](https://github.com/baptisteArno/typebot.io/commit/c6578505a511e46e6d7cb977d313efc6a3c9ce0f)]
- 📝 Add about page [[6a8d6d4](https://github.com/baptisteArno/typebot.io/commit/6a8d6d4d9a7e88a0352b3707fa1422e35c06a6db)]
- 📝 Better explain base url config [[a5491dc](https://github.com/baptisteArno/typebot.io/commit/a5491dc7a87f51f2cff6b35c5d217c63a06fd87d)]
- 📝 Add Lead Scoring template [[a08618d](https://github.com/baptisteArno/typebot.io/commit/a08618d24ebace50c4cd7a450c9dfb7e0796da86)]
- 📝 Condition block [[b1d30fc](https://github.com/baptisteArno/typebot.io/commit/b1d30fcb3bd965ab0ca293669fef058f9048708e)]
- Merge pull request [#21](https://github.com/baptisteArno/typebot.io/issues/21) from baptisteArno/feat/zoom [[47947a6](https://github.com/baptisteArno/typebot.io/commit/47947a6a142951b9148a1812eaec6434ba39cfbe)]
- build: 👷 Add Sentry context [[fb3bba8](https://github.com/baptisteArno/typebot.io/commit/fb3bba897f844e9f51dc1158909ac541f91c18c9)]
- 📝 Add Quizz [[5aac822](https://github.com/baptisteArno/typebot.io/commit/5aac8229d2b888348dd7b88948076cd3ce944da2)]
- 💫 Add name in user creation webhook [[4c9f97b](https://github.com/baptisteArno/typebot.io/commit/4c9f97b25470253da7735060096435b4125fd51a)]
- Merge pull request [#20](https://github.com/baptisteArno/typebot.io/issues/20) from baptisteArno/fix/delete-collaborator [[6314ce2](https://github.com/baptisteArno/typebot.io/commit/6314ce2f6259dca659cbc08b9a916d5941c0283a)]
- Merge branch &#x27;main&#x27; of https://github.com/baptisteArno/typebot.io [[6ba6466](https://github.com/baptisteArno/typebot.io/commit/6ba646618d217c7476a89758fba99f13936925df)]
- Merge pull request [#18](https://github.com/baptisteArno/typebot.io/issues/18) from baptisteArno/fix/docker-prod [[5ce0212](https://github.com/baptisteArno/typebot.io/commit/5ce021247638185e7b857f57d2d80586d85701f7)]
- Merge pull request [#16](https://github.com/baptisteArno/typebot.io/issues/16) from baptisteArno/fix/uprade-modal-directory-typo [[a6a2fcc](https://github.com/baptisteArno/typebot.io/commit/a6a2fccdb8dd4a752f4372503ba660e73786bbf7)]
- Merge pull request [#14](https://github.com/baptisteArno/typebot.io/issues/14) from baptisteArno/fix/linked-typebot [[5903120](https://github.com/baptisteArno/typebot.io/commit/59031206aec39ab07542e9d41f1fd3f4b333ec26)]
- 📦 Update packages [[0500981](https://github.com/baptisteArno/typebot.io/commit/05009814d4afcaebc57d0e1fea22c926efb808a2)]
- 📝 Add privacy policies explanation [[e653ced](https://github.com/baptisteArno/typebot.io/commit/e653cedee92442feb7f6bfa3f4c8fb5223e00871)]
- 📝 Add &quot;Set variable&quot; doc [[af9e08f](https://github.com/baptisteArno/typebot.io/commit/af9e08fea0a76149d01b4124f6b4705d65740433)]
- 🛂 Make sure booleans are parsed in table [[f7d12dc](https://github.com/baptisteArno/typebot.io/commit/f7d12dc9954ff9c984fbd11f28eb91bc1e9a8125)]
- 🛂 Improve collab permissions [[bb194b1](https://github.com/baptisteArno/typebot.io/commit/bb194b1dbbcf6b8bfc4af64e124d98e3531e8566)]
- 📝 Add &#x60;hiddenVariables&#x60; JS instructions [[38c39d4](https://github.com/baptisteArno/typebot.io/commit/38c39d4a3130de6b775ae0b48156337c0c0a30a9)]
- build(self-host): 👷 Add chown Dockerfile [[f9a30bc](https://github.com/baptisteArno/typebot.io/commit/f9a30bc4ca9228b10bc08773e724e8d092213443)]
- 📝 Add License paragraph in README [[3a7078d](https://github.com/baptisteArno/typebot.io/commit/3a7078d0d05338020f34e1a2fb5d4a16d6927ef9)]
- 🚩 Add webhook url call on user creation [[39b0143](https://github.com/baptisteArno/typebot.io/commit/39b01431e026a33d08ad2b0885942351ecb99b73)]
- 🛂 Make sure branding is forced on file import [[0704213](https://github.com/baptisteArno/typebot.io/commit/07042137fb79ada80b57b1873cdfefd14373ab8d)]
- 📝 Add &quot;Stay up-to-date&quot; section in README [[bd702f2](https://github.com/baptisteArno/typebot.io/commit/bd702f2ebab8f4168e32de4e3ddc4b038d20a9b9)]
- 📝 Add 3rd testimonial [[d4022c6](https://github.com/baptisteArno/typebot.io/commit/d4022c6e3fb5aca1da3e1f8d8bf59a37bfe459eb)]
- 📝 Update typebot URL in embed instructions [[71816f7](https://github.com/baptisteArno/typebot.io/commit/71816f76ad54c1f264072abe4492264b722d9f07)]
- 📝 Fix A record CM name [[53fb34d](https://github.com/baptisteArno/typebot.io/commit/53fb34d2adda98cf99ec4c3097af05fd04d5f658)]
- 📝 Add &quot;Human takeover&quot; faq [[3d4f90d](https://github.com/baptisteArno/typebot.io/commit/3d4f90de16b763e723c5ae8ab720c6a32b4153ef)]
- 📝 Change SEO related info [[8ba231f](https://github.com/baptisteArno/typebot.io/commit/8ba231f39305c4647bc8f236859151cbba7740b7)]
- 🩹 Fix build [[ec8a27e](https://github.com/baptisteArno/typebot.io/commit/ec8a27e972f5d72841d38967e84ddaf0b3584663)]
- 📝 Update env var and write Configuration doc [[69248f9](https://github.com/baptisteArno/typebot.io/commit/69248f94d49e8361d22dd6473a247f94a74d033b)]
- 📝 Update README and contribution instructions [[b37db3c](https://github.com/baptisteArno/typebot.io/commit/b37db3cee3f62eba6a2bd5085e08e87da82ad4b4)]
- 📝 Add Google Sheets video [[6cf89d8](https://github.com/baptisteArno/typebot.io/commit/6cf89d8d9c468faa562935d51f6c2350757357e3)]
- 📝 Add RTL guide [[533fdb1](https://github.com/baptisteArno/typebot.io/commit/533fdb1b3a293f75380bfcc583d8b031ce4b5420)]
- 📝 Update feedback board links [[e73fce3](https://github.com/baptisteArno/typebot.io/commit/e73fce3907acb8e4b96b8544d1c9d90219b3e703)]
- build: 👷 Add Plan in support bubble [[380eae5](https://github.com/baptisteArno/typebot.io/commit/380eae545b16ef209a34d21a8d762be6da6daed4)]
- 📝 Init cool README (WIP) [[63a90f2](https://github.com/baptisteArno/typebot.io/commit/63a90f2deb3ff35a0fcd3d18c9282b5f56e49921)]
- chore: 👷 Add user info on Google sheets endpoints for Sentry [[0e14a23](https://github.com/baptisteArno/typebot.io/commit/0e14a238be9f071955b951ab4858eb7f457b5657)]
- 📝 Remove the 3 months notice on FAQ [[4bb5a57](https://github.com/baptisteArno/typebot.io/commit/4bb5a57f695168c5ff41fb24b72c747beda90bd1)]
- fix(hotfix): [[cc1dd51](https://github.com/baptisteArno/typebot.io/commit/cc1dd5152ea3fe59e9aa32da70326260587b6017)]
- 📝 Add API overview [[3ecde23](https://github.com/baptisteArno/typebot.io/commit/3ecde23e51a4c6274eabdee44143584830983e3e)]
- 📄 Change patch webhook to post [[1c758d3](https://github.com/baptisteArno/typebot.io/commit/1c758d39e5c3653a2d97c2b4f492d3db38bba7ac)]
- 🩹 Switch from stepId to id (for Zapier) [[e3704f6](https://github.com/baptisteArno/typebot.io/commit/e3704f6dd9586ac163f572d840ce24742a654ce4)]
- 📝 Add MailerLite guide [[37ef56b](https://github.com/baptisteArno/typebot.io/commit/37ef56bfc4ee345c7ecf40575538c8ff20a0afa2)]
- 📝 Default retry message bubble [[feb966d](https://github.com/baptisteArno/typebot.io/commit/feb966d51314c2cbbd775e7bc73930043698fe32)]
- 🛂 Add god rule to view typebots [[5d9356b](https://github.com/baptisteArno/typebot.io/commit/5d9356bd9cfb2f55de126c21e4a33976d232539a)]
- 🛂 Protect from others to consult typebots and folders [[f6d5eb5](https://github.com/baptisteArno/typebot.io/commit/f6d5eb577755e9f28c27265c3fe263ea8749e009)]
- 🛂 Add context variables to support typebot [[7402ad5](https://github.com/baptisteArno/typebot.io/commit/7402ad5f6d6bdafaca6b867f4f1810695bf2c03e)]
- 📝 Variables doc [[9b9e0f6](https://github.com/baptisteArno/typebot.io/commit/9b9e0f6312eacdfe8eca6eb61386fdc167222587)]
- ci: 👷 Add connection pooling DB [[1c178e0](https://github.com/baptisteArno/typebot.io/commit/1c178e01a67a5e68a2b8ce6bd3d4939217b601f9)]
- fix: Fix db critical [[558a603](https://github.com/baptisteArno/typebot.io/commit/558a60329d9e398fd4b455e049a0e2470e1705c6)]
- build: 👷 Fix error page [[7ebfd43](https://github.com/baptisteArno/typebot.io/commit/7ebfd43db82fd1c3fa935e7434692c9075fcecb3)]
- fix(editor): source endpoint even on buttons step [[0336bc2](https://github.com/baptisteArno/typebot.io/commit/0336bc2a421ccfd4560f86ea4fecac69297a6652)]
- 🩹 Avatar scroll on media bubbles [[1d3917f](https://github.com/baptisteArno/typebot.io/commit/1d3917f4403ca968e79bcb3ce68a9573ae7166cf)]
- 🩹 Vs pages typebot [[b1916e4](https://github.com/baptisteArno/typebot.io/commit/b1916e4f9c19c5b3f9ad4d76e78fa8555dbd1029)]
- 📝 Add 2.0 annoucement modal [[ab9c55e](https://github.com/baptisteArno/typebot.io/commit/ab9c55e2971893623d51c596c36d0c348b71c056)]
- 📝 Add FAQ [[c502bbb](https://github.com/baptisteArno/typebot.io/commit/c502bbb93bb86936c909f914381f6fc694b6f1a7)]
- build: 👷 Remove Sentry traceSampling [[a8a03fb](https://github.com/baptisteArno/typebot.io/commit/a8a03fbcf2f51e13960fa7ca4cae7b10b2cbe2da)]
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
- 📝 Add code blocks in embed instructions [[276f1c1](https://github.com/baptisteArno/typebot.io/commit/276f1c1e90f7c36d7329d3410e634d0aed73daf1)]
- 🗑️ Clean up gitignores [[c66827b](https://github.com/baptisteArno/typebot.io/commit/c66827b606f2708a4dbcffb05b8043356ce0843a)]
- 📦 Import existing Landing page [[36be357](https://github.com/baptisteArno/typebot.io/commit/36be3577e19aa7f9ef42fe08575da27afb2c103b)]
- 📝 Add embed instructions [[65b30bf](https://github.com/baptisteArno/typebot.io/commit/65b30bfc489fdfebc8e8a047383840cf9ff6ea7f)]
- 🩹 typebot buttons menu [[fc1d654](https://github.com/baptisteArno/typebot.io/commit/fc1d6547720fb6d3cd5fa22f90d7254819d6f94e)]
- chore(e2e): 👷 Fix e2e pipeline [[02bd2b9](https://github.com/baptisteArno/typebot.io/commit/02bd2b94ba2c4f61f88c1501e3c57e35a8525517)]
- ci(deployment): 👷 Add e2e tests on Vercel deployment [[65209c2](https://github.com/baptisteArno/typebot.io/commit/65209c26387420bbfde0f7d2d12f9fbb805a534d)]
- ⚗️ Add export results [[6c1e0fd](https://github.com/baptisteArno/typebot.io/commit/6c1e0fd345ba0d81f418236a85b20518ffa764bd)]
- ⚗️ Add infinite scroll in results table [[72454c0](https://github.com/baptisteArno/typebot.io/commit/72454c0f68b870c0a59992d34e8f86af677584c6)]
- ⚗️ Add delete results logic [[8ddf608](https://github.com/baptisteArno/typebot.io/commit/8ddf608c9ecd71376cf4125e74899e4b4e60a9cc)]
- 🧪 Add delete tests on dashboard [[6db34a8](https://github.com/baptisteArno/typebot.io/commit/6db34a8d4f3b8b7ef736b3ea355223c1305952d2)]
- 🖐️ Analytics drop off rates [[6322402](https://github.com/baptisteArno/typebot.io/commit/6322402c96265b78890c8143e72c5beebfc6c528)]
- 🪥 Consult submissions [[1093453](https://github.com/baptisteArno/typebot.io/commit/1093453c07f7ff99b9a9cfb1be4947ba098f2499)]
- 🧰 Aggregate utils &amp; set up results collection in viewer [[f088f69](https://github.com/baptisteArno/typebot.io/commit/f088f694b97cf591a37053a4aa8adf7d77999b37)]
- 🧯 Fix template page [[447172d](https://github.com/baptisteArno/typebot.io/commit/447172d0cb436fe5fa69c1d835855989000a4352)]
- Add e2e tests for account [[8c826fc](https://github.com/baptisteArno/typebot.io/commit/8c826fcf709ad4d8f199ad1e48d7e1883c9246ea)]
- Add user account page [[e10fe1a](https://github.com/baptisteArno/typebot.io/commit/e10fe1a1868054e8b7683c7701274d8d4ad1469f)]
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
- Add Graph draft [[da9459e](https://github.com/baptisteArno/typebot.io/commit/da9459edf3b244145c742b5168c54b290f7066d9)]
- Update README.md [[0f85d2c](https://github.com/baptisteArno/typebot.io/commit/0f85d2cd94e39d1fd138c227dce493126f600bf8)]
- Create LICENSE [[e3ab332](https://github.com/baptisteArno/typebot.io/commit/e3ab3320349e7a65692a2f6d38627a910f1252de)]
- Create FUNDING.yml [[dd3d11b](https://github.com/baptisteArno/typebot.io/commit/dd3d11bcb34ccf50814c2fe78038ba247fe240d5)]
- 🚀 Init bot-engine [[9dbad1d](https://github.com/baptisteArno/typebot.io/commit/9dbad1dbab22cf9a20d959ffbced6fff5ba1e74f)]
- 💅 Renamed prisma package to db [[641ba3d](https://github.com/baptisteArno/typebot.io/commit/641ba3db8af43d1dd9940b1d9ab2426a13c6d950)]
- 📤 Remove workspace file from git [[17665de](https://github.com/baptisteArno/typebot.io/commit/17665def128efaa2914286f993e0aa6497a0cfb7)]
- 🧯 Fix auth with db sessions [[575361e](https://github.com/baptisteArno/typebot.io/commit/575361ec19036b4b8e7d7e16d1c0fb1a69d61ca5)]
- 🖨️ Add prisma deploy script [[e2659b4](https://github.com/baptisteArno/typebot.io/commit/e2659b49e8a49e3ae72f9d0047bb10689c4adf86)]
- Add Dashboard [[54a641b](https://github.com/baptisteArno/typebot.io/commit/54a641b819c2c83a474bc6e1b708e2218d0162ea)]
- Add authentication [[5e14a94](https://github.com/baptisteArno/typebot.io/commit/5e14a94dea907712b6bb43ec963e04355f4a3cb5)]
- Set node-linker to node_modules [[68dd491](https://github.com/baptisteArno/typebot.io/commit/68dd491eca6f812c60383c49ae2ad376513d4264)]
- Init project [[6fe9807](https://github.com/baptisteArno/typebot.io/commit/6fe9807fbe460efe673ad19b0518faca546dcbff)]
