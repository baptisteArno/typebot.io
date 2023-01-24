import { z } from 'zod'

const avatarPropsSchema = z.object({
  isEnabled: z.boolean(),
  url: z.string().optional(),
})

const containerColorsSchema = z.object({
  backgroundColor: z.string(),
  color: z.string(),
})

const inputColorsSchema = containerColorsSchema.and(
  z.object({
    placeholderColor: z.string(),
  })
)

const chatThemeSchema = z.object({
  hostAvatar: avatarPropsSchema.optional(),
  guestAvatar: avatarPropsSchema.optional(),
  hostBubbles: containerColorsSchema,
  guestBubbles: containerColorsSchema,
  buttons: containerColorsSchema,
  inputs: inputColorsSchema,
})

export enum BackgroundType {
  COLOR = 'Color',
  IMAGE = 'Image',
  NONE = 'None',
}

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
