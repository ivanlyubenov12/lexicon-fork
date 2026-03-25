/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './emails/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Surface hierarchy (The Living Scrapbook) ──────────────────
        'surface':                    '#fcf8ff',
        'surface-dim':                '#dbd8e4',
        'surface-bright':             '#fcf8ff',
        'surface-container-lowest':   '#ffffff',
        'surface-container-low':      '#f5f2fd',
        'surface-container':          '#f0ecf8',
        'surface-container-high':     '#eae6f2',
        'surface-container-highest':  '#e4e1ec',
        'on-surface':                 '#1b1b23',
        'on-surface-variant':         '#464554',
        'inverse-surface':            '#303038',
        'inverse-on-surface':         '#f2effb',
        'background':                 '#fcf8ff',
        'on-background':              '#1b1b23',
        // ── Primary (Indigo) ──────────────────────────────────────────
        'primary':                    '#1b0da2',
        'on-primary':                 '#ffffff',
        'primary-container':          '#3632b7',
        'on-primary-container':       '#b0b0ff',
        'primary-fixed':              '#e2dfff',
        'primary-fixed-dim':          '#c2c1ff',
        'on-primary-fixed':           '#0b006b',
        'on-primary-fixed-variant':   '#3430b6',
        'inverse-primary':            '#c2c1ff',
        // ── Secondary ────────────────────────────────────────────────
        'secondary':                  '#59598c',
        'on-secondary':               '#ffffff',
        'secondary-container':        '#c5c4fe',
        'on-secondary-container':     '#4f4f81',
        'secondary-fixed':            '#e2dfff',
        'secondary-fixed-dim':        '#c2c1fb',
        'on-secondary-fixed':         '#151545',
        'on-secondary-fixed-variant': '#424273',
        // ── Tertiary (Amber/Gold) ─────────────────────────────────────
        'tertiary':                   '#492c00',
        'on-tertiary':                '#ffffff',
        'tertiary-container':         '#674000',
        'on-tertiary-container':      '#fca517',
        'tertiary-fixed':             '#ffddb7',
        'tertiary-fixed-dim':         '#ffb95e',
        'on-tertiary-fixed':          '#2a1700',
        'on-tertiary-fixed-variant':  '#653e00',
        // ── Outline ──────────────────────────────────────────────────
        'outline':                    '#777585',
        'outline-variant':            '#c7c4d6',
        // ── Error ────────────────────────────────────────────────────
        'error':                      '#ba1a1a',
        'on-error':                   '#ffffff',
        'error-container':            '#ffdad6',
        'on-error-container':         '#93000a',
        // ── Misc ─────────────────────────────────────────────────────
        'surface-tint':               '#4e4cce',
        'surface-variant':            '#e4e1ec',
      },
      fontFamily: {
        'headline': ['Noto Serif', 'serif'],
        'body':     ['Manrope', 'sans-serif'],
        'label':    ['Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
