import { Timestamp } from "firebase/firestore";
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const formatDate = (
    dateInput: Timestamp | string | Date | null | undefined,
): string => {
    // 1. Handle null or undefined input
    if (dateInput === null || typeof dateInput === "undefined") {
        return ""; // Return empty string for no input
    }

    try {
        let date: Date;

        // 2. Convert input to a standard JavaScript Date object
        if (dateInput instanceof Timestamp) {
            // Convert Firestore Timestamp to Date
            date = dateInput.toDate();
        } else if (typeof dateInput === "string") {
            // Attempt to parse the string into a Date
            date = new Date(dateInput);
        } else {
            {
                // Input is already a Date object
                date = dateInput;
            }
        }

        // 3. Check if the resulting Date object is valid
        // `isNaN` on a Date's time value is the standard way to check validity
        if (isNaN(date.getTime())) {
            console.warn(
                "formatDate - Could not parse input into a valid Date:",
                dateInput,
            );
            return "Invalid Date"; // Indicate that the input was not a parseable date
        }

        // 4. Format the valid Date object using Intl.DateTimeFormat options
        // This provides good localization and formatting control.
        const options: Intl.DateTimeFormatOptions = {
            year: "numeric", // e.g., 2023
            month: "short", // e.g., Jan, Feb
            day: "numeric", // e.g., 1, 15
            hour: "2-digit", // e.g., 09, 11
            minute: "2-digit", // e.g., 05, 30
            hour12: true, // Use AM/PM
        };

        // `toLocaleDateString` can handle both date and time parts with options.
        // Passing `undefined` for the locale uses the user's default locale.
        return date.toLocaleDateString(undefined, options);
    } catch (error) {
        // 5. Catch any unexpected errors during conversion or formatting
        console.error(
            "Error occurred during date formatting:",
            error,
            "Input:",
            dateInput,
        );
        return "Error"; // Generic error message for unexpected issues
    }
};

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
