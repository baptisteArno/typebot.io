import { canonicalize } from 'json-canonicalize'
import crypto from 'crypto'
import { Typebot } from '@typebot.io/prisma'

export const generateHistoryChecksum = (typebotSnapshot: Typebot | null) => {
  const snapshotString = canonicalize(typebotSnapshot)
  const snapshotChecksum = crypto
    .createHash('sha256')
    .update(snapshotString)
    .digest('hex')

  return snapshotChecksum
}
