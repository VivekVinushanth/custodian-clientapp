import React, { useState, useEffect } from "react";
import {
    ThemeProvider, CssBaseline, Container, Paper, Grid, Typography,
    TextField, Button, AppBar, Toolbar, IconButton, Badge, Dialog,
    DialogTitle, DialogContent, DialogActions, Box, Chip
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { v4 as uuidv4 } from "uuid";
import { useAuthContext  } from "@asgardeo/auth-react";
import theme from "../theme";
import EnterpriseAppBanner from "../components/ui/appadvertbanner";

const APP_ID = "custodian_client_app";
const EVENT_API = `http://localhost:8080/api/v1/${APP_ID}/event`;
const PROFILE_API = "http://localhost:8080/api/v1/profile/";

const getOrCreateDeviceId = () => {
    let id = localStorage.getItem("device_id");
    if (!id) {
        id = uuidv4();
        localStorage.setItem("device_id", id);
    }
    return id;
};
const DEVICE_ID = getOrCreateDeviceId();
// const { getDecodedIDToken } = useAuthContext();


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





const EnterpriseApp = () => {
    const { state, signIn, signOut, getDecodedIDToken } = useAuthContext();

    const [geoInfo, setGeoInfo] = useState({ ip: "0.0.0.0", city: "Unknown", country: "Unknown", timezone: "UTC" });
    const [permaId, setPermaId] = useState(null);
    const [user, setUser] = useState(null);
    const [anonName, setAnonName] = useState(() => getOrCreateAnonName());
    const [cart, setCart] = useState([]);
    const [items, setItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [cartOpen, setCartOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [preferences, setPreferences] = useState([]);


    const categoryColors = {
        "Plush Toys": "#FFCDD2",       // Soft Red
        "Educational": "#C8E6C9",      // Soft Green
        "Action Figures": "#BBDEFB",   // Soft Blue
        "Games & Puzzles": "#FFE0B2",  // Soft Orange
        "All": "#E0E0E0"               // Neutral Grey
    };

    const fetchPersonalityPreferences = (permaId) => {
        if (!permaId) return;

        fetch(`http://localhost:8080/api/v1/${permaId}/profile/personality/`)
            .then(res => res.json())
            .then(data => {
                const updatedPrefs = data.interests || ["All"];
                setPreferences(updatedPrefs); // 🌟 Central control
            })
            .catch(err => console.error("Error fetching personality preferences:", err));
    };

    const getContextInfo = () => {
        const browser = getBrowserInfo();
        return {
            ip: geoInfo.ip,
            userAgent: navigator.userAgent,
            device: {
                type: "desktop",
                os: navigator.platform,
                browser: browser.name,
                browser_version: browser.version
            },
            location: {
                country: geoInfo.country,
                city: geoInfo.city,
                timezone: geoInfo.timezone
            }
        };
    };

    const sendEvent = (eventType, eventName, properties = {}) => {
        if (!permaId) return;
        const payload = {
            perma_id: permaId,
            event_type: eventType,
            event_name: eventName,
            event_id: uuidv4(),
            app_id: APP_ID,
            event_timestamp: new Date().toISOString(),
            locale: "en-US",
            context: getContextInfo(),
            properties
        };
        fetch(EVENT_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
    };

    const sendEventWithPerma = (id, eventType, eventName, properties = {}) => {
        const payload = {
            perma_id: id,
            event_type: eventType,
            event_name: eventName,
            event_id: uuidv4(),
            app_id: APP_ID,
            event_timestamp: new Date().toISOString(),
            locale: "en-US",
            context: getContextInfo(),
            properties
        };
        fetch(EVENT_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        }).catch(err => console.error("Failed to send event:", err));
    };


    const createProfile = (identity = {}, plan = "free", user_ids = []) => {
        const payload = {
            origin_country: geoInfo.country,
            identity,
            app_context: [{
                device_id: DEVICE_ID,
                app_id: APP_ID,
                subscription_plan: plan,
                app_permissions: ["read"],
                feature_flags: { dark_mode: false },
                last_active_app: "web",
                devices: [{ device_id: DEVICE_ID, device_type: "desktop", last_used: new Date().toISOString() }]
            }],
            user_ids: user_ids,
            personality: {}
        };
        return fetch(PROFILE_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        }).then(res => res.json());
    };

    // const handleLogout = () => {
    //     sessionStorage.clear();      // clear session data
    //     localStorage.clear();        // optionally clear device_id etc.
    //     signOut();                   // triggers logout from Asgardeo
    // };

    const handleLogout = () => {
        // Do NOT remove cart here
        sendEvent("identify", "user_logged_out", {
            user_id: user?.user_id,
            username: user?.username,
            email: user?.email,
            device_id: DEVICE_ID
        });
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("cart");

        signOut();
    };


    useEffect(() => {

        const existingPermaId = sessionStorage.getItem("perma_id");
        if (existingPermaId) {
            setPermaId(existingPermaId);
        }

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

                createProfile({ country: info.country, timezone: info.timezone }).then(data => {
                    if (data.perma_id) {
                        sessionStorage.setItem("perma_id", data.perma_id);
                        setPermaId(data.perma_id);
                        sendEventWithPerma(data.perma_id, "identify", "guest_user_session", {
                            username: anonName,
                            device_id: DEVICE_ID
                        });
                        fetchPersonalityPreferences(data.perma_id);
                    }
                });
            });

        setItems(Array.from({ length: 10 }).map((_, i) => ({
            id: uuidv4(),
            name: `Toy Item ${i + 1}`,
            price: (Math.random() * 100).toFixed(2),
            image: `https://source.unsplash.com/150x150/?toy,kids&sig=${i}`
        })));

        window.addEventListener("scroll", () => sendEvent("track", "page_scrolled"));
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
            getDecodedIDToken().then(decodedIDToken => {
                const userData = {
                    user_id: decodedIDToken.sub,
                    username: decodedIDToken.username,
                    email: decodedIDToken.email,
                    idp_provider: "Asgardeo"
                };
                setUser(userData);
                sessionStorage.setItem("user", JSON.stringify(userData));

                createProfile({
                    country: geoInfo.country,
                    timezone: geoInfo.timezone,
                    email: decodedIDToken.email,
                    username: decodedIDToken.username,
                    first_name: decodedIDToken.given_name || "" ,
                    last_name: decodedIDToken.family_name || ""
                }, "premium", [decodedIDToken.sub] ).then(data => {
                    if (data.perma_id) {
                        sessionStorage.setItem("perma_id", data.perma_id);
                        setPermaId(data.perma_id);
                        if (decodedIDToken.sub) {
                            sendEvent("identify", "user_logged_in", userData);
                        } else {
                            sendEvent("identify", "guest_user_session_with_id", userData);
                        }
                        fetchPersonalityPreferences(data.perma_id);
                    }
                });
            });
        }
    }, [state.isAuthenticated]);

    const addToCart = (item) => {
        setCart(prev => [...prev, item]);
        sendEvent("track", "add_to_cart", {
            action: "click",
            objecttype: "product",
            objectname: item.name,
            value: item.price,
        });
    };

    const handleCheckout = () => {
        if (!user) return signIn();
        sendEvent("track", "purchase_initiated", {
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
            <AppBar position="static">
                <Toolbar sx={{ justifyContent: "space-between" }}>
                    <Typography variant="h6">Enterprise E-Commerce</Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <IconButton color="inherit" onClick={() => {
                            setCartOpen(true);
                            sendEvent("track", "cart_opened");
                        }}>
                            <Badge badgeContent={cart.length} color="secondary">
                                <ShoppingCartIcon />
                            </Badge>
                        </IconButton>
                        <Typography variant="body2">{user?.username || anonName}</Typography>
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
                <EnterpriseAppBanner preferences={preferences} />

                <TextField
                    fullWidth
                    placeholder="Search toys..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    variant="outlined"
                    margin="normal"
                />
                <Box sx={{ my: 2, display: "flex", gap: 1, overflowX: "auto" }}>
                    {categories.map(cat => (
                        <Chip
                            key={cat}
                            label={cat}
                            clickable
                            color={selectedCategory === cat ? "primary" : "default"}
                            onClick={() => {
                                setSelectedCategory(cat);
                                if (cat !== "All") { // ✅ Condition added here
                                    sendEvent("track", "category_searched", {
                                        action: "select_category",
                                        objecttype: "category",
                                        objectname: cat
                                    });
                                }
                                fetchPersonalityPreferences(permaId);
                            }
                        }
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
        </ThemeProvider>
    );
};

export default EnterpriseApp;
