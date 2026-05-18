/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Pretendard',
          'Pretendard Variable',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'sans-serif',
        ],
        display: [
          'Pretendard',
          'Pretendard Variable',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'sans-serif',
        ],
        serif: [
          'Cormorant Garamond',
          'ui-serif',
          'Georgia',
          'serif',
        ],
      },
      colors: {
        cream: {
          DEFAULT: '#FAF6F0',
          50: '#FDFBF7',
          100: '#FAF6F0',
          200: '#F4ECDF',
          300: '#EADCC4',
        },
        ink: {
          DEFAULT: '#1F1B2E',
          50: '#F4F2F6',
          100: '#E8E4ED',
          400: '#6B6478',
          600: '#3A3447',
          900: '#1F1B2E',
        },
        rose: {
          50: '#FDF5F2',
          100: '#FAEAE5',
          200: '#F2D0C5',
          300: '#E5A697',
          400: '#D17B69',
          500: '#C25A4C',
          600: '#A8443A',
          700: '#7E2F28',
        },
        plum: {
          50: '#F5EFF2',
          100: '#E8DCE3',
          400: '#8A5970',
          600: '#5E3B4D',
          900: '#2E1A26',
        },
        gold: {
          DEFAULT: '#C2A66B',
          100: '#F5EDD8',
          400: '#D4B97A',
          600: '#A38951',
        },
      },
      boxShadow: {
        paper: '0 1px 2px rgba(31, 27, 46, 0.04), 0 4px 12px rgba(31, 27, 46, 0.06)',
        'paper-lg': '0 8px 24px rgba(31, 27, 46, 0.08), 0 24px 56px rgba(31, 27, 46, 0.10)',
        'paper-hover': '0 4px 8px rgba(31, 27, 46, 0.06), 0 16px 32px rgba(31, 27, 46, 0.10)',
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '28px',
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
      backgroundImage: {
        'rose-fade': 'linear-gradient(135deg, #C25A4C 0%, #8A5970 100%)',
        'cream-fade': 'linear-gradient(180deg, #FDFBF7 0%, #F4ECDF 100%)',
      },
    },
  },
  plugins: [],
}
