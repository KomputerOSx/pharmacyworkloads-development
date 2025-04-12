// src/types/userTypes.ts

import { Timestamp } from "firebase/firestore";

export type User = {
    id: string;
    authUid?: string | null;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    orgId: string;
    departmentId: string;
    role: string;
    jobTitle: string;
    specialty: string;
    active: boolean;
    lastLogin: Timestamp | null;
    createdAt: Timestamp | null;
    updatedAt: Timestamp | null;
    createdById: string;
    updatedById: string;
};

export type UserTeamAss = {
    id: string;
    userId: string;
    orgId: string;
    depId: string;
    teamId: string;
    startDate: Timestamp | null;
    endDate: Timestamp | null;
    createdAt: Timestamp | null;
    updatedAt: Timestamp | null;
    createdById: string;
    updatedById: string;
};

export function specialtyOptions() {
    return [
        { value: "General", label: "General" },
        { value: "Psychiatry", label: "Psychiatry" },
        { value: "Neurology", label: "Neurology" },
        { value: "Cardiology", label: "Cardiology" },
        { value: "Dermatology", label: "Dermatology" },
        { value: "Gastroenterology", label: "Gastroenterology" },
        { value: "Ophthalmology", label: "Ophthalmology" },
        { value: "Orthopedics", label: "Orthopedics" },
        { value: "Paediatrics", label: "Paediatrics" },
        { value: "Radiology", label: "Radiology" },
        { value: "Urology", label: "Urology" },
        { value: "Renal", label: "Renal" },
        { value: "Hematology", label: "Hematology" },
        { value: "Anesthesiology", label: "Anesthesiology" },
        { value: "Oncology", label: "Oncology" },
        { value: "Nephrology", label: "Nephrology" },
        { value: "Endocrinology", label: "Endocrinology" },
        { value: "Infectious Disease", label: "Infectious Disease" },
        { value: "Pulmonary", label: "Pulmonary" },
        {
            value: "Interventional Cardiology",
            label: "Interventional Cardiology",
        },
        { value: "Critical Care", label: "Critical Care" },
        { value: "Emergency Medicine", label: "Emergency Medicine" },
        {
            value: "Obstetrics and Gynecology",
            label: "Obstetrics and Gynecology",
        },
        { value: "Surgery", label: "Surgery" },
        { value: "Palliative Care", label: "Palliative Care" },
        { value: "Parkinson's Disease", label: "Parkinson's Disease" },
        { value: "Dementia and Delirium", label: "Dementia and Delirium" },
        { value: "Alzheimer's Disease", label: "Alzheimer's Disease" },
        { value: "Heart Failure", label: "Heart Failure" },
        { value: "COPD", label: "COPD" },
        { value: "Warfarin", label: "Warfarin" },
        { value: "Lipids", label: "Lipids" },
        { value: "Diabetes", label: "Diabetes" },
        { value: "Hypertension", label: "Hypertension" },
        { value: "Atrial Fibrillation", label: "Atrial Fibrillation" },
        { value: "Stroke", label: "Stroke" },
        { value: "Other", label: "Other" },
        { value: "Informatics", label: "Informatics" },
    ];
}
