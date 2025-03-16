// src/components/common/AlertMessage.tsx
import React from "react";

interface AlertMessageProps {
    type: "success" | "info" | "warning" | "danger";
    message: string;
    onClose?: () => void;
}

const AlertMessage: React.FC<AlertMessageProps> = ({
    type,
    message,
    onClose,
}) => {
    return (
        <div className={`notification is-${type} mb-4`}>
            {onClose && <button className="delete" onClick={onClose}></button>}
            <p>{message}</p>
        </div>
    );
};

export default AlertMessage;
