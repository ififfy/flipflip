export interface Theme {
  palette: {
    mode: string;
    primary: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
      A100: string;
      A200: string;
      A400: string;
      A700: string;
      main: string;
    };
    secondary: {
      main: string;
    };
    error: {
      main: string;
    };
    text: {
      hint: string;
    };
    // migration only
    type?: string;
  };
}

const defaultTheme: Theme = {
  palette: {
    mode: "light",
    primary: {
      50: "#e8eaf6",
      100: "#c5cae9",
      200: "#9fa8da",
      300: "#7986cb",
      400: "#5c6bc0",
      500: "#3f51b5",
      600: "#3949ab",
      700: "#303f9f",
      800: "#283593",
      900: "#1a237e",
      A100: "#8c9eff",
      A200: "#536dfe",
      A400: "#3d5afe",
      A700: "#304ffe",
      main: "#3f51b5",
    },
    secondary: {
      main: "#f50057",
    },
    error: {
      main: "#f44336",
    },
    text: {
      hint: "rgba(0, 0, 0, 0.38)",
    },
  },
};

export default defaultTheme;
