// src/components/common/LoadingSpinner.tsx
import React from "react";

const LoadingSpinner: React.FC = () => {
    return (
        <div className="has-text-centered p-6">
            <div
                className="loader is-loading"
                style={{ height: "80px", width: "80px", margin: "0 auto" }}
            ></div>
            <p className="mt-4">Loading...</p>
        </div>
    );
};

export default LoadingSpinner;
