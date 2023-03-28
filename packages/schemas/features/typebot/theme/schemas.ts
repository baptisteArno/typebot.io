import { ThemeTemplate as ThemeTemplatePrisma } from '@typebot.io/prisma'
import { z } from 'zod'
import { BackgroundType } from './enums'

const avatarPropsSchema = z.object({
  isEnabled: z.boolean(),
  url: z.string().optional(),
})

const containerColorsSchema = z.object({
  backgroundColor: z.string(),
  color: z.string(),
})

const inputColorsSchema = containerColorsSchema.merge(
  z.object({
    placeholderColor: z.string(),
  })
)

export const chatThemeSchema = z.object({
  hostAvatar: avatarPropsSchema.optional(),
  guestAvatar: avatarPropsSchema.optional(),
  hostBubbles: containerColorsSchema,
  guestBubbles: containerColorsSchema,
  buttons: containerColorsSchema,
  inputs: inputColorsSchema,
  roundness: z.enum(['none', 'medium', 'large']).optional(),
})

const backgroundSchema = z.object({
  type: z.nativeEnum(BackgroundType),
  content: z.string().optional(),
})

const generalThemeSchema = z.object({
  font: z.string(),
  background: backgroundSchema,
})

export const themeSchema = z.object({
  general: generalThemeSchema,
  chat: chatThemeSchema,
  customCss: z.string().optional(),
})

export const themeTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  theme: themeSchema,
  workspaceId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
}) satisfies z.ZodType<ThemeTemplatePrisma>

export const defaultTheme: Theme = {
  chat: {
    hostBubbles: { backgroundColor: '#F7F8FF', color: '#303235' },
    guestBubbles: { backgroundColor: '#FF8E21', color: '#FFFFFF' },
    buttons: { backgroundColor: '#0042DA', color: '#FFFFFF' },
    inputs: {
      backgroundColor: '#FFFFFF',
      color: '#303235',
      placeholderColor: '#9095A0',
    },
  },
  general: {
    font: 'Open Sans',
    background: { type: BackgroundType.COLOR, content: '#ffffff' },
  },
}

export type Theme = z.infer<typeof themeSchema>
export type ChatTheme = z.infer<typeof chatThemeSchema>
export type AvatarProps = z.infer<typeof avatarPropsSchema>
export type GeneralTheme = z.infer<typeof generalThemeSchema>
export type Background = z.infer<typeof backgroundSchema>
export type ContainerColors = z.infer<typeof containerColorsSchema>
export type InputColors = z.infer<typeof inputColorsSchema>
export type ThemeTemplate = z.infer<typeof themeTemplateSchema>
