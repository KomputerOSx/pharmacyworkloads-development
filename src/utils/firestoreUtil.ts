import { doc, DocumentData, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/config/firebase";
import { Org } from "@/types/orgTypes";

export const formatFirestoreTimestamp = (timestamp: Timestamp) => {
    if (timestamp && typeof timestamp.toDate === "function") {
        return timestamp.toDate().toISOString().split("T")[0];
    }
    // If it's already a string date or null/undefined, just return it
    return timestamp || null;
};

export const formatReferenceField = async (reference: string) => {
    if (!reference) return null;

    try {
        const docRef = doc(db, reference); // Create a DocumentReference object
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data(),
            };
        }
        return null;
    } catch (error) {
        console.error("nqUJ6hMZ - Error getting reference document:", error);
        return null;
    }
};

export const mapFirestoreDocToOrg = (
    id: string,
    data: DocumentData | undefined,
): Org | null => {
    // Ensure data exists
    if (!data) {
        console.warn(
            `mapFirestoreDocToOrg: Received undefined data for ID ${id}.`,
        );
        return null;
    }

    // Construct the Org object using the shared mapping logic
    const organisation: Org = {
        id: id,
        name: (data.name as string) ?? "",
        type: (data.type as string) ?? "",
        active: (data.active as boolean) ?? false,
        contactEmail: (data.contactEmail as string) ?? "",
        contactPhone: (data.contactPhone as string) ?? "",
        address: (data.address as string) ?? "",
        createdById: (data.createdById as string) ?? "system",
        updatedById: (data.updatedById as string) ?? "system",

        // Format timestamps safely
        createdAt: data.createdAt
            ? formatFirestoreTimestamp(data.createdAt as Timestamp)
            : null,
        updatedAt: data.updatedAt
            ? formatFirestoreTimestamp(data.updatedAt as Timestamp)
            : null,

        // Add any other fields required by the Org type here
    };

    // Optional: Centralized validation for essential fields
    if (!organisation.name || !organisation.type) {
        console.error(
            `mapFirestoreDocToOrg: Incomplete organisation data mapped for ID: ${id}. Missing name or type.`,
        );
        // Decide whether to return null or the incomplete object based on your needs
        return null;
    }

    return organisation;
};
