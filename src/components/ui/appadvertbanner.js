import { useState, useEffect } from "react";
import { Paper, Typography, IconButton, Fade } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const EnterpriseAppBanner = ({ preferences }) => {
    const [currentBanner, setCurrentBanner] = useState(0);
    const [banners, setBanners] = useState([]);
    const [hovered, setHovered] = useState(false);
    const [fadeIn, setFadeIn] = useState(true);

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
                description: "Buy 2 Plush Toys, Get 1 Free! Softness overload—perfect friends for every bedtime story!",
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
                description: "Flat 20% OFF on all Educational Toys. Empower your child’s creativity and critical thinking!",
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
                description: "Buy one Puzzle or Game and get the second at 50% off! Perfect for family game nights.",
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
                description: "Enjoy up to 25% off across our entire toy collection. Limited-time offer!",
                category: "All"
            }
        ]
    };

    useEffect(() => {
        if (!preferences?.length) {
            setBanners([]);
            return;
        }

        let collected = [];
        preferences.forEach(pref => {
            if (offerBanners[pref]) {
                collected = [...collected, ...offerBanners[pref]];
            }
        });

        if (collected.length === 0) collected = offerBanners["All"];
        setBanners(collected);
        setCurrentBanner(0);
    }, [preferences]);

    useEffect(() => {
        if (!banners.length) return;

        const interval = setInterval(() => {
            setFadeIn(false);
            setTimeout(() => {
                setCurrentBanner(prev => (prev + 1) % banners.length);
                setFadeIn(true);
            }, 200); // match the fade-out duration
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

    return (
        <Paper
            elevation={4}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            sx={{
                p: 2,
                mb: 2,
                textAlign: "center",
                position: "relative",
                backgroundColor: bgColor,
                transition: "background-color 0.3s ease"
            }}
        >
            <Fade in={fadeIn} timeout={400}>
                <div>
                    <Typography variant="h6">{current.title}</Typography>
                    <Typography variant="body1">{current.description}</Typography>
                </div>
            </Fade>

            {hovered && (
                <>
                    <IconButton
                        sx={{ position: "absolute", top: "50%", left: 8, transform: "translateY(-50%)" }}
                        onClick={() => handleManualChange("prev")}
                    >
                        <ArrowBackIosNewIcon />
                    </IconButton>

                    <IconButton
                        sx={{ position: "absolute", top: "50%", right: 8, transform: "translateY(-50%)" }}
                        onClick={() => handleManualChange("next")}
                    >
                        <ArrowForwardIosIcon />
                    </IconButton>
                </>
            )}
        </Paper>
    );
};

export default EnterpriseAppBanner;
