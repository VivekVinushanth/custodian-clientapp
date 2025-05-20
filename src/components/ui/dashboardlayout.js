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
import { tracker } from "profile-tracker-react-sdk";

// ✅ Your Asgardeo Config
const authConfig = {
    signInRedirectURL: 'http://localhost:3000',
    signOutRedirectURL: 'http://localhost:3000',
    clientID: 'mFk7qN0cvcOqDDnDB0h7OXp3dR8a',
    baseUrl: 'https://api.asgardeo.io/t/vanheim',
    scope: ['openid', 'profile'],
};

function AppShell() {
    const { state, signIn, signOut, getDecodedIDToken, getAccessToken } = useAuthContext();
    const [user, setUser] = React.useState(null);
    const [anonName, setAnonName] = React.useState(() => {
        let name = sessionStorage.getItem("anon_name");
        if (!name) {
            const animals = ["turtle", "goose", "panda", "fox"];
            const moods = ["happy", "stealthy", "clever", "bold"];
            const r = (arr) => arr[Math.floor(Math.random() * arr.length)];
            name = `anon-${r(moods)}-${r(animals)}`;
            sessionStorage.setItem("anon_name", name);
        }
        return name;
    });
    const [cart, setCart] = React.useState(() => JSON.parse(sessionStorage.getItem('cart' ) || '[]'));
    const [cartOpen, setCartOpen] = React.useState(false);
    const [mode, setMode] = React.useState('light');

    const customTheme = React.useMemo(() => ({
        ...theme,
        palette: {
            ...theme.palette,
            mode,
            background: {
                ...theme.palette.background,
                default: mode === 'dark' ? '#23272b' : '#F4F4F4',
                paper: mode === 'dark' ? '#282c34' : '#FFFFFF',
            },
            text: {
                ...theme.palette.text,
                primary: mode === 'dark' ? '#fff' : '#333',
                secondary: mode === 'dark' ? '#ccc' : '#666',
            },
        },
    }), [mode]);

    React.useEffect(() => {
        const savedCart = sessionStorage.getItem("cart");
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);
    React.useEffect(() => {
        sessionStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);
    React.useEffect(() => {
        if (state.isAuthenticated) {
            getDecodedIDToken().then(decodedIDToken => {
                const userData = {
                    user_id: decodedIDToken.sub,
                    user_name: decodedIDToken.username,
                    email: decodedIDToken.email,
                    first_name: decodedIDToken?.given_name,
                    last_name: decodedIDToken?.family_name,
                    phone_number: decodedIDToken?.phone_number,
                    idp_provider: "Asgardeo"
                };
                setUser(userData);
                sessionStorage.setItem("user", JSON.stringify(userData));
            });
        } else {
            setUser(null);
        }
    }, [state.isAuthenticated]);

    const handleLogout = () => {
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("cart");
        signOut();
    };

    const handleToggleMode = () => {
        setMode(prev => {
            const next = prev === 'light' ? 'dark' : 'light';
            console.log(`Theme mode toggled: ${next}`);
            tracker.track("theme_changed", {
                action: "theme_changed",
                new_theme: `${next}`
            });
            return next;
        });
    };

    const setModeFromPreferences = (newMode) => {
        setMode(newMode);
    };

    return (
        <ThemeProvider theme={customTheme}>
            <CssBaseline />
            <Box sx={{ bgcolor: 'background.default', color: 'text.primary', minHeight: '100vh' }}>
                <AppBar position="static">
                    <Toolbar sx={{ justifyContent: "space-between" }}>
                        <Typography variant="h6">Enterprise E-Commerce</Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <IconButton color="inherit" onClick={handleToggleMode} title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
                                {mode === 'light' ? (
                                    <span role="img" aria-label="dark mode">🌙</span>
                                ) : (
                                    <span role="img" aria-label="light mode">☀️</span>
                                )}
                            </IconButton>
                            <IconButton color="inherit" onClick={
                                () => {setCartOpen(true)
                                       tracker.track("cart_opened")
                                }}>
                                <Badge badgeContent={cart.length} color="secondary">
                                    <ShoppingCart />
                                </Badge>
                            </IconButton>
                            <Typography variant="body2">{user?.user_name || anonName}</Typography>
                            {user ? (
                                <Button onClick={handleLogout} variant="contained" color="secondary">
                                    Logout
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => {
                                        if (!state?.isLoading) {
                                            signIn();
                                        } else {
                                            console.warn("Auth SDK still initializing...");
                                        }
                                    }}
                                    variant="contained"
                                    color="secondary"
                                    disabled={state?.isLoading}
                                >
                                    Sign Up / Login
                                </Button>
                            )}
                        </Box>
                    </Toolbar>
                </AppBar>
                <Container maxWidth="lg" sx={{ py: 4 }}>
                    <EnterpriseApp
                        cart={cart}
                        setCart={setCart}
                        cartOpen={cartOpen}
                        setCartOpen={setCartOpen}
                        user={user}
                        signIn={signIn}
                        setMode={setMode}
                    />
                </Container>
            </Box>
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
