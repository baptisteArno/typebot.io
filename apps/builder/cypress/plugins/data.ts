import { Step, InputStepType } from 'models'
import { parseTestTypebot } from './utils'

export const userIds = ['user1', 'user2']

export const createTypebotWithStep = (step: Omit<Step, 'id' | 'blockId'>) => {
  cy.task(
    'createTypebot',
    parseTestTypebot({
      id: 'typebot3',
      name: 'Typebot #3',
      ownerId: userIds[1],
      steps: {
        byId: {
          step1: {
            ...step,
            id: 'step1',
            blockId: 'block1',
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            options:
              step.type === InputStepType.CHOICE
                ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  //@ts-ignore
                  { itemIds: ['item1'] }
                : undefined,
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
      choiceItems:
        step.type === InputStepType.CHOICE
          ? {
              byId: { item1: { stepId: 'step1', id: 'item1' } },
              allIds: ['item1'],
            }
          : undefined,
    })
  )
}
