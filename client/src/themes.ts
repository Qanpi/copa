import { createTheme, responsiveFontSizes } from "@mui/material";

export const darkTheme = responsiveFontSizes(createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#241C43"
    },
    primary: {
      main: "#4398B8"
    },
    secondary: {
      main: "#F0155F"
    },
  },
  typography: {
    h2: {
      fontSize: "4rem",
      fontWeight: 600
    }
  },
}));

export const lightTheme = responsiveFontSizes(createTheme({
  typography: {
    h2: {
      fontSize: "4rem",
      fontWeight: 600
    }
  },
}));
