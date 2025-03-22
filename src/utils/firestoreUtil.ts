export const formatFirestoreTimestamp = (timestamp) => {
    if (timestamp && typeof timestamp.toDate === "function") {
        return timestamp.toDate().toISOString().split("T")[0];
    }
    // If it's already a string date or null/undefined, just return it
    return timestamp || null;
};
