// theme.ts
export type ThemeType = typeof theme;

const theme = {
    colors: {
      background: '#F8F9FA', // light off-white background
      surface: '#FFFFFF', // white card/table background
      primary: '#0F9D58', // deep green (poker table)
      primaryVariant: '#0B7C44',
      secondary: '#D32F2F', // red for danger/raise/fold
      accent: '#FFD700', // gold accent for chips/highlights
      textPrimary: '#212121',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
      shadow: 'rgba(0, 0, 0, 0.1)',
  
      // Status Colors
      success: '#4CAF50',
      warning: '#FFC107',
      error: '#F44336',
  
      // Gradients
      gradients: {
        backgroundGradient: 'linear-gradient(to bottom, #F8F9FA, #FFFFFF)',
        surfaceGradient: 'linear-gradient(to bottom, #FFFFFF, #F8F9FA)',
      },
    },
  
    // Currency configuration
    currency: {
      symbols: {
        USD: '$',
        CAD: '$',
        EUR: '€',
        GBP: '£',
        INR: '₹',
        // Add more currencies as needed
      },
      // Default currency symbol if the specified currency is not found
      defaultSymbol: '$'
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
      lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
      card: '0px 2px 8px rgba(0, 0, 0, 0.08)',
      button: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    },
  
    components: {
      button: {
        primary: {
          background: '#0F9D58',
          color: '#FFFFFF',
          borderRadius: '0.5rem',
          padding: '0.75rem 1.25rem',
          shadow: '0px 2px 4px rgba(0,0,0,0.1)',
          hover: {
            background: '#0B7C44',
          }
        },
        secondary: {
          background: '#D32F2F',
          color: '#FFFFFF',
          borderRadius: '0.5rem',
          padding: '0.75rem 1.25rem',
          shadow: '0px 2px 4px rgba(0,0,0,0.1)',
          hover: {
            background: '#B71C1C',
          }
        },
        disabled: {
          background: '#E5E7EB',
          color: '#9CA3AF',
        },
      },
      dialog: {
        background: '#FFFFFF',
        border: '#E5E7EB',
        shadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
      },
      input: {
        background: '#FFFFFF',
        border: '#E5E7EB',
        text: '#212121',
        placeholder: '#9CA3AF',
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
  
  // Helper function to get currency symbol
  export function getCurrencySymbol(currencyCode: string): string {
    if (!currencyCode) return theme.currency.defaultSymbol;
    return (theme.currency.symbols as Record<string, string>)[currencyCode] || theme.currency.defaultSymbol;
  }
  