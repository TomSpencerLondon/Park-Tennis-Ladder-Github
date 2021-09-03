import React from 'react'

type ThemeContextType = {
  mode: string,
  toggle (): void;
}

const defaultMode = 'dark';

export const ManageThemeContext: React.Context<ThemeContextType> = React.createContext({
  mode: defaultMode,
  toggle: () => { }
});

export const useTheme = () => React.useContext(ManageThemeContext);

function ThemeManager({ children }: any) {

  const [themeState, setThemeState] = React.useState({
    mode: defaultMode
  });

  const toggle = (): void => {
    setThemeState({ mode: (themeState.mode === 'light' ? `dark` : `light`) });
  }

  return (
    <ManageThemeContext.Provider value={{
      mode: themeState.mode,
      toggle: toggle
    }}>
      {children}
    </ManageThemeContext.Provider>
  );
}

export default ThemeManager;