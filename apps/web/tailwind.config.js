/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        apple: {
          blue: '#0071E3',
          'blue-dark': '#0077ED',
          gray: {
            50: '#F5F5F7',
            100: '#E8E8ED',
            200: '#D2D2D7',
            300: '#B0B0B8',
            400: '#86868B',
            500: '#6E6E73',
            600: '#515154',
            700: '#424245',
            800: '#1D1D1F',
            900: '#111111',
          }
        }
      },
      fontFamily: {
        sans: ['Source Sans Pro', 'ui-sans-serif', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'Inter', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'apple': '0 2px 16px rgba(0, 0, 0, 0.08)',
        'apple-lg': '0 4px 24px rgba(0, 0, 0, 0.12)',
      },
      maxWidth: {
        'content': '1200px',
      }
    },
  },
  plugins: [],
};
