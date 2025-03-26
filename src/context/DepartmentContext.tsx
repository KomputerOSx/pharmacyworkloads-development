// src/context/DepartmentContext.js
import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react";
import {
    getAllDepartmentsWithHospitals,
    addDepartmentWithHospital,
    updateDepartmentWithHospital,
    deleteDepartment as deleteFirestoreDepartment,
    getAvailableHospitals,
} from "../services/departmentService";
import { Hospital } from "@/context/HospitalContext";

export type Department = {
    active: boolean;
    code: string;
    description: string;
    hospital: Hospital;
    id: string;
    name: string;
    parent: boolean;
    type: string;
    createdAt?: string;

    updatedAt?: string;
};

export type Filter = {
    search: string;
    hospital: string;
    type: string;
    active: boolean;
};

export type DepartmentContextType = {
    departments: Department[];
    hospitals: Hospital[];
    loading: boolean;
    error: string | null;
    filter: Filter;
    setFilter: React.Dispatch<React.SetStateAction<Filter>>;
    refreshDepartments: () => Promise<void>;
    refreshHospitals: () => Promise<void>;
    addNewDepartment: (
        department: Omit<Department, "id" | "createdAt" | "updatedAt">,
        hospitalId: string,
    ) => Promise<Department>;
    updateExistingDepartment: (
        id: string,
        department: Partial<Department>,
        hospitalId: string,
    ) => Promise<Department>;
    removeDepartment: (id: string) => Promise<void>;
};

// Create the context
const DepartmentContext = createContext<DepartmentContextType | null>(null);

// Custom hook to use the department context
export const useDepartments = () => {
    const context = useContext(DepartmentContext);
    if (!context) {
        throw new Error(
            "useDepartments must be used within a DepartmentProvider",
        );
    }
    return context;
};

// Department context provider component
export const DepartmentProvider: React.FC<{
    children: React.ReactNode;
}> = ({ children }) => {
    // State variables
    const [departments, setDepartments] = useState<Department[]>([]);
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null); // Add this line
    // Filter state
    const [filter, setFilter] = useState({
        search: "",
        hospital: "all",
        type: "all",
        active: true,
    });

    // Department types for dropdown selections
    const departmentTypes = [
        { id: "pharmacy", name: "Pharmacy" },
        { id: "clinical", name: "Clinical" },
        { id: "outpatient", name: "Outpatient" },
        { id: "inpatient", name: "Inpatient" },
        { id: "medical", name: "Medical" },
        { id: "emergency", name: "Emergency" },
        { id: "admin", name: "Administration" },
        { id: "other", name: "Other" },
    ];

    // Load departments and hospitals
    const loadDepartments = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            // Fetch departments with their hospital information
            const departmentsData = await getAllDepartmentsWithHospitals();
            setDepartments(departmentsData);

            console.log("Departments loaded:", departmentsData);

            // Also load available hospitals for dropdowns
            const hospitalsData = await getAvailableHospitals();
            setHospitals(hospitalsData);

            setLoading(false);
        } catch (err) {
            console.error("Error loading departments:", err);
            setError("Failed to load departments");
            setLoading(false);
            throw err;
        }
    }, []);

    // Load departments on initial render
    useEffect(() => {
        loadDepartments();
    }, [loadDepartments]);

    // Add a new department
    const addNewDepartment = async (
        departmentData: Omit<Department, "id" | "createdAt" | "updatedAt">,
        hospitalId: string,
    ) => {
        try {
            setLoading(true);
            setError(null);
            // Add the department and get the result
            const newDepartment = await addDepartmentWithHospital(
                departmentData,
                hospitalId,
            );

            // Update the local state
            setDepartments((prevDepartments) => [
                ...prevDepartments,
                newDepartment as Department, // Cast newDepartment to Department
            ]);

            setLoading(false);

            return newDepartment as Department;
        } catch (err) {
            console.error("Error adding department:", err);
            setError("Failed to add department");
            setLoading(false);
            throw err;
        }
    };

    // Update an existing department
    // const updateExistingDepartment = async (
    //     departmentId: string,
    //     departmentData: Partial<Department>,
    // ) => {
    //     try {
    //         setLoading(true);
    //
    //         // Update the department and get the result
    //         const updatedDepartment = await updateDepartmentWithHospital(
    //             departmentId,
    //             departmentData,
    //         );
    //
    //         // Update the local state
    //         setDepartments(
    //             (prevDepartments) =>
    //                 prevDepartments.map((dept) =>
    //                     dept.id === departmentId ? updatedDepartment : dept,
    //                 ) as Department[],
    //         );
    //
    //         setLoading(false);
    //
    //         return updatedDepartment;
    //     } catch (err) {
    //         console.error("Error updating department:", err);
    //         setError("Failed to update department");
    //         setLoading(false);
    //         throw err;
    //     }
    // };

    const updateExistingDepartment = async (
        departmentId: string,
        departmentData: Partial<Department>,
        hospitalId: string,
    ) => {
        try {
            setLoading(true);
            setError(null);

            // Update the department and get the result
            const updatedDepartment = await updateDepartmentWithHospital(
                departmentId,
                departmentData,
                hospitalId,
            );

            // Update the local state
            setDepartments(
                (prevDepartments) =>
                    prevDepartments.map((dept) =>
                        dept.id === departmentId ? updatedDepartment : dept,
                    ) as Department[],
            );

            setLoading(false);

            return updatedDepartment as Department; // Add this type cast
        } catch (err) {
            console.error("Error updating department:", err);
            setError("Failed to update department");
            setLoading(false);
            throw err;
        }
    };

    // Delete a department
    const removeDepartment = async (departmentId: string) => {
        try {
            setLoading(true);

            // Delete the department
            await deleteFirestoreDepartment(departmentId);

            // Update the local state
            setDepartments((prevDepartments) =>
                prevDepartments.filter((dept) => dept.id !== departmentId),
            );

            setLoading(false);
        } catch (err) {
            console.error("Error deleting department:", err);
            setError("Failed to delete department");
            setLoading(false);
            throw err;
        }
    };

    // Get a department by ID
    const getDepartment = (departmentId: string) => {
        return departments.find((dept) => dept.id === departmentId) || null;
    };

    // Get department children (if your departments have a hierarchical structure)
    const getDepartmentChildren = async (departmentId: string) => {
        // In this simplified version, we'll just filter the departments by parent ID
        return departments.filter(
            (dept) => dept.parent && dept.id === departmentId,
        );
    };

    // Force refresh departments
    const refreshDepartments = async () => {
        return loadDepartments();
    };

    // Filter departments
    const getFilteredDepartments = () => {
        return departments.filter((dept) => {
            // Filter by search term
            const matchesSearch =
                !filter.search ||
                dept.name.toLowerCase().includes(filter.search.toLowerCase()) ||
                dept.code.toLowerCase().includes(filter.search.toLowerCase()) ||
                (dept.description &&
                    dept.description
                        .toLowerCase()
                        .includes(filter.search.toLowerCase()));

            // Filter by hospital
            const matchesHospital =
                filter.hospital === "all" ||
                (dept.hospital && dept.hospital.id === filter.hospital);

            // Filter by type
            const matchesType =
                filter.type === "all" || dept.type === filter.type;

            // Filter by active status
            const matchesActive =
                filter.active === undefined || dept.active === filter.active;

            return (
                matchesSearch && matchesHospital && matchesType && matchesActive
            );
        });
    };

    // Context value
    const value = {
        departments,
        hospitals,
        loading,
        filter,
        error,
        setFilter,
        departmentTypes,
        addNewDepartment,
        updateExistingDepartment,
        removeDepartment,
        getDepartment,
        getDepartmentChildren,
        refreshDepartments,
        refreshHospitals: () => Promise.resolve(),
        getFilteredDepartments,
    };

    return (
        <DepartmentContext.Provider value={value}>
            {children}
        </DepartmentContext.Provider>
    );
};

export default DepartmentContext;
