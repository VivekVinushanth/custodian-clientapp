import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme"; // Import the custom theme
import { AuthProvider } from '@asgardeo/auth-react';

const authConfig = {
    signInRedirectURL: "https://a8cb2cd1-0b15-4861-810c-d148b964d3a0.e1-us-east-azure.choreoapps.dev",
    signOutRedirectURL: "https://a8cb2cd1-0b15-4861-810c-d148b964d3a0.e1-us-east-azure.choreoapps.dev",
    clientID: "mFk7qN0cvcOqDDnDB0h7OXp3dR8a",
    baseUrl: "https://api.asgardeo.io/t/vanheim",
    scope: ["openid", "profile"],
    endpoints: {
        authorizationEndpoint: "https://api.asgardeo.io/t/vanheim/oauth2/authorize",
        tokenEndpoint: "https://api.asgardeo.io/t/vanheim/oauth2/token",
        revokeEndpoint: "https://api.asgardeo.io/t/vanheim/oauth2/revoke",
        endSessionEndpoint: "https://api.asgardeo.io/t/vanheim/oidc/logout",
        jwksUri: "https://api.asgardeo.io/t/vanheim/oauth2/jwks",
        userInfoEndpoint: "https://api.asgardeo.io/t/vanheim/oauth2/userinfo", // optional
        oidcSessionIFrameEndpoint: "https://api.asgardeo.io/t/vanheim/oidc/checksession" // optional
    }
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <AuthProvider config={authConfig}>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
        </ThemeProvider>
    </AuthProvider>
);
