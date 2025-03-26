import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        primary: {
            main: "#0957b6", // WSO2 Orange
        },
        secondary: {
            main: "#47c1ef", // WSO2 Blue
        },
        background: {
            default: "#F4F4F4", // Light Gray
            paper: "#FFFFFF", // White for cards
        },
        text: {
            primary: "#333333", // Dark Gray
            secondary: "#666666",
        },
    },
    typography: {
        fontFamily: "Inter, Arial, sans-serif", // WSO2's modern font choice
    },
});

export default theme;
