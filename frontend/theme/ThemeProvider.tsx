import React, { ReactChild } from 'react'
import { ThemeProvider } from 'styled-components'
import themes from './themes'
import { useTheme } from './ThemeManager'

type PropTypes = {
  children: ReactChild;
}

function _ThemeProvider({children}: PropTypes) {
  const theme = useTheme();

  const _theme = themes[theme.mode];
  
  return (
    <ThemeProvider theme={_theme}>
      {children}
    </ThemeProvider>
  );
}

export default _ThemeProvider;