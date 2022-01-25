import { Step } from 'models'
import { parseTestTypebot } from './utils'

export const users = [
  { id: 'user1', email: 'test1@gmail.com' },
  { id: 'user2', email: 'test2@gmail.com' },
]

export const createTypebotWithStep = (step: Omit<Step, 'id' | 'blockId'>) => {
  cy.task(
    'createTypebot',
    parseTestTypebot({
      id: 'typebot3',
      name: 'Typebot #3',
      ownerId: users[1].id,
      steps: {
        byId: {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          step1: {
            ...step,
            id: 'step1',
            blockId: 'block1',
          },
        },
        allIds: ['step1'],
      },
      blocks: {
        byId: {
          block1: {
            id: 'block1',
            graphCoordinates: { x: 400, y: 200 },
            title: 'Block #1',
            stepIds: ['step1'],
          },
        },
        allIds: ['block1'],
      },
      choiceItems: {
        byId: { item1: { stepId: 'step1', id: 'item1' } },
        allIds: ['item1'],
      },
    })
  )
}
