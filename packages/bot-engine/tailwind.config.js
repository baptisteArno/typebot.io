module.exports = {
  mode: 'jit',
  purge: ['./src/**/*.tsx'],
  darkMode: false,
  theme: {
    extend: {
      screens: {
        xs: '400px',
      },
    },
  },
  variants: {
    extend: {
      opacity: ['disabled'],
      cursor: ['disabled'],
    },
  },
  plugins: [],
}
