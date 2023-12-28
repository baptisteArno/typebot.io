import { ThemeTemplate as ThemeTemplatePrisma } from '@typebot.io/prisma'
import { z } from '../../../zod'
import { BackgroundType } from './constants'

const avatarPropsSchema = z.object({
  isEnabled: z.boolean().optional(),
  url: z.string().optional(),
})

const containerColorsSchema = z.object({
  backgroundColor: z.string().optional(),
  color: z.string().optional(),
})

const inputColorsSchema = containerColorsSchema.merge(
  z.object({
    placeholderColor: z.string().optional(),
  })
)

export const chatThemeSchema = z.object({
  hostAvatar: avatarPropsSchema.optional(),
  guestAvatar: avatarPropsSchema.optional(),
  hostBubbles: containerColorsSchema.optional(),
  guestBubbles: containerColorsSchema.optional(),
  buttons: containerColorsSchema.optional(),
  inputs: inputColorsSchema.optional(),
  roundness: z.enum(['none', 'medium', 'large']).optional(),
})

const backgroundSchema = z.object({
  type: z.nativeEnum(BackgroundType).optional(),
  content: z.string().optional().optional(),
})

const generalThemeSchema = z.object({
  font: z.string().optional(),
  background: backgroundSchema.optional(),
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
}) satisfies z.ZodType<ThemeTemplatePrisma>

export type Theme = z.infer<typeof themeSchema>
export type ChatTheme = z.infer<typeof chatThemeSchema>
export type AvatarProps = z.infer<typeof avatarPropsSchema>
export type GeneralTheme = z.infer<typeof generalThemeSchema>
export type Background = z.infer<typeof backgroundSchema>
export type ContainerColors = z.infer<typeof containerColorsSchema>
export type InputColors = z.infer<typeof inputColorsSchema>
export type ThemeTemplate = z.infer<typeof themeTemplateSchema>
