import React, { useState, useEffect, useRef } from "react";
import {
    ThemeProvider, CssBaseline, Container, Paper, Grid, Typography,
    TextField, Button, IconButton, Badge, Dialog,
    DialogTitle, DialogContent, DialogActions, Box, Chip
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { v4 as uuidv4 } from "uuid";
import { useAuthContext  } from "@asgardeo/auth-react";
import theme from "../theme";
import EnterpriseAppBanner from "../components/ui/appadvertbanner";
import { tracker, getProfileId, clear, getBaseUrl } from "profile-tracker-react-sdk";

const getOrCreateDeviceId = () => {
    let id = localStorage.getItem("device_id");
    if (!id) {
        id = uuidv4();
        localStorage.setItem("device_id", id);
    }
    return id;
};
const DEVICE_ID = getOrCreateDeviceId();


const categories = ["All", "Plush Toys", "Educational", "Action Figures", "Games & Puzzles"];

const toyImages = {
    "Plush Toys": "/images/plush_toy",
    "Educational": "/images/educational_toy",
    "Action Figures": "/images/action_toy",
    "Games & Puzzles": "/images/puzzle_toy"
};

const generateAnonName = () => {
    const animals = ["turtle", "goose", "panda", "fox"];
    const moods = ["happy", "stealthy", "clever", "bold"];
    const r = (arr) => arr[Math.floor(Math.random() * arr.length)];
    return `anon-${r(moods)}-${r(animals)}`;
};

const getOrCreateAnonName = () => {
    let name = sessionStorage.getItem("anon_name");
    if (!name) {
        name = generateAnonName();
        sessionStorage.setItem("anon_name", name);
    }
    return name;
};


const getBrowserInfo = () => {
    const ua = navigator.userAgent;
    if (ua.includes("Chrome")) return { name: "Chrome", version: ua.match(/Chrome\/([\d.]+)/)?.[1] || "" };
    if (ua.includes("Firefox")) return { name: "Firefox", version: ua.match(/Firefox\/([\d.]+)/)?.[1] || "" };
    if (ua.includes("Safari")) return { name: "Safari", version: ua.match(/Version\/([\d.]+)/)?.[1] || "" };
    return { name: "Unknown", version: "" };
};

const EnterpriseApp = ({ cart, setCart, cartOpen, setCartOpen, user, signIn, setMode }) => {
    const { state, getDecodedIDToken, getAccessToken } = useAuthContext();
    const [geoInfo, setGeoInfo] = useState({ ip: "0.0.0.0", city: "Unknown", country: "Unknown", timezone: "UTC" });
    const [anonName, setAnonName] = useState(() => getOrCreateAnonName());
    const [items, setItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [newsletterOpen, setNewsletterOpen] = useState(false);
    const [newsletterEmail, setNewsletterEmail] = useState("");
    const [showNewsletterBanner, setShowNewsletterBanner] = useState(true);
    const [campaign2Count, setCampaign2Count] = useState(0);
    const [spendingCapability, setSpendingCapability] = useState("normal");
    const [traits, setTraits] = useState({});
    const [selectedCategory, setSelectedCategory] = useState("All");
    const hasSetInitialTheme = useRef(false);

    const fetchPersonalityPreferences = async () => {
        try {
            if (state.isAuthenticated) {
                const token = await getAccessToken();
                const response = await fetch(`${getBaseUrl()}/api/v1/profiles/Me`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const data = await response.json();
                console.log("🌟 Authenticated profile response:", data);

                if (data?.traits) {
                    setTraits(data.traits);
                } else {
                    setTraits({});
                }
            } else {
                const profileId = getProfileId();
                if (!profileId) return;

                const response = await fetch(`${getBaseUrl()}/api/v1/profiles/${profileId}`);
                const data = await response.json();
                console.log("🌟 Guest profile response:", data);

                if (data?.traits) {
                    setTraits(data.traits);
                } else {
                    setTraits({});
                }
            }
        } catch (err) {
            console.error("❌ Error fetching personality preferences:", err);
        }
    };

    useEffect(() => {
        if (searchQuery.trim() === "") return;

        const delayDebounce = setTimeout(() => {
            tracker.track("search", {
                action: "type",
                objecttype: "search_box",
                objectname: searchQuery
            });
        }, 600); // delay to avoid firing too frequently

        return () => clearTimeout(delayDebounce);
    }, [searchQuery]);


    const categoryColors = {
        "Plush Toys": "#FFCDD2",       // Soft Red
        "Educational": "#C8E6C9",      // Soft Green
        "Action Figures": "#BBDEFB",   // Soft Blue
        "Games & Puzzles": "#FFE0B2",  // Soft Orange
        "All": "#E0E0E0"               // Neutral Grey
    };

    const handleLogout = () => {
        // Do NOT remove cart here
        tracker.identify("user_logged_out", {
            user_id: user?.user_id,
            username: user?.username,
            email: user?.email,
            device_id: DEVICE_ID
        });
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("cart");

        // todo: clear the session state
        signOut();
    };

    useEffect(() => {
        fetchPersonalityPreferences()
    }, []);

    useEffect(() => {
        if (!hasSetInitialTheme.current && traits?.preferred_theme) {
            setMode(traits.preferred_theme);
            hasSetInitialTheme.current = true;
        }
    }, [traits, setMode]);

    useEffect(() => {

        fetch("https://ipapi.co/json/")
            .then(res => res.json())
            .then(data => {
                const info = {
                    ip: data.ip || "0.0.0.0",
                    city: data.city || "Unknown",
                    country: data.country_name || "Unknown",
                    timezone: data.timezone || "UTC"
                };
                setGeoInfo(info);
                tracker.identify("guest_user_session", {
                    username: anonName,
                    device_id: DEVICE_ID
                });
                setTimeout(() => {
                    fetchPersonalityPreferences();
                }, 5000);                });

        setItems(Array.from({ length: 10 }).map((_, i) => ({
            id: uuidv4(),
            name: `Toy Item ${i + 1}`,
            price: (Math.random() * 100).toFixed(2),
            image: `https://source.unsplash.com/150x150/?toy,kids&sig=${i}`
        })));
        return () => window.removeEventListener("scroll", () => {});
    }, []);

    useEffect(() => {
        const savedCart = sessionStorage.getItem("cart");
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    useEffect(() => {
        sessionStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        const generatedItems = Array.from({ length: 12 }).map((_, i) => {
            const category = categories[(i % (categories.length - 1)) + 1];
            return {
                id: uuidv4(),
                name: `${category} #${i + 1}`,
                category,
                price: (Math.random() * 100).toFixed(2),
                image: `${toyImages[category]}_${i+1}.png`
            };
        });
        setItems(generatedItems);
    }, []);

    useEffect(() => {
        if (state.isAuthenticated) {
            console.log("are we not authenticated?")
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

                if (getProfileId()) {
                    tracker.identify("user_logged_in", userData);

                    // Delay the fetchPersonalityPreferences call by 5 minutes (300,000 ms)
                    setTimeout(() => {
                        fetchPersonalityPreferences();
                    }, 5000);                }
            });

        }
    }, [state.isAuthenticated]);

    const addToCart = (item) => {
        setCart(prev => [...prev, item]);
        tracker.track("add_to_cart", {
            action: "click",
            objecttype: "product",
            objectname: item.name,
            value: item.price,
        });
    };

    const handleCheckout = () => {
        if (!user) return signIn();
        tracker.track("purchase_initiated", {
            object_type: "cart",
            value: cart.reduce((sum, item) => sum + parseFloat(item.price), 0).toFixed(2)
        });
        alert("✅ Purchase completed");
        setCart([]);
        setCartOpen(false);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {showNewsletterBanner && (
                <Box
                    sx={{
                        position: "fixed",
                        top: 80,
                        right: 24,
                        zIndex: 1300,
                        backgroundColor: "#f9fbe7",
                        border: "1px solid #cddc39",
                        borderRadius: 2,
                        px: 2,
                        py: 1,
                        boxShadow: 3,
                        display: "flex",
                        alignItems: "center",
                        gap: 1
                    }}
                >
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>📬 Get toy deals!</Typography>
                    <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => setNewsletterOpen(true)}
                    >
                        Subscribe
                    </Button>
                    <IconButton
                        size="small"
                        onClick={() => setShowNewsletterBanner(false)}
                    >
                        ✕
                    </IconButton>
                </Box>
            )}
            <Container maxWidth="lg" sx={{ py: 4 }}>
                {traits && Object.keys(traits).length > 0 && (
                    <EnterpriseAppBanner traits={traits} items={items} />
                )}

                <TextField
                    fullWidth
                    placeholder="Search toys..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    variant="outlined"
                    margin="normal"
                    sx={{
                        bgcolor: (theme) => theme.palette.mode === 'dark' ? '#23272b' : theme.palette.background.paper,
                        color: (theme) => theme.palette.text.primary,
                        input: {
                            color: (theme) => theme.palette.text.primary,
                        },
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                                borderColor: (theme) => theme.palette.mode === 'dark' ? '#555' : '#ccc',
                            },
                            '&:hover fieldset': {
                                borderColor: (theme) => theme.palette.primary.main,
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: (theme) => theme.palette.primary.main,
                            },
                        },
                    }}
                />
                <Box sx={{ my: 2, display: "flex", gap: 1, overflowX: "auto" }}>
                    {categories.map(cat => (
                        <Chip
                            key={cat}
                            label={cat}
                            clickable
                            color={selectedCategory === cat ? "primary" : "default"}
                            sx={{
                                bgcolor: (theme) => selectedCategory === cat
                                    ? (theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.main)
                                    : (theme.palette.mode === 'dark' ? '#23272b' : '#f5f5f5'),
                                color: (theme) => selectedCategory === cat
                                    ? theme.palette.getContrastText(theme.palette.primary.main)
                                    : (theme.palette.mode === 'dark' ? '#fff' : '#333'),
                                border: selectedCategory === cat ? 'none' : '1px solid',
                                borderColor: (theme) => selectedCategory === cat ? 'transparent' : (theme.palette.mode === 'dark' ? '#555' : '#ccc'),
                                fontWeight: selectedCategory === cat ? 700 : 400
                            }}
                            onClick={() => {
                                setSelectedCategory(cat);
                                if (cat !== "All") {
                                    tracker.track("category_searched", {
                                        action: "select_category",
                                        objecttype: "category",
                                        objectname: cat
                                    });
                                }
                                setTimeout(() => {
                                    fetchPersonalityPreferences();
                                }, 5000);
                            }}
                        />
                    ))}
                </Box>
                <Grid container spacing={3}>
                    {items.filter(item =>
                        (selectedCategory === "All" || item.category === selectedCategory) &&
                        item.name.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map(item => (
                        <Grid item xs={6} sm={4} md={3} key={item.id}>
                            <Paper sx={{
                                p: 2,
                                textAlign: "center",
                                backgroundColor: categoryColors[item.category] || categoryColors["All"]
                            }}>                                <img src={item.image} alt={item.name} style={{ width: "100%", height: 150, objectFit: "cover", borderRadius: 4 }} />
                                <Typography variant="subtitle1">{item.name}</Typography>
                                <Typography variant="body2">${item.price}</Typography>
                                <Button variant="contained" onClick={() => addToCart(item)}>Add to Cart</Button>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            <Dialog open={cartOpen} onClose={() => setCartOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Your Cart</DialogTitle>
                <DialogContent dividers>
                    {cart.length ? cart.map((item, index) => (
                        <Typography key={index}>{item.name} - ${item.price}</Typography>
                    )) : <Typography>Your cart is empty.</Typography>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCartOpen(false)}>Close</Button>
                    <Button variant="contained" onClick={handleCheckout} disabled={!cart.length}>
                        Checkout
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={newsletterOpen} onClose={() => setNewsletterOpen(false)}>
                <DialogTitle>Subscribe to our Newsletter</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Email Address"
                        type="email"
                        fullWidth
                        variant="standard"
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setNewsletterOpen(false)}>Cancel</Button>
                    <Button
                        onClick={() => {
                            tracker.track("newsletter_subscribed", {
                                email: newsletterEmail,
                                device_id: DEVICE_ID,
                                username: anonName,
                                newsletter_subscribed:true
                            });
                            setNewsletterOpen(false);
                            setShowNewsletterBanner(false);
                            setNewsletterEmail("");
                            alert("🎉 Subscribed successfully!");
                        }}
                        disabled={!newsletterEmail}
                    >
                        Subscribe
                    </Button>
                </DialogActions>
            </Dialog>

        </ThemeProvider>
    );
};

export default EnterpriseApp;
