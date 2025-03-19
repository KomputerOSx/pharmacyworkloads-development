// In src/utils/wardUtils.ts
import {Ward} from "@/context/WardContext";

/**
 * Ensures a ward object conforms to the Ward type
 * by providing default values for required fields if they're missing
 */
export const ensureCompleteWard = (ward: Partial<Ward>): Ward => {
    return {
        id: ward.id || "",
        name: ward.name || "",
        code: ward.code || "",
        department: ward.department || { id: "", name: "" },
        // @ts-expect-error missing properties
        hospital: ward.hospital || { id: "", name: "" },
        bedCount: ward.bedCount || 0,
        active: ward.active ?? true,
        createdAt: ward.createdAt,
        updatedAt: ward.updatedAt,
        departments: ward.departments || [],
    };
};
