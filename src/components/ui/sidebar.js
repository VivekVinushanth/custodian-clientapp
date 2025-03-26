import React from "react";
import { Drawer, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { People, Settings, Event, Storage } from "@mui/icons-material";
import { Link } from "react-router-dom";

const Sidebar = () => {
    return (
        <Drawer
            variant="permanent"
            sx={{
                width: 240,
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                    width: 240,
                    boxSizing: "border-box",
                    backgroundColor: "#F4F4F4", // Light Grey / Off-White Sidebar
                    color: "black", // Black font color
                },
            }}
        >
            <List>
                <ListItem component={Link} to="/users" button>
                    <ListItemIcon><People sx={{ color: "#FF7300" }} /></ListItemIcon>
                    <ListItemText primary="User Data" sx={{ color: "black" }} />
                </ListItem>
                <ListItem component={Link} to="/unification-rules" button>
                    <ListItemIcon><Settings sx={{ color: "#FF7300" }} /></ListItemIcon>
                    <ListItemText primary="Unification Rules" sx={{ color: "black" }} />
                </ListItem>
                <ListItem component={Link} to="/events" button>
                    <ListItemIcon><Event sx={{ color: "#FF7300" }} /></ListItemIcon>
                    <ListItemText primary="Events" sx={{ color: "black" }} />
                </ListItem>
                <ListItem component={Link} to="/data-residency" button>
                    <ListItemIcon><Storage sx={{ color: "#FF7300" }} /></ListItemIcon>
                    <ListItemText primary="Data Residency" sx={{ color: "black" }} />
                </ListItem>
            </List>
        </Drawer>
    );
};

export default Sidebar;
