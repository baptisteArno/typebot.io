import { extendTheme } from '@chakra-ui/react'

const fonts = {
  heading: 'Outfit',
  body: 'Open Sans',
}

export const colors = {
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  blue: {
    50: '#e0edff',
    100: '#b0caff',
    200: '#7ea6ff',
    300: '#4b83ff',
    400: '#1a5fff',
    500: '#0042da',
    600: '#0036b4',
    700: '#002782',
    800: '#001751',
    900: '#1a202c',
  },
  orange: {
    50: '#fff1da',
    100: '#ffd7ae',
    200: '#ffbf7d',
    300: '#FF8B38',
    400: '#ff8b1a',
    500: '#e67200',
    600: '#b45800',
    700: '#813e00',
    800: '#4f2500',
    900: '#200b00',
  },
  yellow: {
    50: '#fff9da',
    100: '#ffedad',
    200: '#ffe17d',
    300: '#ffd54b',
    400: '#ffc91a',
    500: '#e6b000',
    600: '#b38800',
    700: '#806200',
    800: '#4e3a00',
    900: '#1d1400',
  },
  blueGray: {
    400: '#7C8498',
  },
  teste: {
    800: '#303243',
  },
  red: {
    50: '#FDF0EC',
    100: '#FBD9D0',
    200: '#F8BAAA',
    300: '#F17250',
    400: '#D33003',
    500: '#A23B20',
    600: '#5B332E',
    700: '#3E2D34',
    800: '#30272A',
  },
}

const components = {
  Spinner: {
    defaultProps: {
      colorScheme: 'blue',
    },
  },
  NumberInput: {
    defaultProps: {
      focusBorderColor: 'blue.200',
    },
  },
  Input: {
    defaultProps: {
      focusBorderColor: 'blue.200',
    },
  },
  Textarea: {
    defaultProps: {
      focusBorderColor: 'blue.200',
    },
  },
  Popover: {
    baseStyle: {
      popper: {
        width: 'fit-content',
        maxWidth: 'fit-content',
      },
    },
  },
  Link: {
    baseStyle: {
      _hover: { textDecoration: 'none' },
    },
  },
  Menu: {
    parts: ['list'],
    defaultProps: {
      list: {
        shadow: 'lg',
      },
    },
  },
  Text: {
    variants: {
      label: () => ({
        color: 'gray.400',
        fontSize: 'sm',
      }),
    },
  },
}

const styles = {
  global: {
    '.chakra-collapse[style*="height: auto"]': {
      overflow: 'initial !important',
    },
  },
}

export const customTheme = extendTheme({ styles, colors, fonts, components })
