import React from "react";

export const Card = ({ children, className }) => {
    return (
        <div className={`border rounded-lg shadow-md p-4 ${className}`}>
            {children}
        </div>
    );
};

export const CardContent = ({ children }) => {
    return <div>{children}</div>;
};
