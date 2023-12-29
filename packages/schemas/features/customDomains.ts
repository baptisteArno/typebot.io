import { CustomDomain as CustomDomainInDb } from '@typebot.io/prisma'
import { z } from '../zod'
import { extendZodWithOpenApi } from 'zod-openapi'

extendZodWithOpenApi(z)

export const domainVerificationStatusSchema = z.enum([
  'Valid Configuration',
  'Invalid Configuration',
  'Domain Not Found',
  'Pending Verification',
  'Unknown Error',
])
export type DomainVerificationStatus = z.infer<
  typeof domainVerificationStatusSchema
>

export const domainResponseSchema = z.object({
  name: z.string(),
  apexName: z.string(),
  projectId: z.string(),
  redirect: z.string().nullable(),
  redirectStatusCode: z.number().nullable(),
  gitBranch: z.string().nullable(),
  updatedAt: z.number().nullable(),
  createdAt: z.number().nullable(),
  verified: z.boolean(),
  verification: z
    .array(
      z.object({
        type: z.string(),
        domain: z.string(),
        value: z.string(),
        reason: z.string(),
      })
    )
    .optional(),
})
export type DomainResponse = z.infer<typeof domainResponseSchema>

const domainNameRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/

export const customDomainSchema = z.object({
  name: z
    .string()
    .transform((name) => name.toLowerCase())
    .openapi({
      effectType: 'input',
    })
    .refine((name) => domainNameRegex.test(name)),
  workspaceId: z.string(),
  createdAt: z.date(),
}) satisfies z.ZodType<CustomDomainInDb>
