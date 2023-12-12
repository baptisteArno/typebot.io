import * as p from '@clack/prompts'
import { spinner } from '@clack/prompts'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
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
  if (existsSync(newBlockPath)) {
    s.stop('Creating files...')
    p.log.error(
      `An integration with the ID "${prompt.id}" already exists. Please choose a different ID.`
    )
    process.exit(1)
  }
  mkdirSync(newBlockPath)
  await createPackageJson(newBlockPath, prompt)
  await createTsConfig(newBlockPath)
  await createIndexFile(newBlockPath, prompt)
  await createLogoFile(newBlockPath, prompt)
  if (prompt.auth !== 'none') await createAuthFile(newBlockPath, prompt)
  await addNewIntegrationToRepository(prompt)
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

export const ${camelCaseName} = createBlock({
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
        license: 'ISC',
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

const addNewIntegrationToRepository = async ({
  camelCaseId,
  id,
}: {
  camelCaseId: string
  id: string
}) => {
  const schemasPath = join(process.cwd(), `../schemas`)
  const packageJson = require(join(schemasPath, 'package.json'))
  packageJson.devDependencies[`@typebot.io/${id}-block`] = 'workspace:*'
  writeFileSync(
    join(schemasPath, 'package.json'),
    await prettier.format(JSON.stringify(packageJson, null, 2), {
      parser: 'json',
      ...prettierRc,
    })
  )
  const repoIndexFile = readFileSync(join(schemasPath, 'index.ts')).toString()
  writeFileSync(
    join(schemasPath, 'index.ts'),
    await prettier.format(
      repoIndexFile
        .replace(
          '] as BlockDefinition<(typeof enabledBlocks)[number], any, any>[]',
          `${camelCaseId},] as BlockDefinition<(typeof enabledBlocks)[number], any, any>[]`
        )
        .replace(
          '// Do not edit this file manually',
          `// Do not edit this file manually\nimport {${camelCaseId}} from '@typebot.io/${id}-block'`
        ),
      { parser: 'typescript', ...prettierRc }
    )
  )

  const repoPath = join(process.cwd(), `../repository`)
  const enabledIndexFile = readFileSync(join(repoPath, 'index.ts')).toString()
  writeFileSync(
    join(repoPath, 'index.ts'),
    await prettier.format(
      enabledIndexFile.replace('] as const', `'${id}'] as const`),
      { parser: 'typescript', ...prettierRc }
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
          jsx: 'react',
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
      `import React from 'react'

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
                      input: 'password',
                      helperText:
                        'You can generate an API key [here](<INSERT_URL>).',
                    }),
                  }),`
              : ''
          }
        } satisfies AuthDefinition`,
      { parser: 'typescript', ...prettierRc }
    )
  )

main()
  .then()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
