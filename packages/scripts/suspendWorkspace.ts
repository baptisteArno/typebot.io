import { PrismaClient } from '@sniper.io/prisma'
import { select, text, isCancel } from '@clack/prompts'
import { isEmpty } from '@sniper.io/lib'
import { promptAndSetEnvironment } from './utils'

const suspendWorkspace = async () => {
  await promptAndSetEnvironment('production')
  const prisma = new PrismaClient()

  const type = await select<any, 'id' | 'publicId' | 'workspaceId'>({
    message: 'Select way',
    options: [
      { label: 'Sniper ID', value: 'id' },
      { label: 'Sniper public ID', value: 'publicId' },
      { label: 'Workspace ID', value: 'workspaceId' },
    ],
  })

  if (!type || isCancel(type)) return

  const val = await text({
    message: 'Enter value',
  })

  if (!val || isCancel(val)) return

  let workspaceId = type === 'workspaceId' ? val : undefined

  if (!workspaceId) {
    const sniper = await prisma.sniper.findFirst({
      where: {
        [type]: val,
      },
      select: {
        workspaceId: true,
      },
    })

    if (!sniper) {
      console.log('Sniper not found')
      return
    }

    workspaceId = sniper.workspaceId
  }

  if (isEmpty(workspaceId)) {
    console.log('Workspace not found')
    return
  }

  const result = await prisma.workspace.update({
    where: {
      id: workspaceId,
    },
    data: {
      isSuspended: true,
    },
  })

  console.log(JSON.stringify(result, null, 2))
}

suspendWorkspace()
