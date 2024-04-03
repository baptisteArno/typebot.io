import jsPackageJson from '../packages/embeds/js/package.json'
import reactPackageJson from '../packages/embeds/react/package.json'
import nextjsPackageJson from '../packages/embeds/nextjs/package.json'
import { writeFileSync } from 'fs'

const currentVersion = jsPackageJson.version

const patchNumber = parseInt(currentVersion.split('.')[2], 10)

const newVersion = `${currentVersion.split('.')[0]}.${
  currentVersion.split('.')[1]
}.${patchNumber + 1}`

writeFileSync(
  './packages/embeds/js/package.json',
  JSON.stringify(
    {
      ...jsPackageJson,
      version: newVersion,
    },
    null,
    2
  ) + '\n'
)

writeFileSync(
  './packages/embeds/react/package.json',
  JSON.stringify(
    {
      ...reactPackageJson,
      version: newVersion,
    },
    null,
    2
  ) + '\n'
)

writeFileSync(
  './packages/embeds/nextjs/package.json',
  JSON.stringify(
    {
      ...nextjsPackageJson,
      version: newVersion,
    },
    null,
    2
  ) + '\n'
)
