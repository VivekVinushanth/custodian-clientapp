import React from "react";
import EnterpriseApp from "./pages/EnterpriseApp";
import {BrowserRouter, Route, Routes} from "react-router-dom";

const App = () => {
    return (
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<EnterpriseApp />} />
                    </Routes>
                </BrowserRouter>

    );
};

export default App;
