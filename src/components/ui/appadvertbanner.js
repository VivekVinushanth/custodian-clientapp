import { useState, useEffect } from "react";
import {
    Paper, Typography, IconButton, Fade, Dialog, DialogTitle, DialogContent, DialogActions, Button,
    MenuItem, Select, InputLabel, FormControl, TextField
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { tracker } from "profile-tracker-react-sdk";

const EnterpriseAppBanner = ({ traits }) => {
    const [currentBanner, setCurrentBanner] = useState(0);
    const [banners, setBanners] = useState([]);
    const [hovered, setHovered] = useState(false);
    const [fadeIn, setFadeIn] = useState(true);
    const [offerModalOpen, setOfferModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [mobileNumber, setMobileNumber] = useState("");
    const [step, setStep] = useState(1);
    const [items] = useState(Array.from({ length: 5 }).map((_, i) => ({
        id: i,
        name: `Toy ${i + 1}`,
        price: (Math.random() * 100 + 10).toFixed(2)
    })));

    const interests = (traits?.interests?.length > 0 ? traits.interests : ["All"]);
    const spendingCapability = traits?.spending_capability || "normal";
    const campaign2Opened = traits?.campaign_2_opened || 0;

    const categoryColors = {
        "Plush Toys": "#FFCDD2",
        "Educational": "#C8E6C9",
        "Action Figures": "#BBDEFB",
        "Games & Puzzles": "#FFE0B2",
        "All": "#E0E0E0"
    };

    const offerBanners = {
        "Plush Toys": [
            {
                title: "💖 Cuddle Up Savings!",
                description: "Softness overload—perfect friends for every bedtime story!",
                category: "Plush Toys"
            },
            {
                title: "🐻 Limited Edition Plushies!",
                description: "Explore exclusive plushies available only this month. Hurry, while supplies last!",
                category: "Plush Toys"
            }
        ],
        "Educational": [
            {
                title: "🧠 Learn, Play & Save!",
                description: "OFF on all Educational Toys. Empower your child’s creativity and critical thinking!",
                category: "Educational"
            },
            {
                title: "🚀 Science Week Special!",
                description: "Free STEM Activity Kit with every Educational Toy purchase above $50.",
                category: "Educational"
            }
        ],
        "Action Figures": [
            {
                title: "⚡ Action-Packed Offers!",
                description: "Get your favorite Action Figures at 30% off—Become your hero today!",
                category: "Action Figures"
            },
            {
                title: "🥷 Collector’s Deal!",
                description: "Purchase 3 Action Figures, and get a Special Edition figure FREE.",
                category: "Action Figures"
            }
        ],
        "Games & Puzzles": [
            {
                title: "🏆 Family Fun Fiesta!",
                description: "Buy one Puzzle or Game and get the second off! Perfect for family game nights.",
                category: "Games & Puzzles"
            },
            {
                title: "🎲 Puzzle Masters Unite!",
                description: "Spend $75+ on Games & Puzzles, get a FREE Mystery Puzzle gift.",
                category: "Games & Puzzles"
            }
        ],
        "All": [
            {
                title: "🎉 Seasonal Mega Sale!",
                description: <>Enjoy up to <strong>25%</strong> off across our entire toy collection. Limited-time offer!</>,
                category: "All",
                campaign_id: "seasonal",
                offer_value: 25
            }
        ]
    };

    useEffect(() => {
        const isHighSpender = spendingCapability === "high";
        let selectedBanners = [];

        // 🎉 Always include general seasonal offer
        selectedBanners.push(...offerBanners["All"].map(b => ({
            ...b,
            campaign_id: "seasonal",
            offer_value: 25
        })));

        // 🎯 Personalized offers
        interests.forEach(pref => {
            const baseBanners = offerBanners[pref] || [];

            const enriched = baseBanners.map(banner => {
                let campaign_id = 1;
                let offer_value = 50;

                if (isHighSpender) {
                    campaign_id = 2;
                    offer_value = 10;

                    if (campaign2Opened > 3) {
                        campaign_id = 3;
                        offer_value = 20;
                    }
                }

                return {
                    ...banner,
                    campaign_id,
                    offer_value
                };
            });

            selectedBanners.push(...enriched);
        });

        setBanners(selectedBanners);
        setCurrentBanner(0);
    }, [traits]);

    useEffect(() => {
        if (!banners.length) return;

        const interval = setInterval(() => {
            setFadeIn(false);
            setTimeout(() => {
                setCurrentBanner(prev => (prev + 1) % banners.length);
                setFadeIn(true);
            }, 200);
        }, 10000);

        return () => clearInterval(interval);
    }, [banners]);

    if (!banners.length) return null;

    const current = banners[currentBanner];
    const bgColor = categoryColors[current.category] || categoryColors["All"];

    const handleManualChange = (direction) => {
        setFadeIn(false);
        setTimeout(() => {
            setCurrentBanner(prev =>
                direction === "prev"
                    ? (prev - 1 + banners.length) % banners.length
                    : (prev + 1) % banners.length
            );
            setFadeIn(true);
        }, 200);
    };

    const discountedPrice = selectedItem ? (selectedItem.price * 0.75).toFixed(2) : 0;
    const availableItems = items.filter(item =>
        item.category === current.category
    );

    const handleConfirm = () => {
        tracker.track("purchase_initiated", {
            campaign_id: current.campaign_id,
            offer_value: current.offer_value,
            item_name: selectedItem.name,
            original_price: selectedItem.price,
            final_price: discountedPrice,
            mobile_number: mobileNumber
        });
        setStep(3);
    };

    return (
        <>
            <Paper
                elevation={4}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClick={() => {
                    tracker.track("campaigned_opened", {
                        campaign_id: current.campaign_id,
                        offer_value: current.offer_value
                    });

                    // open modal only for interest-based campaigns, not general seasonal
                    if (current.campaign_id !== "seasonal") {
                        setOfferModalOpen(true);
                    }
                }}

                sx={{
                    p: 2,
                    mb: 2,
                    textAlign: "center",
                    position: "relative",
                    backgroundColor: bgColor,
                    transition: "background-color 0.3s ease",
                    cursor: current.campaign_id === "seasonal" ? "pointer" : "default",
                    animation: current.campaign_id === "campaign_2" && campaign2Opened > 2 ? "vibrate 0.3s infinite" : "none"

                }}
            >
                <Fade in={fadeIn} timeout={400}>
                    <div>
                        <Typography variant="h6">{current.title}</Typography>
                        <Typography variant="body1">{current.description}</Typography>
                        <Typography
                            variant="caption"
                            sx={{
                                fontWeight: "bold",
                                color: "#d50000",
                                fontSize: "1rem",
                                animation: "blast 1.5s ease-in-out infinite",
                                display: "inline-block",
                                mt: 1
                            }}
                        >
                            🏷️ Offer: {current.offer_value}% OFF
                        </Typography>

                    </div>
                </Fade>

                {hovered && (
                    <>
                        <IconButton
                            sx={{ position: "absolute", top: "50%", left: 8, transform: "translateY(-50%)" }}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleManualChange("prev");
                            }}
                        >
                            <ArrowBackIosNewIcon />
                        </IconButton>
                        <IconButton
                            sx={{ position: "absolute", top: "50%", right: 8, transform: "translateY(-50%)" }}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleManualChange("next");
                            }}
                        >
                            <ArrowForwardIosIcon />
                        </IconButton>
                    </>
                )}
            </Paper>

            <Dialog open={offerModalOpen} onClose={() => {
                setOfferModalOpen(false);
                setStep(1);
                setSelectedItem(null);
                setMobileNumber("");
            }}>
                <DialogTitle>🎉 Seasonal Mega Sale</DialogTitle>
                <DialogContent dividers>
                    {step === 1 && (
                        <>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Select a Toy</InputLabel>
                                <Select
                                    value={selectedItem?.id || ""}
                                    onChange={(e) => {
                                        const item = items.find(i => i.id === e.target.value);
                                        setSelectedItem(item);
                                    }}
                                >
                                    {items.map(item => (
                                        <MenuItem key={item.id} value={item.id}>
                                            {item.name} - ${item.price}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            {selectedItem && (
                                <Typography>
                                    Discounted Price: <strong>${discountedPrice}</strong>
                                </Typography>
                            )}
                        </>
                    )}
                    {step === 2 && (
                        <TextField
                            fullWidth
                            label="Enter your Mobile Number"
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value)}
                        />
                    )}
                    {step === 3 && (
                        <Typography sx={{ color: "green", fontWeight: "bold" }}>
                            ✅ Purchase Successful!
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    {step === 1 && (
                        <Button
                            variant="contained"
                            onClick={() => setStep(2)}
                            disabled={!selectedItem}
                        >
                            Confirm
                        </Button>
                    )}
                    {step === 2 && (
                        <Button
                            variant="contained"
                            onClick={handleConfirm}
                            disabled={!mobileNumber}
                        >
                            Complete Purchase
                        </Button>
                    )}
                    {step === 3 && (
                        <Button variant="outlined" onClick={() => setOfferModalOpen(false)}>
                            Close
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </>
    );
};

export default EnterpriseAppBanner;
