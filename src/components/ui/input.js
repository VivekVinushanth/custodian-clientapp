import React from "react";

export const Input = ({ value, onChange, placeholder, className = "" }) => {
    return (
        <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`border px-3 py-2 rounded w-full ${className}`}
        />
    );
};
