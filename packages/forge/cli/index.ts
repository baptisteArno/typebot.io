import * as p from '@clack/prompts'
import { spinner } from '@clack/prompts'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'fs'
import { join } from 'path'
import prettier from 'prettier'
import { spawn } from 'child_process'
import builderPackageJson from '../../../apps/builder/package.json'

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const prettierRc = {
  trailingComma: 'es5',
  tabWidth: 2,
  semi: false,
  singleQuote: true,
} as const

type PromptResult = {
  name: string
  id: string
  auth: 'apiKey' | 'encryptedData' | 'none'
  camelCaseId: string
}

const main = async () => {
  p.intro('Create a new Typebot integration block')
  const { name, id } = await p.group(
    {
      name: () =>
        p.text({
          message: 'Integration name?',
          placeholder: 'Short name like: Sheets, Analytics, Cal.com',
        }),
      id: ({ results }) =>
        p.text({
          message:
            'Integration ID? (should be a slug like: cal-com, openai...)',
          placeholder: 'my-integration',
          initialValue: slugify(results.name ?? ''),
          validate: (val) => {
            if (!slugRegex.test(val))
              return 'Invalid ID. Must be a slug, like: "google-sheets".'
          },
        }),
    },
    {
      onCancel: () => {
        p.cancel('Operation cancelled.')
        process.exit(0)
      },
    }
  )

  const auth = (await p.select({
    message: 'Does this integration require authentication to work?',
    options: [
      { value: 'apiKey', label: 'API key or token' },
      { value: 'encryptedData', label: 'Custom encrypted data' },
      { value: 'none', label: 'None' },
    ],
  })) as 'apiKey' | 'encryptedData' | 'none'

  const prompt: PromptResult = {
    name,
    id: id as string,
    auth,
    camelCaseId: camelize(id as string),
  }

  const s = spinner()
  s.start('Creating files...')
  const newBlockPath = join(process.cwd(), `../blocks/${prompt.camelCaseId}`)
  if (existsSync(newBlockPath) && readdirSync(newBlockPath).length > 1) {
    s.stop('Creating files...')
    p.log.error(
      `An integration with the ID "${prompt.id}" already exists. Please choose a different ID.`
    )
    process.exit(1)
  }
  if (!existsSync(newBlockPath)) mkdirSync(newBlockPath)
  await createPackageJson(newBlockPath, prompt)
  await createTsConfig(newBlockPath)
  await createIndexFile(newBlockPath, prompt)
  await createLogoFile(newBlockPath, prompt)
  if (prompt.auth !== 'none') await createAuthFile(newBlockPath, prompt)
  await createSchemasFile(newBlockPath, prompt)
  await addBlockToRepository(prompt)
  s.stop('Creating files...')
  s.start('Installing dependencies...')
  await new Promise<void>((resolve, reject) => {
    const ls = spawn('pnpm', ['install'])
    ls.stderr.on('data', (data) => {
      reject(data)
    })
    ls.on('error', (error) => {
      reject(error)
    })
    ls.on('close', () => {
      resolve()
    })
  })
  s.stop('Installing dependencies...')
  p.outro(
    `Done! 🎉 Head over to packages/forge/blocks/${prompt.camelCaseId} and start coding!`
  )
}

const slugify = (str: string): string => {
  return String(str)
    .normalize('NFKD') // split accented characters into their base characters and diacritical marks
    .replace(/[\u0300-\u036f]/g, '') // remove all the accents, which happen to be all in the \u03xx UNICODE block.
    .trim() // trim leading or trailing whitespace
    .toLowerCase() // convert to lowercase
    .replace(/[^a-z0-9\. -]/g, '') // remove non-alphanumeric characters
    .replace(/[\s\.]+/g, '-') // replace spaces and dots with hyphens
    .replace(/-+/g, '-') // remove consecutive hyphens
}

const camelize = (str: string) =>
  str.replace(/-([a-z])/g, function (g) {
    return g[1].toUpperCase()
  })

const capitalize = (str: string) => {
  const [fst] = str

  return `${fst.toUpperCase()}${str.slice(1)}`
}

const createIndexFile = async (
  path: string,
  { id, camelCaseId, name, auth }: PromptResult
) => {
  const camelCaseName = camelize(id as string)
  writeFileSync(
    join(path, 'index.ts'),
    await prettier.format(
      `import { createBlock } from '@typebot.io/forge'
import { ${capitalize(camelCaseId)}Logo } from './logo'
${auth !== 'none' ? `import { auth } from './auth'` : ''}

export const ${camelCaseName}Block = createBlock({
  id: '${id}',
  name: '${name}',
  tags: [],
  LightLogo: ${capitalize(camelCaseName)}Logo,${auth !== 'none' ? `auth,` : ''}
  actions: [],
})
`,
      { parser: 'typescript', ...prettierRc }
    )
  )
}

const createPackageJson = async (path: string, { id }: { id: unknown }) => {
  writeFileSync(
    join(path, 'package.json'),
    await prettier.format(
      JSON.stringify({
        name: `@typebot.io/${id}-block`,
        version: '1.0.0',
        description: '',
        main: 'index.ts',
        keywords: [],
        license: 'AGPL-3.0-or-later',
        devDependencies: {
          '@typebot.io/forge': 'workspace:*',
          '@typebot.io/tsconfig': 'workspace:*',
          '@types/react': builderPackageJson.devDependencies['@types/react'],
          typescript: builderPackageJson.devDependencies['typescript'],
          '@typebot.io/lib': 'workspace:*',
        },
      }),
      { parser: 'json', ...prettierRc }
    )
  )
}

const createTsConfig = async (path: string) => {
  writeFileSync(
    join(path, 'tsconfig.json'),
    await prettier.format(
      JSON.stringify({
        extends: '@typebot.io/tsconfig/base.json',
        include: ['**/*.ts', '**/*.tsx'],
        exclude: ['node_modules'],
        compilerOptions: {
          lib: ['ESNext', 'DOM'],
          noEmit: true,
          jsx: 'preserve',
          jsxImportSource: 'react',
        },
      }),
      { parser: 'json', ...prettierRc }
    )
  )
}

const createLogoFile = async (
  path: string,
  { camelCaseId }: { camelCaseId: string }
) => {
  writeFileSync(
    join(path, 'logo.tsx'),
    await prettier.format(
      `/** @jsxImportSource react */

      export const ${capitalize(
        camelCaseId
      )}Logo = (props: React.SVGProps<SVGSVGElement>) => <svg></svg>
      `,
      { parser: 'typescript', ...prettierRc }
    )
  )
}

const createAuthFile = async (
  path: string,
  { name, auth }: { name: string; auth: 'apiKey' | 'encryptedData' | 'none' }
) =>
  writeFileSync(
    join(path, 'auth.ts'),
    await prettier.format(
      `import { option, AuthDefinition } from '@typebot.io/forge'

        export const auth = {
          type: 'encryptedCredentials',
          name: '${name} account',
          ${
            auth === 'apiKey'
              ? `schema: option.object({
                    apiKey: option.string.layout({
                      label: 'API key',
                      isRequired: true,
                      inputType: 'password',
                      helperText:
                        'You can generate an API key [here](<INSERT_URL>).',
                      withVariableButton: false,
                      isDebounceDisabled: true,
                    }),
                  }),`
              : ''
          }
        } satisfies AuthDefinition`,
      { parser: 'typescript', ...prettierRc }
    )
  )

const addBlockToRepository = async ({
  auth,
  camelCaseId,
  id,
}: {
  auth: string
  camelCaseId: string
  id: string
}) => {
  const schemasPath = await addBlockToRepoPackageJson(id)
  await addBlockToRepoDefinitions(schemasPath, camelCaseId, id)
  await addBlockToRepoConstants(schemasPath, id)
  await addBlockToRepoSchemas(schemasPath, camelCaseId, id)
  if (auth !== 'none')
    await addBlockToCredentialsRepoSchemas(schemasPath, camelCaseId, id)
}

const createSchemasFile = async (
  path: string,
  {
    id,
    auth,
  }: { id: string; name: string; auth: 'apiKey' | 'encryptedData' | 'none' }
) => {
  const camelCaseName = camelize(id as string)
  writeFileSync(
    join(path, 'schemas.ts'),
    await prettier.format(
      `// Do not edit this file manually
import { ${
        auth !== 'none' ? 'parseBlockCredentials,' : ''
      } parseBlockSchema } from '@typebot.io/forge'
import { ${camelCaseName}Block } from '.'${
        auth !== 'none' ? `\nimport { auth } from './auth'` : ''
      }

export const ${camelCaseName}BlockSchema = parseBlockSchema(${camelCaseName}Block)
${
  auth !== 'none'
    ? `export const ${camelCaseName}CredentialsSchema = parseBlockCredentials(${camelCaseName}Block.id, auth.schema)`
    : ''
}`,
      { parser: 'typescript', ...prettierRc }
    )
  )
}

async function addBlockToRepoDefinitions(
  schemasPath: string,
  camelCaseId: string,
  id: string
) {
  const existingDefinitionsData = readFileSync(
    join(schemasPath, 'definitions.ts')
  ).toString()
  const importStatement = `import { ${camelCaseId}Block } from '@typebot.io/${id}-block'`
  const objectEntry = `  [${camelCaseId}Block.id]: ${camelCaseId}Block,`
  const nextLineImportIndex = existingDefinitionsData.indexOf(
    '\n',
    existingDefinitionsData.lastIndexOf('import')
  )

  const newObjectEntryIndex = existingDefinitionsData.lastIndexOf(',') + 1

  const newDefinitionsData = `${existingDefinitionsData.slice(
    0,
    nextLineImportIndex
  )}
${importStatement}
${existingDefinitionsData.slice(nextLineImportIndex, newObjectEntryIndex)}
${objectEntry}
${existingDefinitionsData.slice(newObjectEntryIndex)}`

  writeFileSync(
    join(schemasPath, 'definitions.ts'),
    await prettier.format(newDefinitionsData, {
      parser: 'typescript',
      ...prettierRc,
    })
  )
}

async function addBlockToRepoSchemas(
  schemasPath: string,
  camelCaseId: string,
  id: string
) {
  const existingDefinitionsData = readFileSync(
    join(schemasPath, 'schemas.ts')
  ).toString()
  const importStatement = `import { ${camelCaseId}Block } from '@typebot.io/${id}-block'
import { ${camelCaseId}BlockSchema } from '@typebot.io/${id}-block/schemas'`
  const objectEntry = `  [${camelCaseId}Block.id]: ${camelCaseId}BlockSchema,`
  const nextLineImportIndex = existingDefinitionsData.indexOf(
    '\n',
    existingDefinitionsData.lastIndexOf('import')
  )

  const newObjectEntryIndex = existingDefinitionsData.lastIndexOf(',') + 1

  const newDefinitionsData = `${existingDefinitionsData.slice(
    0,
    nextLineImportIndex
  )}
${importStatement}
${existingDefinitionsData.slice(nextLineImportIndex, newObjectEntryIndex)}
${objectEntry}
${existingDefinitionsData.slice(newObjectEntryIndex)}`

  writeFileSync(
    join(schemasPath, 'schemas.ts'),
    await prettier.format(newDefinitionsData, {
      parser: 'typescript',
      ...prettierRc,
    })
  )
}

async function addBlockToCredentialsRepoSchemas(
  schemasPath: string,
  camelCaseId: string,
  id: string
) {
  const existingSchemasData = readFileSync(
    join(schemasPath, 'credentials.ts')
  ).toString()
  const importStatement = `import { ${camelCaseId}Block } from '@typebot.io/${id}-block'
import { ${camelCaseId}CredentialsSchema } from '@typebot.io/${id}-block/schemas'`
  const objectEntry = `  [${camelCaseId}Block.id]: ${camelCaseId}CredentialsSchema,`
  const nextLineImportIndex = existingSchemasData.indexOf(
    '\n',
    existingSchemasData.lastIndexOf('import')
  )

  const newObjectEntryIndex = existingSchemasData.lastIndexOf(',') + 1

  const newDefinitionsData = `${existingSchemasData.slice(
    0,
    nextLineImportIndex
  )}
${importStatement}
${existingSchemasData.slice(nextLineImportIndex, newObjectEntryIndex)}
${objectEntry}
${existingSchemasData.slice(newObjectEntryIndex)}`

  writeFileSync(
    join(schemasPath, 'credentials.ts'),
    await prettier.format(newDefinitionsData, {
      parser: 'typescript',
      ...prettierRc,
    })
  )
}

async function addBlockToRepoConstants(schemasPath: string, id: string) {
  const existingDefinitionsData = readFileSync(
    join(schemasPath, 'constants.ts')
  ).toString()

  writeFileSync(
    join(schemasPath, 'constants.ts'),
    await prettier.format(
      existingDefinitionsData.replace(
        `] as const satisfies ForgedBlock['type'][]`,
        `'${id}'] as const satisfies ForgedBlock['type'][]`
      ),
      {
        parser: 'typescript',
        ...prettierRc,
      }
    )
  )
}

async function addBlockToRepoPackageJson(id: string) {
  const schemasPath = join(process.cwd(), `../repository`)
  const packageJson = require(join(schemasPath, 'package.json'))
  packageJson.devDependencies[`@typebot.io/${id}-block`] = 'workspace:*'
  writeFileSync(
    join(schemasPath, 'package.json'),
    await prettier.format(JSON.stringify(packageJson, null, 2), {
      parser: 'json',
      ...prettierRc,
    })
  )
  return schemasPath
}

main()
  .then()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
