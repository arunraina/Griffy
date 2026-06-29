import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        tc: {
          DEFAULT: '#C0593A',
          dark:    '#9E3F24',
          deeper:  '#7A2E18',
          light:   '#FAEEE9',
          mid:     '#E8A98E',
          border:  '#E8C4B0',
        },
        brown: {
          head:   '#2C1810',
          body:   '#6B5248',
          muted:  '#A08070',
          border: '#EBE0D8',
          stone:  '#5C4A3A',
        },
        sand: {
          warm: '#FDF8F5',
          base: '#F7F1EC',
        },
      },
      fontFamily: {
        display: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
