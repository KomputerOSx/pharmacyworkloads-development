import { Timestamp } from "firebase/firestore";

export type Hosp = {
    id: string;
    name: string;
    orgId: string;
    address: string;
    city: string;
    postCode: string;
    contactEmail: string;
    contactPhone: string;
    active: boolean;
    createdAt: Timestamp | Date | null;
    updatedAt: Timestamp | Date | null;
    createdById: string;
    updatedById: string;
};

// export type HospOrgAss = {
//     id: string;
//     hospital: DocumentReference;
//     organisation: DocumentReference;
//     createdAt: Timestamp | string | null;
//     updatedAt: Timestamp | string | null;
//     createdById: string;
//     updatedById: string;
// };
