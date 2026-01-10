// theme.js (or wherever you createTheme)
import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#cbb994", // champagne gold (focus ring + tabs + buttons)
    },
    secondary: {
      main: "#7a1f2b", // burgundy accent (optional)
    },
    error: {
      main: "#ef5350", // keep error as actual error red
    },
    background: {
      default: "#0f0f10",
      paper: "#141416",
    },
  },
});
