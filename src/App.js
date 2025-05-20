import React from "react";
import EnterpriseApp from "./pages/EnterpriseApp";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import DashboardLayoutBasic from "./components/ui/dashboardlayout";

const App = () => {
    return (
        <BrowserRouter>
            <DashboardLayoutBasic>
                <Routes>
                    <Route path="/" element={<EnterpriseApp />} />
                </Routes>
            </DashboardLayoutBasic>
        </BrowserRouter>
    );
};

export default App;
