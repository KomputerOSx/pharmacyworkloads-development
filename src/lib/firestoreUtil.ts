import { doc, DocumentData, getDoc, Timestamp } from "firebase/firestore"; // Make sure Timestamp is imported
import { db } from "@/config/firebase";
import { Org } from "@/types/orgTypes";
import { Hosp } from "@/types/hospTypes";
import { Department, DepHospLocAss, DepTeamHospLocAss } from "@/types/depTypes";
import { User, UserTeamAss } from "@/types/userTypes";
import { DepTeam, HospLoc } from "@/types/subDepTypes";
import { StoredAssignment, WeekStatus } from "@/types/rotaTypes";
import { DepModuleAssignment, Module } from "@/types/moduleTypes"; // Adjust path if needed

export const formatFirestoreTimestamp = (
    timestamp: Timestamp | null | undefined,
): string => {
    if (!timestamp) {
        return "";
    }

    try {
        if (typeof timestamp.toDate === "function") {
            const date = timestamp.toDate();

            if (isNaN(date.getTime())) {
                console.warn(
                    "formatFirestoreTimestamp: Timestamp.toDate() resulted in invalid Date:",
                    timestamp,
                );
                return "";
            }

            // 4. Format to YYYY-MM-DD
            // Using Intl.DateTimeFormat is often more reliable and flexible than toISOString().split()
            const options: Intl.DateTimeFormatOptions = {
                year: "numeric",
                month: "2-digit", // Use '2-digit' for MM
                day: "2-digit", // Use '2-digit' for DD
                hour: "2-digit", // Use '2-digit' for HH
                minute: "2-digit", // Use '2-digit' for MM
                second: "2-digit", // Use '2-digit' for SS
                hour12: false,
                timeZoneName: "short",
            };
            return date.toLocaleDateString("sv-SE", options);
        } else {
            console.warn(
                "formatFirestoreTimestamp: Input was not a valid Firestore Timestamp:",
                timestamp,
            );
            return "";
        }
    } catch (error) {
        console.error(
            "formatFirestoreTimestamp: Error formatting timestamp:",
            error,
            "Input:",
            timestamp,
        );
        return "";
    }
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
        isDeleted: (data.isDeleted as boolean) ?? false,
        createdById: (data.createdById as string) ?? "system",
        updatedById: (data.updatedById as string) ?? "system",

        createdAt: (data.createdAt as Timestamp) ?? null,
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

export const mapFirestoreDocToDepTeam = (
    id: string,
    data: DocumentData | undefined,
): DepTeam | null => {
    if (!data) {
        console.warn(
            `gP5rT9wE - mapFirestoreDocToDepTeam: Received undefined data for ID ${id}.`,
        );
        return null;
    }

    const team: DepTeam = {
        id: id,
        name: (data.name as string) ?? "",
        depId: (data.depId as string) ?? "",
        orgId: (data.orgId as string) ?? "",
        description: (data.description as string) ?? null,
        active: (data.active as boolean) ?? false,
        createdById: (data.createdById as string) ?? "system",
        updatedById: (data.updatedById as string) ?? "system",
        createdAt: (data.createdAt as Timestamp) ?? null,
        updatedAt: (data.createdAt as Timestamp) ?? null,
    };

    if (!team.name || !team.id || !team.depId || !team.orgId) {
        console.error(
            `qL2mS8dN - mapFirestoreDocToDepTeam: Incomplete team data mapped for ID: ${id}. Missing name, depId, or orgId. Data received:`,
            data,
        );
        return null;
    }

    return team;
};

export const mapFirestoreDocToDepTeamHospLocAss = (
    id: string,
    data: DocumentData | undefined,
): DepTeamHospLocAss | null => {
    if (!data) {
        console.warn(
            `kL9pW2sC - mapFirestoreDocToDepTeamHospLocAss: Received undefined data for ID ${id}.`,
        );
        return null;
    }

    const assignment: DepTeamHospLocAss = {
        id: id,
        teamId: (data.teamId as string) ?? "",
        locationId: (data.locationId as string) ?? "",
        orgId: (data.orgId as string) ?? "",
        depId: (data.depId as string) ?? "", // Denormalized department ID
        createdById: (data.createdById as string) ?? "system",
        updatedById: (data.updatedById as string) ?? "system",
        createdAt: (data.createdAt as Timestamp) ?? null,
        updatedAt: (data.createdAt as Timestamp) ?? null,
    };

    if (
        !assignment.teamId ||
        !assignment.locationId ||
        !assignment.orgId ||
        !assignment.depId
    ) {
        console.error(
            `fD7zV1xR - mapFirestoreDocToDepTeamHospLocAss: Incomplete assignment data mapped for ID: ${id}. Missing teamId, locationId, orgId, or depId. Data:`,
            data,
        );
        return null;
    }

    return assignment;
};

export const mapFirestoreDocToUserTeamAss = (
    id: string,
    data: DocumentData | undefined,
): UserTeamAss | null => {
    if (!data) {
        console.warn(
            `bH7wE2sR - mapFirestoreDocToUserTeamAss: Received undefined data for ID ${id}.`,
        );
        return null;
    }

    const assignment: UserTeamAss = {
        id: id,
        userId: (data.userId as string) ?? "",
        orgId: (data.orgId as string) ?? "",
        depId: (data.depId as string) ?? "",
        teamId: (data.teamId as string) ?? "",
        startDate: (data.startDate as Timestamp) ?? null,
        endDate: (data.endDate as Timestamp) ?? null,
        createdById: (data.createdById as string) ?? "system",
        updatedById: (data.updatedById as string) ?? "system",
        createdAt: (data.createdAt as Timestamp) ?? null,
        updatedAt: (data.createdAt as Timestamp) ?? null,
    };

    // Validate essential foreign keys
    if (
        !assignment.userId ||
        !assignment.orgId ||
        !assignment.depId ||
        !assignment.teamId
    ) {
        console.error(
            `nC1xT8dR - mapFirestoreDocToUserTeamAss: Incomplete assignment data mapped for ID: ${id}. Missing required fields. Data:`,
            data,
        );
        return null;
    }

    return assignment;
};

export const mapFirestoreDocToStoredAssignment = (
    id: string,
    data: DocumentData | undefined,
): StoredAssignment | null => {
    // Ensure data exists
    if (!data) {
        console.warn(
            `vmLuFT3a - mapFirestoreDocToStoredAssignment: Received undefined data for ID ${id}.`,
        );
        return null;
    }

    // Construct the StoredAssignment object
    const assignment: StoredAssignment = {
        // Essential Fields from StoredAssignment
        id: id,
        userId: (data.userId as string) ?? "", // Use a sensible default or throw if required
        weekId: (data.weekId as string) ?? "",
        teamId: (data.teamId as string) ?? "",
        dayIndex: (data.dayIndex as number) ?? -1, // Use a sensible default or throw if required

        // Fields from base Assignment type
        locationId: (data.locationId as string) ?? null,
        customLocation: (data.customLocation as string) ?? undefined,
        shiftType: (data.shiftType as string) ?? null,
        customStartTime: (data.customStartTime as string) ?? undefined,
        customEndTime: (data.customEndTime as string) ?? undefined,
        notes: (data.notes as string) ?? undefined,
    };

    // Basic validation - ensure critical linking fields are present
    if (
        !assignment.id || // ID should exist
        !assignment.userId || // Check if userId is FALSY (empty string)
        !assignment.weekId || // Check if weekId is FALSY (empty string)
        assignment.dayIndex === -1 // Check if dayIndex defaulted to -1 (meaning it was missing or not a number)
        // NOTE: If dayIndex 0 is valid, this check is correct.
    ) {
        console.error(
            `9vuKQPPp - mapFirestoreDocToStoredAssignment: Incomplete assignment data mapped for ID: ${id}. Missing/invalid critical fields. Mapped Object:`,
            assignment, // Log the object *after* mapping attempt
            "Original Firestore Data:",
            data, // Log the original data
        );
        return null;
    }

    return assignment;
};

export const mapFirestoreDocToWeekStatus = (
    data: DocumentData | undefined,
    // id?: string // Optional: include ID if needed and not derived from weekId/teamId
): WeekStatus | null => {
    if (!data) {
        console.warn(
            `sK3jP9zV - mapFirestoreDocToWeekStatus: Received undefined data.`,
        );
        return null;
    }

    // Validate the status field specifically
    const status = data.status as string;
    if (status !== "draft" && status !== "published") {
        console.warn(
            `bH7wE2sR - mapFirestoreDocToWeekStatus: Invalid status value received:`,
            status,
        );
        // Return null or default to 'draft'? Returning null is safer.
        return null;
    }

    const weekStatus: WeekStatus = {
        // id: id ?? "", // If using ID
        weekId: (data.weekId as string) ?? "",
        teamId: (data.teamId as string) ?? "",
        orgId: (data.orgId as string) ?? "",
        status: status, // Use the validated status
        lastModified:
            data.lastModified instanceof Timestamp ? data.lastModified : null,
        lastModifiedById: (data.lastModifiedById as string) ?? null,
    };

    // Validate essential fields
    if (!weekStatus.weekId || !weekStatus.teamId || !weekStatus.orgId) {
        console.error(
            `nC1xT8dR - mapFirestoreDocToWeekStatus: Incomplete WeekStatus data mapped. Missing weekId, teamId, or orgId. Data:`,
            data,
        );
        return null;
    }

    return weekStatus;
};

export function mapFirestoreDocToModule(
    id: string,
    data: DocumentData | undefined,
): Module | null {
    if (!data) return null;
    try {
        return {
            id: id,
            name: data.name ?? "",
            description: data.description ?? null,
            active: data.active ?? false,
            createdAt: (data.createdAt as Timestamp) ?? null,
            updatedAt: (data.updatedAt as Timestamp) ?? null,
            createdBy: data.createdBy ?? "",
            updatedBy: data.updatedBy ?? "",
        };
    } catch (error) {
        console.error(
            `8PXUqbr2 - Error mapping Firestore doc to Module (ID: ${id}):`,
            error,
        );
        return null;
    }
}

export function mapFirestoreDocToDepModuleAssignment(
    id: string,
    data: DocumentData | undefined,
): DepModuleAssignment | null {
    if (!data) return null;
    try {
        return {
            id: id,
            depId: data.depId ?? "",
            moduleId: data.moduleId ?? "",
            orgId: data.orgId ?? "",
            createdAt: (data.createdAt as Timestamp) ?? null,
            createdBy: data.createdBy ?? "",
        };
    } catch (error) {
        console.error(
            `1weyX5CH - Error mapping Firestore doc to DepModuleAssignment (ID: ${id}):`,
            error,
        );
        return null;
    }
}
