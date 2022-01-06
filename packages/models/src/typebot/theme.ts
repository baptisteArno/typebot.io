export type Theme = {
  general: {
    font: string
    background: Background
  }
}

export enum BackgroundType {
  COLOR = 'Color',
  IMAGE = 'Image',
  NONE = 'None',
}

export type Background = {
  type: BackgroundType
  content: string
}
