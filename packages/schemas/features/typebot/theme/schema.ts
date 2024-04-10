import { ThemeTemplate as ThemeTemplatePrisma } from '@typebot.io/prisma'
import { z } from '../../../zod'
import {
  BackgroundType,
  borderRoundness,
  fontTypes,
  progressBarPlacements,
  progressBarPositions,
  shadows,
} from './constants'

const avatarPropsSchema = z.object({
  isEnabled: z.boolean().optional(),
  url: z.string().optional(),
})

const containerBorderThemeSchema = z.object({
  thickness: z.number().optional(),
  color: z.string().optional(),
  roundeness: z.enum(borderRoundness).optional(),
  customRoundeness: z.number().optional(),
  opacity: z.number().min(0).max(1).optional(),
})

export type ContainerBorderTheme = z.infer<typeof containerBorderThemeSchema>

const containerThemeSchema = z.object({
  backgroundColor: z.string().optional(),
  color: z.string().optional(),
  blur: z.number().optional(),
  opacity: z.number().min(0).max(1).optional(),
  shadow: z.enum(shadows).optional(),
  border: containerBorderThemeSchema.optional(),
})

const inputThemeSchema = containerThemeSchema.extend({
  placeholderColor: z.string().optional(),
})

const chatContainerSchema = z
  .object({
    maxWidth: z.string().optional(),
    maxHeight: z.string().optional(),
  })
  .merge(containerThemeSchema)

export const chatThemeSchema = z.object({
  container: chatContainerSchema.optional(),
  hostAvatar: avatarPropsSchema.optional(),
  guestAvatar: avatarPropsSchema.optional(),
  hostBubbles: containerThemeSchema.optional(),
  guestBubbles: containerThemeSchema.optional(),
  buttons: containerThemeSchema.optional(),
  inputs: inputThemeSchema.optional(),
  roundness: z
    .enum(['none', 'medium', 'large'])
    .optional()
    .describe('Deprecated, use `container.border.roundeness` instead'),
})

const backgroundSchema = z.object({
  type: z.nativeEnum(BackgroundType).optional(),
  content: z.string().optional().optional(),
})

const googleFontSchema = z.object({
  type: z.literal(fontTypes[0]),
  family: z.string().optional(),
})
export type GoogleFont = z.infer<typeof googleFontSchema>

const customFontSchema = z.object({
  type: z.literal(fontTypes[1]),
  family: z.string().optional(),
  css: z.string().optional(),
  url: z.string().optional().describe('Deprecated, use `css` instead'),
})
export type CustomFont = z.infer<typeof customFontSchema>

export const fontSchema = z
  .string()
  .or(z.discriminatedUnion('type', [googleFontSchema, customFontSchema]))
export type Font = z.infer<typeof fontSchema>

const progressBarSchema = z.object({
  isEnabled: z.boolean().optional(),
  color: z.string().optional(),
  backgroundColor: z.string().optional(),
  placement: z.enum(progressBarPlacements).optional(),
  thickness: z.number().optional(),
  position: z.enum(progressBarPositions).optional(),
})
export type ProgressBar = z.infer<typeof progressBarSchema>

const generalThemeSchema = z.object({
  font: fontSchema.optional(),
  background: backgroundSchema.optional(),
  progressBar: progressBarSchema.optional(),
})

export const themeSchema = z
  .object({
    general: generalThemeSchema.optional(),
    chat: chatThemeSchema.optional(),
    customCss: z.string().optional(),
  })
  .openapi({
    title: 'Theme',
    ref: 'theme',
  })

export const themeTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  theme: themeSchema,
  workspaceId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
}) satisfies z.ZodType<Omit<ThemeTemplatePrisma, 'theme'>>

export type Theme = z.infer<typeof themeSchema>
export type ChatTheme = z.infer<typeof chatThemeSchema>
export type AvatarProps = z.infer<typeof avatarPropsSchema>
export type GeneralTheme = z.infer<typeof generalThemeSchema>
export type Background = z.infer<typeof backgroundSchema>
export type ContainerTheme = z.infer<typeof containerThemeSchema>
export type InputTheme = z.infer<typeof inputThemeSchema>
export type ThemeTemplate = z.infer<typeof themeTemplateSchema>
