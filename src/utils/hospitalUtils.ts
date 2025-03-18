// src/utils/hospitalUtils.ts
import {Hospital} from "@/context/HospitalContext";

/**
 * Ensures a hospital object conforms to the Hospital type
 * by providing default values for required fields if they're missing
 * @param hospital The hospital object to ensure is complete
 * @returns A hospital object that fully conforms to the Hospital type
 */
export const ensureCompleteHospital = (
    hospital: Partial<Hospital>,
): Hospital => {
    return {
        id: hospital.id || "",
        name:
            hospital.name || hospital.organization?.name || "Unknown Hospital",
        address: hospital.address || "",
        city: hospital.city || "",
        postcode: hospital.postcode || "",
        contactNumber: hospital.contactNumber || "",
        contactEmail: hospital.contactEmail || "",
        beds: hospital.beds || 0,
        active: hospital.active ?? true,
        // @ts-expect-error small hospital component for department creation
        organization: hospital.organization || { id: "", name: "" },
        departments: hospital.departments,
        wards: hospital.wards,
        staff: hospital.staff,
        createdAt: hospital.createdAt,
        updatedAt: hospital.updatedAt,
    };
};

/**
 * A type-safe wrapper for getHospitals that ensures returned data
 * conforms to the Hospital type
 * @param filter Filter criteria for hospitals
 * @returns Array of hospitals that conform to the Hospital type
 */

//@ts-expect-error no type for filter
export const getHospitalsSafe = async (filter): Promise<Hospital[]> => {
    const hospitals = await import("@/services/hospitalService").then(
        (module) => module.getHospitals(filter),
    );
    return hospitals.map((hospital) => ensureCompleteHospital(hospital));
};
