export type ThemesType = {
  [id: string]: any; 
}
  // wimbledon green: '#007649',
// #593987 wimbledon purple
// brazil  green: '#009c3b',
const colors = {
  // green: '#6c935c',
  green: '#52bb38',
  // green: '#007649',
  // green: '#028f1e',
  wimbledonGreen: '#007649',
  wimbledonPurple: '#593987',
  orange: "#f2711c",
  black: "#000",
  blackPearl: "#181A1B",
  blackLight: "#272B30",
  // blackLight: "#e8e6e3",
  // grey: "#222426",
  grey: "#292b2c",
  darkGrey: "#222426",
  lightGrey: "#D3D3D3",
  white: "#FFF",
  whiteSmoke: "#F5F5F5",
  whiteLight: "#E1E1E1",
  blue: "#2185d0",
  gold: "#daa520",
  yellow: "#ccdc0a",
  lightBlue: "#33C3F0"
}

const lightTheme = {
  primary: colors.gold,
  headerBackgroundColor: colors.white,
  headerTextColor: colors.gold,
  backgroundColor: colors.white,
  menuBackgroundColor: colors.whiteSmoke,
  menuColor: colors.lightGrey,
  inputBackgroundColor: colors.white,
  dividerColor: colors.blackLight,
  textColor: colors.blackPearl,
  linkTextColor: colors.gold,
}

const darkTheme = {
  primary: colors.yellow,
  primaryButton: colors.blue,
  headerBackgroundColor: colors.blackPearl,
  headerTextColor: colors.green,
  backgroundColor: colors.blackPearl,
  inputBackgroundColor: colors.blackLight,
  menuBackgroundColor: colors.black,
  menuColor: colors.green,
  menuActiveColor: colors.yellow,
  dividerColor: colors.grey,
  textColor: colors.lightGrey,
  inverseTextColor: colors.blackPearl,
  linkTextColor: colors.green,
}

const themes: ThemesType = {
  light: lightTheme,
  dark: darkTheme,
}

export default themes;