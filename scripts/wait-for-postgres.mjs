#!/usr/bin/env node
/*
  Waits until Postgres accepts connections before proceeding.
  Usage: node scripts/wait-for-postgres.mjs
  Supported env vars:
    DATABASE_URL (default: postgres://postgres:typebot@localhost:5433/typebot)
    WAIT_FOR_DB_ATTEMPTS (default: 30)
    WAIT_FOR_DB_DELAY (ms) (default: 2000)
*/
import { Client } from 'pg'

// Usa somente DATABASE_URL; se não existir, aplica um padrão de dev.
let databaseUrl =
  process.env.DATABASE_URL ||
  'postgres://postgres:typebot@localhost:5433/typebot'
// Normaliza prefixo postgresql:// -> postgres:// para o driver.
if (databaseUrl.startsWith('postgresql://'))
  databaseUrl = databaseUrl.replace('postgresql://', 'postgres://')
const maxAttempts = parseInt(process.env.WAIT_FOR_DB_ATTEMPTS || '30', 10)
const delayMs = parseInt(process.env.WAIT_FOR_DB_DELAY || '2000', 10)

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function attempt(n) {
  const client = new Client({ connectionString: databaseUrl })
  try {
    await client.connect()
    await client.query('SELECT 1')
    await client.end()
    console.log(`Postgres ready (attempt ${n}).`)
    return true
  } catch (err) {
    console.log(
      `Postgres not ready yet (attempt ${n}/${maxAttempts}): ${
        (err && err.message) || err
      }`
    )
    try {
      await client.end()
    } catch {}
    return false
  }
}

;(async () => {
  for (let i = 1; i <= maxAttempts; i++) {
    const ok = await attempt(i)
    if (ok) {
      process.exit(0)
    }
    await sleep(delayMs)
  }
  console.error(
    `Failure: Postgres not ready after ${maxAttempts} attempts (~${Math.round(
      (maxAttempts * delayMs) / 1000
    )}s).`
  )
  process.exit(1)
})()
