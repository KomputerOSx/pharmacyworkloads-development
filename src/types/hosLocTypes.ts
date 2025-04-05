import { Timestamp } from "firebase/firestore";

//Locations can be: wards, clinics, carehomes, bed base rehabs, monufacturing, dispensary's, etc
export type HospLoc = {
    id: string;
    name: string;
    type: string;
    hospId: string;
    orgId: string;
    address: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    active: boolean;
    createdAt: Timestamp | string | null;
    updatedAt: Timestamp | string | null;
    createdById: string;
    updatedById: string;
};

export const getHospLocTypes = () => {
    return [
        { id: "ward", name: "Ward" },
        { id: "clinic", name: "Clinic" },
        { id: "pharmacy", name: "pharmacy" },
        { id: "supplies", name: "Supplies" },
        { id: "manufacturing", name: "Manufacturing" },
        { id: "other", name: "Other" },
    ];
};
