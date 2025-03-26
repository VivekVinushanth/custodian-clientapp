import React from "react";
import { Tabs as MuiTabs, Tab as MuiTab } from "@mui/material";

export const Tabs = ({ value, onChange, children }) => {
    return (
        <MuiTabs value={value} onChange={onChange} variant="scrollable" scrollButtons="auto">
            {children}
        </MuiTabs>
    );
};

export const Tab = ({ label, onClick }) => {
    return <MuiTab label={label} onClick={onClick} />;
};