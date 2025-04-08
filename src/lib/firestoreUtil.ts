import { doc, DocumentData, getDoc, Timestamp } from "firebase/firestore"; // Make sure Timestamp is imported
import { db } from "@/config/firebase";
import { Org } from "@/types/orgTypes";
import { Hosp } from "@/types/hospTypes";
import { HospLoc } from "@/types/hosLocTypes";
import { Department, DepHospLocAss } from "@/types/depTypes";
import { User } from "@/types/userTypes"; // Adjust path if needed

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
            `jGfLm45C - mapFirestoreDocToOrg: Received undefined data for ID ${id}.`,
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

        createdAt: (data.createdAt as Timestamp) ?? null,

        updatedAt: (data.updatedAt as Timestamp) ?? null,
    };

    if (!organisation.name || !organisation.type) {
        console.error(
            `hmDLEyN5 - mapFirestoreDocToOrg: Incomplete organisation data mapped for ID: ${id}. Missing name or type.`,
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
            `dXT5qmpR - mapFirestoreDocToHosp: Received undefined data for ID ${id}.`,
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

        createdAt: (data.createdAt as Timestamp) ?? null,

        updatedAt: (data.updatedAt as Timestamp) ?? null,
    };

    if (!hospital.name || !hospital.id) {
        console.error(
            `rgegfqM2 - mapFirestoreDocToOrg: Incomplete organisation data mapped for ID: ${id}. Missing name or type.`,
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
            `rA6qdDsF - mapFirestoreDocToHospLoc: Received undefined data for ID ${id}.`,
        );
        return null;
    }

    // Construct the Org object using the shared mapping logic
    const hospLoc: HospLoc = {
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

        createdAt: (data.createdAt as Timestamp) ?? null,
        // OR if you prefer JS Date:
        // createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : null,

        updatedAt: (data.updatedAt as Timestamp) ?? null,
    };

    if (!hospLoc.name || !hospLoc.id) {
        console.error(
            `XJYM3rzB - mapFirestoreDocToHospLoc: Incomplete organisation data mapped for ID: ${id}. Missing name or type.`,
        );
        // Decide whether to return null or the incomplete object based on your needs
        return null;
    }

    return hospLoc;
};

export const mapFirestoreDocToDep = (
    id: string,
    data: DocumentData | undefined,
): Department | null => {
    // Ensure data exists
    if (!data) {
        console.warn(
            `V4hMDzH6 - mapFirestoreDocToDep: Received undefined data for ID ${id}.`,
        );
        return null;
    }

    // Construct the Org object using the shared mapping logic
    const department: Department = {
        id: id,
        name: (data.name as string) ?? "",
        orgId: (data.orgId as string) ?? "",
        active: (data.active as boolean) ?? false,
        createdById: (data.createdById as string) ?? "system",
        updatedById: (data.updatedById as string) ?? "system",

        createdAt: (data.createdAt as Timestamp) ?? null,

        updatedAt: (data.updatedAt as Timestamp) ?? null,
    };

    if (!department.name || !department.id) {
        console.error(
            `nMshR884 - mapFirestoreDocToDep: Incomplete organisation data mapped for ID: ${id}. Missing name or id.`,
        );
        return null;
    }

    return department;
};

export const mapFirestoreDocToDepHospLocAss = (
    id: string,
    data: DocumentData | undefined,
): DepHospLocAss | null => {
    // Ensure data exists
    if (!data) {
        console.warn(
            `8PRQJd2k - mapFirestoreDocToDepHospLocAss: Received undefined data for ID ${id}.`,
        );
        return null;
    }

    if (!data.departmentId || !data.locationId) {
        console.error(
            `uDXu4caW - mapFirestoreDocToDepHospLocAss: Firestore data for assignment ID ${id} is missing required 'departmentId' or 'locationId' field.`,
            data,
        );
        return null;
    }
    return {
        id: id,
        departmentId: data.departmentId as string,
        locationId: data.locationId as string,
        createdById: (data.createdById as string) ?? "system",
        updatedById: (data.updatedById as string) ?? "system",
        createdAt: (data.createdAt as Timestamp) ?? null,
        updatedAt: (data.createdAt as Timestamp) ?? null,
    };
};

export const mapFirestoreDocToUser = (
    id: string,
    data: DocumentData | undefined,
): User | null => {
    // Ensure data exists
    if (!data) {
        console.warn(
            `EtMJRg2a - mapFirestoreDocToDep: Received undefined data for ID ${id}.`,
        );
        return null;
    }

    return {
        id: id,
        authUid: (data.authUid as string) ?? "",
        firstName: (data.firstName as string) ?? "",
        lastName: (data.lastName as string) ?? "",
        email: (data.email as string) ?? "",
        phoneNumber: (data.phoneNumber as string) ?? "",
        orgId: (data.orgId as string) ?? "",
        departmentId: (data.departmentId as string) ?? "",
        role: (data.role as string) ?? "",
        jobTitle: (data.jobTitle as string) ?? "",
        specialty: (data.specialty as string) ?? "",
        active: (data.active as boolean) ?? false,
        lastLogin: (data.createdAt as Timestamp) ?? null,
        createdAt: (data.createdAt as Timestamp) ?? null,
        updatedAt: (data.createdAt as Timestamp) ?? null,
        createdById: (data.createdById as string) ?? "system",
        updatedById: (data.updatedById as string) ?? "system",
    };
};
