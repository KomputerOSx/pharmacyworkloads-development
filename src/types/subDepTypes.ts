//Locations can be: wards, clinics, carehomes, bed base rehabs, monufacturing, dispensary's, etc
import { Timestamp } from "firebase/firestore";

export type HospLoc = {
    id: string;
    name: string;
    type: string;
    hospId: string;
    orgId: string;
    description: string | null;
    address: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    active: boolean;
    createdAt: Timestamp | null;
    updatedAt: Timestamp | null;
    createdById: string;
    updatedById: string;
};
export const getHospLocTypes = () => {
    return [
        { id: "ward", name: "Ward" },
        { id: "clinic", name: "Clinic" },
        { id: "pharmacy", name: "Pharmacy" },
        { id: "supplies", name: "Supplies" },
        { id: "manufacturing", name: "Manufacturing" },
        { id: "other", name: "Other" },
    ];
};

export type DepTeam = {
    id: string;
    name: string;
    depId: string;
    orgId: string;
    description: string | null;
    active: boolean;
    createdAt: Timestamp | null;
    updatedAt: Timestamp | null;
    createdById: string;
    updatedById: string;
};
