"use client";

import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useState,
} from "react";

// Define the context type
interface EditModeContextType {
    // Track edit mode per directorate
    directorateEditMode: Record<string, boolean>;
    // Check if any directorate is in edit mode
    isAnyDirectorateInEditMode: () => boolean;
    // Update edit mode status for a specific directorate
    setDirectorateEditMode: (directorate: string, inEditMode: boolean) => void;
}

// Create the context
const EditModeContext = createContext<EditModeContextType | undefined>(
    undefined,
);

// Provider component props
interface EditModeProviderProps {
    children: ReactNode;
}

// Provider component
export function EditModeProvider({ children }: EditModeProviderProps) {
    // Track edit mode per directorate
    const [directorateEditMode, setDirectorateEditModeState] = useState<
        Record<string, boolean>
    >({
        COTE: false,
        MEDS: false,
        SURG: false,
        EMRG: false,
    });

    // Check if any directorate is in edit mode
    const isAnyDirectorateInEditMode = useCallback(() => {
        return Object.values(directorateEditMode).some((mode) => mode);
    }, [directorateEditMode]);

    // Update edit mode status for a specific directorate
    // Using useCallback to ensure reference stability and prevent unnecessary rerenders
    const setDirectorateEditMode = useCallback(
        (directorate: string, inEditMode: boolean) => {
            setDirectorateEditModeState((prev) => {
                // Only update if the value is actually changing
                if (prev[directorate] === inEditMode) {
                    return prev;
                }
                return {
                    ...prev,
                    [directorate]: inEditMode,
                };
            });
        },
        [],
    );

    // Provide the context value
    const contextValue: EditModeContextType = {
        directorateEditMode,
        isAnyDirectorateInEditMode,
        setDirectorateEditMode,
    };

    return (
        <EditModeContext.Provider value={contextValue}>
            {children}
        </EditModeContext.Provider>
    );
}

// Custom hook to use the edit mode context
export function useEditMode() {
    const context = useContext(EditModeContext);

    if (context === undefined) {
        throw new Error("useEditMode must be used within an EditModeProvider");
    }

    return context;
}
