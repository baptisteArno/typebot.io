import prisma from 'libs/prisma'
import { Block, InputStep, InputStepType, Typebot } from 'models'
import { NextApiRequest, NextApiResponse } from 'next'
import { authenticateUser } from 'services/api/utils'
import { byId, isDefined, isInputStep, methodNotAllowed } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const user = await authenticateUser(req)
    if (!user) return res.status(401).json({ message: 'Not authenticated' })
    const typebotId = req.query.typebotId.toString()
    const blockId = req.query.blockId.toString()
    const typebot = (await prisma.typebot.findUnique({
      where: { id_ownerId: { id: typebotId, ownerId: user.id } },
    })) as Typebot | undefined
    if (!typebot) return res.status(400).send({ message: 'Typebot not found' })
    const previousBlockIds = getPreviousBlocks(typebot)(blockId)
    const previousBlocks = typebot.blocks.filter((b) =>
      previousBlockIds.includes(b.id)
    )
    return res.send(parseSampleResult(typebot)(previousBlocks))
  }
  methodNotAllowed(res)
}

const parseSampleResult =
  (typebot: Typebot) =>
  (blocks: Block[]): Record<string, string> => {
    const parsedBlocks = parseBlocksResultSample(typebot, blocks)
    return {
      message: 'This is a sample result, it has been generated ⬇️',
      'Submitted at': new Date().toISOString(),
      ...parsedBlocks,
      ...parseVariablesHeaders(typebot, parsedBlocks),
    }
  }

const parseBlocksResultSample = (typebot: Typebot, blocks: Block[]) =>
  blocks
    .filter((block) => typebot && block.steps.some((step) => isInputStep(step)))
    .reduce<Record<string, string>>((blocks, block) => {
      const inputStep = block.steps.find((step) => isInputStep(step))
      if (!inputStep || !isInputStep(inputStep)) return blocks
      const matchedVariableName =
        inputStep.options.variableId &&
        typebot.variables.find(byId(inputStep.options.variableId))?.name
      const value = getSampleValue(inputStep)
      return {
        ...blocks,
        [matchedVariableName ?? block.title]: value,
      }
    }, {})

const getSampleValue = (step: InputStep) => {
  switch (step.type) {
    case InputStepType.CHOICE:
      return 'Item 1, Item 2, Item3'
    case InputStepType.DATE:
      return new Date().toUTCString()
    case InputStepType.EMAIL:
      return 'test@email.com'
    case InputStepType.NUMBER:
      return '20'
    case InputStepType.PHONE:
      return '+33665566773'
    case InputStepType.TEXT:
      return 'answer value'
    case InputStepType.URL:
      return 'https://test.com'
  }
}

const parseVariablesHeaders = (
  typebot: Typebot,
  parsedBlocks: Record<string, string>
) =>
  typebot.variables.reduce<Record<string, string>>((headers, v) => {
    if (parsedBlocks[v.name]) return headers
    return {
      ...headers,
      [v.name]: 'value',
    }
  }, {})

const getPreviousBlocks =
  (typebot: Typebot) =>
  (blockId: string): string[] => {
    const previousBlocks = typebot.edges
      .map((edge) =>
        edge.to.blockId === blockId ? edge.from.blockId : undefined
      )
      .filter(isDefined)
    return previousBlocks.concat(
      previousBlocks.flatMap(getPreviousBlocks(typebot))
    )
  }

export default handler
