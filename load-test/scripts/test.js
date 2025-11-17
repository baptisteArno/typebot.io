import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '2m', target: 20 },
    { duration: '2m', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '2m', target: 150 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<10000'], // 95% <= 10000ms
    http_req_failed: ['rate<0.01'], // < 1% erro
  },
}

const BASE_URL = 'http://localhost:3003'
// const BASE_URL = 'https://eddieeyes.us-east-1.prd.cloudhumans.io'
const START_URL = `${BASE_URL}/api/v1/typebots/cmht8te6u004sihe0qfv0ijcz/preview/startChat`
// const START_URL = `${BASE_URL}/api/v1/typebots/cmgv5hvh202yw9q10gsi3pcse/preview/startChat`
const TOKEN = '5djqKGpCuTBmwzTd7BYto3eB'
// const TOKEN = 'Gk1GzvNnFA47uCzBfUSD5hlc'
const MESSAGE = 'olá. você conhece boas receitas de bolo?'

export default function () {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${TOKEN}`,
  }

  // 1) startChat
  const startResp = http.post(START_URL, JSON.stringify({}), {
    headers,
    tags: { phase: 'startChat' },
  })
  check(startResp, {
    'startChat status 2xx': (r) => r.status >= 200 && r.status < 300,
    'startChat has sessionId': (r) => {
      try {
        return JSON.parse(r.body).sessionId !== undefined
      } catch (_) {
        return false
      }
    },
  })

  let sessionId
  try {
    sessionId = JSON.parse(startResp.body).sessionId
  } catch (_) {
    sessionId = null
  }

  if (!sessionId) {
    // Falha já registrada pelo check
    sleep(1)
    return
  }

  // 2) continueChat
  const continueUrl = `${BASE_URL}/api/v1/sessions/${sessionId}/continueChat`
  const contResp = http.post(
    continueUrl,
    JSON.stringify({ message: MESSAGE }),
    { headers, tags: { phase: 'continueChat' } }
  )
  check(contResp, {
    'continueChat status 2xx': (r) => r.status >= 200 && r.status < 300,
  })

  sleep(1)
}
