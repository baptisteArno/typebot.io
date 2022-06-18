import { rest, setupWorker } from 'msw'
import { setupServer } from 'msw/node'

const handlers = () => [
  rest.get('http://localhost:3000/api/auth/session', (req, res, ctx) => {
    const authenticatedUser = JSON.parse(
      typeof localStorage !== 'undefined'
        ? (localStorage.getItem('authenticatedUser') as string)
        : '{"id":"proUser","name":"Pro user","email":"pro-user@email.com","emailVerified":null,"image":"https://avatars.githubusercontent.com/u/16015833?v=4","plan":"PRO","stripeId":null}'
    )
    return res(
      ctx.json({
        user: authenticatedUser,
        expires: '2022-03-13T17:02:42.317Z',
      })
    )
  }),
]

export const enableMocks = () => {
  if (typeof window === 'undefined') {
    const server = setupServer(...handlers())
    server.listen()
  } else {
    const worker = setupWorker(...handlers())
    worker.start({
      onUnhandledRequest: 'bypass',
    })
  }
}
