// theme.ts
export type ThemeType = typeof theme;

const theme = {
    colors: {
      background: '#121212', // dark background
      surface: '#1F1F1F', // card/table background
      primary: '#0F9D58', // deep green (poker table)
      primaryVariant: '#0B7C44',
      secondary: '#D32F2F', // red for danger/raise/fold
      accent: '#FFD700', // gold accent for chips/highlights
      textPrimary: '#FFFFFF',
      textSecondary: '#B0B0B0',
      border: '#333',
      shadow: 'rgba(0, 0, 0, 0.5)',
  
      // Status Colors
      success: '#4CAF50',
      warning: '#FFC107',
      error: '#F44336',
  
      // Gradients
      gradients: {
        backgroundGradient: 'linear-gradient(to bottom, #121212, #1F1F1F)',
        surfaceGradient: 'linear-gradient(to bottom, #1F1F1F, #2A2A2A)',
      },
    },
  
    typography: {
      fontFamily: `'Roboto', 'Arial', sans-serif`,
      sizes: {
        xs: '0.75rem',    // 12px
        sm: '0.875rem',   // 14px
        base: '1rem',     // 16px
        lg: '1.125rem',   // 18px
        xl: '1.25rem',    // 20px
        '2xl': '1.5rem',  // 24px
        '3xl': '1.875rem' // 30px
      },
      weights: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700'
      }
    },
  
    spacing: {
      0: '0',
      1: '0.25rem',    // 4px
      2: '0.5rem',     // 8px
      3: '0.75rem',    // 12px
      4: '1rem',       // 16px
      5: '1.25rem',    // 20px
      6: '1.5rem',     // 24px
      8: '2rem',       // 32px
      10: '2.5rem',    // 40px
      12: '3rem'       // 48px
    },
  
    borderRadius: {
      none: '0',
      sm: '0.25rem',    // 4px
      md: '0.5rem',     // 8px
      lg: '1rem',       // 16px
      full: '9999px'
    },
  
    shadows: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px rgba(0, 0, 0, 0.2)',
      card: '0px 4px 10px rgba(0, 0, 0, 0.25)',
      button: '0px 2px 4px rgba(0, 0, 0, 0.3)',
    },
  
    components: {
      button: {
        primary: {
          background: '#0F9D58',
          color: '#FFFFFF',
          borderRadius: '0.5rem',
          padding: '0.75rem 1.25rem',
          shadow: '0px 2px 4px rgba(0,0,0,0.3)',
          hover: {
            background: '#0B7C44',
          }
        },
        secondary: {
          background: '#D32F2F',
          color: '#FFFFFF',
          borderRadius: '0.5rem',
          padding: '0.75rem 1.25rem',
          shadow: '0px 2px 4px rgba(0,0,0,0.3)',
          hover: {
            background: '#B71C1C',
          }
        },
        disabled: {
          background: '#444',
          color: '#999',
        },
      },
      dialog: {
        background: '#1F1F1F',
        border: '#333',
        shadow: '0px 4px 20px rgba(0, 0, 0, 0.5)',
      },
      input: {
        background: 'rgba(31, 31, 31, 0.5)',
        border: '#333',
        text: '#FFFFFF',
        placeholder: '#666',
        focus: {
          border: '#0F9D58',
          shadow: '0 0 0 2px rgba(15, 157, 88, 0.2)',
        }
      }
    }
  } as const;
  
  export default theme;
  
  // Helper function to get theme values
  export function getThemeValue<T>(path: string[], themeObject: any = theme): T {
    return path.reduce((obj, key) => obj[key], themeObject);
  }
  