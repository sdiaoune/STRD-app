/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './components/**/*.{ts,tsx}', './screens/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#FFD233',
        onPrimary: '#111315',
        surface: '#171A1F',
        surfaceAlt: '#0F1115',
        border: '#2A2F3A',
        text: '#F5F6F8',
        textMuted: '#A1A6B0',
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
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
  plugins: [],
};
