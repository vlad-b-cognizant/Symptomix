import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2E86AB',
    primaryContainer: '#A8E6CF',
    secondary: '#F18F01',
    secondaryContainer: '#FFE5B4',
    surface: '#FFFFFF',
    background: '#F5F7FA',
    error: '#E53E3E',
    warning: '#F6AD55',
    success: '#48BB78',
    text: '#2D3748',
    onSurface: '#4A5568',
    outline: '#E2E8F0',
  },
  fonts: {
    ...DefaultTheme.fonts,
    bodyLarge: {
      fontSize: 16,
      fontWeight: '400',
    },
    headlineMedium: {
      fontSize: 24,
      fontWeight: '600',
    },
  },
};
