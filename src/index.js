import React, {useEffect} from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme"; // Import the custom theme
import { AuthProvider } from '@asgardeo/auth-react';
import { AnalyticsProvider } from "profile-tracker-react-sdk";

const authConfig = {
    signInRedirectURL: "http://localhost:3000",
    signOutRedirectURL: "http://localhost:3000",
    clientID: "mK67JnpQhteBsXwNUb_jnFsdiXka",
    baseUrl: "https://localhost:9443",
    scope: ["openid", "profile", "phone"],
    endpoints: {
        authorizationEndpoint: "https://localhost:9443/oauth2/authorize",
        tokenEndpoint: "https://localhost:9443/oauth2/token",
        revokeEndpoint: "https://localhost:9443/oauth2/revoke",
        endSessionEndpoint: "https://localhost:9443/oidc/logout",
        jwksUri: "https://localhost:9443/oauth2/jwks",
        userInfoEndpoint: "https://localhost:9443/oauth2/userinfo", // optional
        oidcSessionIFrameEndpoint: "https://localhost:9443/oidc/checksession" // optional
    }
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <AuthProvider config={authConfig}>
        <AnalyticsProvider clientId="custodian_client_app" orgId="carbon.super">
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <App />
            </ThemeProvider>
        </AnalyticsProvider>
    </AuthProvider>
);
