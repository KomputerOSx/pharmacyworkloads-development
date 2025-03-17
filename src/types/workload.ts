export type DirectorateType = "COTE" | "MEDS" | "SURG" | "EMRG";
export type ShiftType = "AM" | "PM";
export type DayOfWeek =
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";

export interface WorkloadEntry {
    id: number;
    directorate: DirectorateType;
    ward: string;
    pharmacist: string;
    shift: ShiftType;
    histories: number;
    reviews: number;
}

export interface WardWorkload {
    ward: string;
    amPharmacist: string;
    pmPharmacist: string;
    histories: number;
    reviews: number;
    amId?: number;
    pmId?: number;
}

export interface DirectorateSummary {
    directorate: DirectorateType;
    histories: number;
    reviews: number;
    total: number;
    wards: string[];
    pharmacists: string[];
}

export interface PharmacistSummary {
    pharmacist: string;
    directorates: DirectorateType[];
    wards: string[];
    shifts: ShiftType[];
    histories: number;
    reviews: number;
    total: number;
}

export interface WorkloadState {
    entries: WorkloadEntry[];
    addEntry: (entry: Omit<WorkloadEntry, "id">) => void;
    updateEntry: (id: number, entry: Partial<WorkloadEntry>) => void;
    deleteEntry: (id: number) => void;
    deleteWardEntries: (directorate: DirectorateType, ward: string) => void;
    getDirectorateSummary: (directorate: DirectorateType) => DirectorateSummary;
    getPharmacistSummary: (pharmacist: string) => PharmacistSummary;
    getWardSummary: (
        directorate: DirectorateType,
        ward: string,
    ) => WardWorkload | null;
    getAllEntries: () => WorkloadEntry[];
    getFilteredEntries: (
        directorate?: DirectorateType,
        search?: string,
    ) => WorkloadEntry[];
}
