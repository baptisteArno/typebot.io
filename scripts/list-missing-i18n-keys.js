#!/usr/bin/env node
/**
 * list-missing-i18n-keys.js
 *
 * Compares the base English translation file (en.json) against every other
 * translation JSON file in the same i18n directory and reports:
 *  - Missing keys (present in en.json, absent in target file)
 *  - Extra keys (present in target file, absent in en.json)
 *  - Keys with empty string values (optional signal of incomplete translation)
 *
 * Usage:
 *   node scripts/list-missing-i18n-keys.js [--dir path/to/i18n] [--json]
 *
 * Options:
 *   --dir   Override i18n directory (default: apps/builder/src/i18n)
 *   --json  Output machine‑readable JSON summary
 *
 * Exit codes:
 *   0 if no discrepancies
 *   1 if any missing or extra keys found (useful for CI)
 * Added option: --target path/to/file.json (or #file:filename.json) to only list missing keys for that specific translation.
 * Added option: --base path/to/base.json (or #file:en.json) to specify a custom base file instead of en.json
 */

// Converted to CommonJS to avoid ESM execution warning/errors
const fs = require('fs')
const path = require('path')

const argv = process.argv.slice(2)
const getFlag = (f) => argv.includes(f)
const getOption = (name, def) => {
  const idx = argv.indexOf(name)
  return idx !== -1 && argv[idx + 1] ? argv[idx + 1] : def
}

// __dirname is natively available in CommonJS
const i18nDir = path.resolve(
  getOption(
    '--dir',
    path.join(__dirname, '..', 'apps', 'builder', 'src', 'i18n')
  )
)

// New: custom base file support
let baseArg = getOption('--base', null)
if (baseArg && baseArg.startsWith('#file:'))
  baseArg = baseArg.replace(/^#file:/, '')
let baseFile = baseArg
  ? path.isAbsolute(baseArg)
    ? baseArg
    : path.resolve(i18nDir, baseArg)
  : path.join(i18nDir, 'en.json')
if (!fs.existsSync(baseFile)) {
  console.error(`Base file not found: ${baseFile}`)
  process.exit(2)
}
const baseLang = path.basename(baseFile, '.json')

const outputJson = getFlag('--json')
const targetArg = getOption('--target', null)

function readJson(file) {
  try {
    const raw = fs.readFileSync(file, 'utf8')
    return JSON.parse(raw)
  } catch (err) {
    throw new Error(`Failed to read/parse JSON file ${file}: ${err.message}`)
  }
}

function collectFiles(dir) {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    throw new Error(`i18n directory not found: ${dir}`)
  }
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => path.join(dir, f))
}

function diffKeys(baseMap, targetMap) {
  const baseKeys = new Set(Object.keys(baseMap))
  const targetKeys = new Set(Object.keys(targetMap))

  const missing = []
  const extra = []
  const emptyValues = []

  for (const k of baseKeys) {
    if (!targetKeys.has(k)) missing.push(k)
  }
  for (const k of targetKeys) {
    if (!baseKeys.has(k)) extra.push(k)
    else if (
      targetMap[k] === '' ||
      (typeof targetMap[k] === 'string' && targetMap[k].trim() === '')
    )
      emptyValues.push(k)
  }
  return { missing, extra, emptyValues }
}

function runTargetOnly() {
  if (!fs.existsSync(baseFile)) {
    throw new Error(`Base file not found: ${baseFile}`)
  }
  let targetPath = targetArg
  if (targetPath.startsWith('#file:'))
    targetPath = targetPath.replace(/^#file:/, '')
  if (!path.isAbsolute(targetPath))
    targetPath = path.resolve(i18nDir, targetPath)
  if (!fs.existsSync(targetPath)) {
    throw new Error(`Target file not found: ${targetPath}`)
  }
  const base = readJson(baseFile)
  const target = readJson(targetPath)
  const { missing } = diffKeys(base, target)
  const targetLang = path.basename(targetPath, '.json')
  if (outputJson) {
    process.stdout.write(
      JSON.stringify(
        {
          directory: i18nDir,
          base: baseLang,
          target: targetLang,
          missing,
        },
        null,
        2
      ) + '\n'
    )
  } else {
    console.log(`Base:   ${baseFile}`)
    console.log(`Target: ${targetPath}`)
    if (missing.length) {
      console.log(`\nMissing keys (${missing.length}):`)
      missing.forEach((k) => console.log('  -', k))
    } else {
      console.log('\nNo missing keys.')
    }
  }
  process.exit(missing.length ? 1 : 0)
}

function main() {
  if (targetArg) return runTargetOnly()
  const allFiles = collectFiles(i18nDir)
  if (!fs.existsSync(baseFile)) {
    throw new Error(
      `Base file ${path.basename(baseFile)} not found in path: ${baseFile}`
    )
  }
  const base = readJson(baseFile)

  const report = {}
  let hasDiscrepancy = false

  for (const file of allFiles) {
    if (file === baseFile) continue
    const lang = path.basename(file, '.json')
    const target = readJson(file)
    const { missing, extra, emptyValues } = diffKeys(base, target)
    report[lang] = { missing, extra, emptyValues }
    if (missing.length || extra.length) hasDiscrepancy = true
  }

  if (outputJson) {
    process.stdout.write(
      JSON.stringify({ directory: i18nDir, base: baseLang, report }, null, 2) +
        '\n'
    )
  } else {
    console.log(`i18n directory: ${i18nDir}`)
    console.log(`Base language (file): ${baseLang} (${baseFile})`)
    const langs = Object.keys(report)
    if (!langs.length) console.log('No other translation files found.')
    for (const lang of langs) {
      const { missing, extra, emptyValues } = report[lang]
      console.log(`\n=== ${lang} ===`)
      if (!missing.length && !extra.length && !emptyValues.length) {
        console.log('✓ No differences')
        continue
      }
      if (missing.length) {
        console.log(`Missing (${missing.length}):`)
        missing.forEach((k) => console.log('  -', k))
      } else console.log('Missing: 0')
      if (extra.length) {
        console.log(`Extra (${extra.length}):`)
        extra.forEach((k) => console.log('  -', k))
      } else console.log('Extra: 0')
      if (emptyValues.length) {
        console.log(`Empty (${emptyValues.length}):`)
        emptyValues.forEach((k) => console.log('  -', k))
      } else console.log('Empty: 0')
    }
  }

  process.exit(hasDiscrepancy ? 1 : 0)
}

try {
  main()
} catch (err) {
  console.error('[i18n-check] Error:', err.message)
  process.exit(2)
}
