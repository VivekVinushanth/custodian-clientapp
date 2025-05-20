import React from "react";
import { Tabs as MuiTabs, Tab as MuiTab } from "@mui/material";

export const Tabs = ({ value, onChange, children }) => {
    return (
        <MuiTabs
            value={value}
            onChange={onChange}
            variant="scrollable"
            scrollButtons="auto"
            textColor="inherit"
            TabIndicatorProps={{ style: { backgroundColor: 'var(--mui-palette-primary-main, #1976d2)' } }}
        >
            {children}
        </MuiTabs>
    );
};

export const Tab = ({ label, onClick }) => {
    return <MuiTab label={label} onClick={onClick} sx={{ color: 'text.primary' }} />;
};