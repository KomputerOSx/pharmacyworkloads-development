import { doc, DocumentData, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/config/firebase";
import { Org } from "@/types/orgTypes";
import { Hosp } from "@/types/hospTypes";
import { HospLoc } from "@/types/hosLocTypes";

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

    if (!organisation.name || !organisation.type) {
        console.error(
            `mapFirestoreDocToOrg: Incomplete organisation data mapped for ID: ${id}. Missing name or type.`,
        );
        // Decide whether to return null or the incomplete object based on your needs
        return null;
    }

    return organisation;
};

export const mapFirestoreDocToHosp = (
    id: string,
    data: DocumentData | undefined,
): Hosp | null => {
    // Ensure data exists
    if (!data) {
        console.warn(
            `mapFirestoreDocToHosp: Received undefined data for ID ${id}.`,
        );
        return null;
    }

    // Construct the Org object using the shared mapping logic
    const hospital: Hosp = {
        id: id,
        name: (data.name as string) ?? "",
        orgId: (data.orgId as string) ?? "",
        address: (data.address as string) ?? "",
        city: (data.city as string) ?? "",
        postCode: (data.postCode as string) ?? "",
        contactEmail: (data.contactEmail as string) ?? "",
        contactPhone: (data.contactPhone as string) ?? "",
        active: (data.active as boolean) ?? false,
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

    if (!hospital.name || !hospital.id) {
        console.error(
            `mapFirestoreDocToOrg: Incomplete organisation data mapped for ID: ${id}. Missing name or type.`,
        );
        // Decide whether to return null or the incomplete object based on your needs
        return null;
    }

    return hospital;
};

export const mapFirestoreDocToHospLoc = (
    id: string,
    data: DocumentData | undefined,
): HospLoc | null => {
    // Ensure data exists
    if (!data) {
        console.warn(
            `mapFirestoreDocToHospLoc: Received undefined data for ID ${id}.`,
        );
        return null;
    }

    // Construct the Org object using the shared mapping logic
    const hospital: HospLoc = {
        id: id,
        name: (data.name as string) ?? "",
        type: (data.type as string) ?? "",
        hospId: (data.hospId as string) ?? "",
        orgId: (data.orgId as string) ?? "",
        description: (data.description as string) ?? "",
        address: (data.address as string) ?? "",
        contactEmail: (data.contactEmail as string) ?? "",
        contactPhone: (data.contactPhone as string) ?? "",
        active: (data.active as boolean) ?? false,
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

    if (!hospital.name || !hospital.id) {
        console.error(
            `mapFirestoreDocToHospLoc: Incomplete organisation data mapped for ID: ${id}. Missing name or type.`,
        );
        // Decide whether to return null or the incomplete object based on your needs
        return null;
    }

    return hospital;
};
