/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './components/**/*.{ts,tsx}', './screens/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          page: '#0D0F12',
          elev1: '#121419',
          elev2: '#161922',
        },
        text: {
          primary: '#E8EAED',
          secondary: '#A8AFB9',
          muted: '#7D8590',
        },
        accent: '#F5C84C',
        accentOn: '#0B0C0F',
        border: '#242833',
        success: '#51D675',
        danger: '#FF6B6B',
      },
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        7: '32px',
        8: '40px',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
      },
    },
  },
  plugins: [require('nativewind/tailwind/css')],
};
