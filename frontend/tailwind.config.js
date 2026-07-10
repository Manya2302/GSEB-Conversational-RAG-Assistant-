/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#343541',
        sidebar: '#202123',
        userMsg: '#343541',
        botMsg: '#444654',
        border: '#4D4D4F',
        accent: '#10A37F',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#ececf1',
            a: {
              color: '#10A37F',
              '&:hover': {
                color: '#1a7f64',
              },
            },
            pre: {
              backgroundColor: '#000000',
              color: '#ffffff',
            },
            code: {
              color: '#ffffff',
              backgroundColor: '#000000',
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
            },
          },
        },
      },
    },
  },
  plugins: [],
}
