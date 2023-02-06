import { router } from '@/utils/server/trpc'
import { getAttendantsProcedure, getDepartmentsProcedure } from './procedures'

export const transferRouter = router({
  getDepartments: getDepartmentsProcedure,
  getAttendants: getAttendantsProcedure,
})
