import * as React from 'react';
import { styled } from '@mui/material/styles';
import {
    ThemeProvider,
    CssBaseline,
    Container,
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Badge,
    Box,
    Button,
} from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';
import { useAuthContext, AuthProvider } from '@asgardeo/auth-react';
import EnterpriseApp from '../../pages/EnterpriseApp';
import theme from '../../theme';

// ✅ Your Asgardeo Config
const authConfig = {
    signInRedirectURL: 'http://localhost:3000',
    signOutRedirectURL: 'http://localhost:3000',
    clientID: 'mFk7qN0cvcOqDDnDB0h7OXp3dR8a',
    baseUrl: 'https://api.asgardeo.io/t/vanheim',
    scope: ['openid', 'profile'],
};

function AppShell() {
    const { state, signIn, signOut } = useAuthContext();
    const cart = JSON.parse(sessionStorage.getItem('cart') || '[]');
    const username = JSON.parse(sessionStorage.getItem('user') || 'null')?.username;

    const handleLogout = () => {
        sessionStorage.clear();
        signOut();
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AppBar position="static" color="primary">
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="h6">Enterprise E-Commerce</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton color="inherit">
                            <Badge badgeContent={cart.length} color="secondary">
                                <ShoppingCart />
                            </Badge>
                        </IconButton>
                        {username ? (
                            <>
                                <Typography variant="body2">Hi, {username}</Typography>
                                <Button variant="outlined" color="inherit" onClick={handleLogout}>
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <Button variant="contained" color="secondary" onClick={signIn}>
                                Sign Up / Login
                            </Button>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ py: 4 }}>
                <EnterpriseApp />
            </Container>
        </ThemeProvider>
    );
}

// ✅ Wrap with Asgardeo AuthProvider
export default function DashboardLayoutBasic() {
    return (
        <AuthProvider config={authConfig}>
            <AppShell />
        </AuthProvider>
    );
}
