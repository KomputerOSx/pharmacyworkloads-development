//
// // src/app/admin/components/wards/WardModal.tsx
// import {useEffect, useState} from "react";
// import {useWards, Ward,} from "@/context/WardContext";
// import {getUnassignedDepartments} from "@/utils/wardDepartmentUtils";
//
// type WardModalProps = {
//     isOpen: boolean;
//     mode: "add" | "edit";
//     ward: Ward | null;
//     onClose: () => void;
//     onSave: (ward: Ward) => void;
//     departmentId?: string; // Optional pre-selected department
// };
//
// // Enhanced department type with hospital information
// type EnhancedDepartment = {
//     id: string;
//     name: string;
//     code?: string;
//     color?: string;
//     hospital: {
//         id: string;
//         name: string;
//         organisation?: {
//             id: string;
//             name: string;
//         };
//     };
// };
//
// export default function WardModal({
//     isOpen,
//     mode,
//     ward,
//     onClose,
//     onSave,
//     departmentId,
// }: WardModalProps) {
//     const { departments, hospitals, assignWardToDepartment } = useWards();
//
//     // Default empty ward
//     const emptyWard: Ward = {
//         id: "",
//         name: "",
//         code: "",
//         department: { id: "", name: "" },
//         hospital: { id: "", name: "" },
//         bedCount: 0,
//         active: true,
//     };
//
//     const [formData, setFormData] = useState<Ward>(emptyWard);
//     const [formError, setFormError] = useState("");
//     const [isSubmitting, setIsSubmitting] = useState(false);
//
//     // New state for selecting initial department
//     const [initialDepartmentId, setInitialDepartmentId] = useState<string>("");
//     const [makeInitialDepartmentPrimary, setMakeInitialDepartmentPrimary] =
//         useState<boolean>(true);
//
//     // Enhanced departments with hospital info for better selection
//     const [enhancedDepartments, setEnhancedDepartments] = useState<
//         EnhancedDepartment[]
//     >([]);
//
//     // Group departments by hospital for better organisation in dropdown
//     const [departmentsByHospital, setDepartmentsByHospital] = useState<{
//         [hospitalId: string]: EnhancedDepartment[];
//     }>({});
//
//     useEffect(() => {
//         // Create enhanced department objects with hospital info
//         const enhanced = departments.map((dept) => ({
//             ...dept,
//             hospital: dept.hospital || {
//                 id: "unknown",
//                 name: "Unknown Hospital",
//             },
//         })) as EnhancedDepartment[];
//
//         setEnhancedDepartments(enhanced);
//
//         // Group by hospital
//         const byHospital: { [hospitalId: string]: EnhancedDepartment[] } = {};
//         enhanced.forEach((dept) => {
//             const hospitalId = dept.hospital?.id || "unknown";
//             if (!byHospital[hospitalId]) {
//                 byHospital[hospitalId] = [];
//             }
//             byHospital[hospitalId].push(dept);
//         });
//
//         setDepartmentsByHospital(byHospital);
//     }, [departments]);
//
//     useEffect(() => {
//         if (mode === "edit" && ward) {
//             setFormData({
//                 ...ward,
//             });
//         } else {
//             // Reset form for add mode
//             const initialWard = {
//                 ...emptyWard,
//             };
//
//             // If departmentId is provided, pre-select that department
//             if (departmentId) {
//                 setInitialDepartmentId(departmentId);
//
//                 const selectedDept = departments.find(
//                     (d) => d.id === departmentId,
//                 );
//                 if (selectedDept) {
//                     // For backward compatibility, still set the department field
//                     initialWard.department = {
//                         id: selectedDept.id,
//                         name: selectedDept.name,
//                         color: selectedDept.color,
//                     };
//
//                     // If department has a hospital, also pre-select that
//                     if (selectedDept.hospital) {
//                         initialWard.hospital = selectedDept.hospital;
//                     }
//                 }
//             } else if (departments.length > 0) {
//                 // Otherwise, just select the first department
//                 setInitialDepartmentId("");
//             }
//
//             setFormData(initialWard);
//         }
//         setFormError("");
//         setIsSubmitting(false);
//     }, [mode, ward, departments, hospitals, isOpen, departmentId]);
//
//     const handleInputChange = (
//         e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
//     ) => {
//         const { name, value, type } = e.target;
//
//         if (name === "initialDepartmentId") {
//             setInitialDepartmentId(value);
//
//             if (value) {
//                 const selectedDept = departments.find((d) => d.id === value);
//                 if (selectedDept) {
//                     // Only update the department in add mode - in edit mode, departments are managed separately
//                     if (mode === "add") {
//                         setFormData({
//                             ...formData,
//                             department: {
//                                 id: selectedDept.id,
//                                 name: selectedDept.name,
//                                 color: selectedDept.color,
//                             },
//                         });
//
//                         // If department has a hospital, auto-select it
//                         if (selectedDept.hospital) {
//                             setFormData((prev) => ({
//                                 ...prev,
//                                 department: {
//                                     id: selectedDept.id,
//                                     name: selectedDept.name,
//                                     color: selectedDept.color,
//                                 },
//                                 hospital: selectedDept.hospital,
//                             }));
//                         }
//                     }
//                 }
//             }
//         } else if (name === "hospitalId") {
//             const selectedHospital = hospitals.find((h) => h.id === value);
//             if (selectedHospital) {
//                 // Update hospital and reset department if hospital changes
//                 if (formData.hospital?.id !== value) {
//                     setFormData({
//                         ...formData,
//                         hospital: {
//                             id: selectedHospital.id,
//                             name: selectedHospital.name,
//                         },
//                         department: { id: "", name: "" },
//                     });
//                     setInitialDepartmentId("");
//                 } else {
//                     setFormData({
//                         ...formData,
//                         hospital: {
//                             id: selectedHospital.id,
//                             name: selectedHospital.name,
//                         },
//                     });
//                 }
//             }
//         } else if (name === "makeInitialDepartmentPrimary") {
//             setMakeInitialDepartmentPrimary(
//                 (e.target as HTMLInputElement).checked,
//             );
//         } else {
//             setFormData({
//                 ...formData,
//                 [name]:
//                     type === "checkbox"
//                         ? (e.target as HTMLInputElement).checked
//                         : type === "number"
//                           ? parseInt(value)
//                           : value,
//             });
//         }
//     };
//
//     const validateForm = () => {
//         // Validate required fields
//         if (!formData.name.trim()) {
//             setFormError("Ward name is required");
//             return false;
//         }
//
//         if (!formData.code.trim()) {
//             setFormError("Ward code is required");
//             return false;
//         }
//
//         if (!formData.hospital?.id) {
//             setFormError("Hospital is required");
//             return false;
//         }
//
//         // In add mode, we require an initial department
//         if (mode === "add" && !initialDepartmentId) {
//             setFormError("Please select an initial department");
//             return false;
//         }
//
//         if (formData.bedCount < 0) {
//             setFormError("Bed count must be 0 or higher");
//             return false;
//         }
//
//         return true;
//     };
//
//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//
//         // Validate form
//         if (!validateForm()) {
//             return;
//         }
//
//         setIsSubmitting(true);
//
//         try {
//             if (mode === "add") {
//                 // Save the ward
//                 await onSave(formData);
//
//                 // If an initial department was selected, assign it after ward creation
//                 if (initialDepartmentId) {
//                     // The ward id will be set during saving, so we'll need to handle
//                     // the department assignment in the backend or after returning
//                 }
//             } else {
//                 // In edit mode, just save the ward
//                 onSave(formData);
//             }
//         } catch (error) {
//             console.error("Error saving ward:", error);
//             setFormError("An error occurred while saving. Please try again.");
//             setIsSubmitting(false);
//         }
//     };
//
//     // Filter departments based on selected hospital
//     const getDepartmentsForSelectedHospital = () => {
//         if (!formData.hospital?.id) return [];
//
//         return enhancedDepartments.filter(
//             (dept) => dept.hospital?.id === formData.hospital?.id,
//         );
//     };
//
//     if (!isOpen) return null;
//
//     // For edit mode, show available departments that haven't been assigned yet
//     let availableDepartments =
//         mode === "edit" && ward
//             ? getUnassignedDepartments(departments, ward)
//             : departments;
//
//     // If a hospital is selected, filter departments to that hospital
//     if (formData.hospital?.id) {
//         availableDepartments = availableDepartments.filter(
//             (dept) => dept.hospital?.id === formData.hospital?.id,
//         );
//     }
//
//     return (
//         <div className={`modal ${isOpen ? "is-active" : ""}`}>
//             <div className="modal-background" onClick={onClose}></div>
//             <div className="modal-card">
//                 <header className="modal-card-head">
//                     <p className="modal-card-title">
//                         {mode === "add" ? "Add New Ward" : "Edit Ward"}
//                     </p>
//                     <button
//                         className="delete"
//                         aria-label="close"
//                         onClick={onClose}
//                         disabled={isSubmitting}
//                     ></button>
//                 </header>
//
//                 <form onSubmit={handleSubmit}>
//                     <section className="modal-card-body">
//                         {formError && (
//                             <div className="notification is-danger">
//                                 <button
//                                     type="button"
//                                     className="delete"
//                                     onClick={() => setFormError("")}
//                                 ></button>
//                                 {formError}
//                             </div>
//                         )}
//
//                         <div className="columns">
//                             <div className="column is-8">
//                                 <div className="field">
//                                     <label className="label">Ward Name</label>
//                                     <div className="control">
//                                         <input
//                                             className="input"
//                                             type="text"
//                                             name="name"
//                                             value={formData.name}
//                                             onChange={handleInputChange}
//                                             placeholder="Enter ward name"
//                                             required
//                                         />
//                                     </div>
//                                 </div>
//                             </div>
//
//                             <div className="column is-4">
//                                 <div className="field">
//                                     <label className="label">Code</label>
//                                     <div className="control">
//                                         <input
//                                             className="input"
//                                             type="text"
//                                             name="code"
//                                             value={formData.code}
//                                             onChange={handleInputChange}
//                                             placeholder="Ward code"
//                                             required
//                                         />
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//
//                         <div className="field">
//                             <label className="label">Hospital</label>
//                             <div className="control">
//                                 <div className="select is-fullwidth">
//                                     <select
//                                         name="hospitalId"
//                                         value={formData.hospital?.id || ""}
//                                         onChange={handleInputChange}
//                                         required
//                                     >
//                                         <option value="">
//                                             Select hospital
//                                         </option>
//                                         {hospitals.map((hospital) => (
//                                             <option
//                                                 key={hospital.id}
//                                                 value={hospital.id}
//                                             >
//                                                 {hospital.name}
//                                                 {hospital.organisation?.name &&
//                                                     ` (${hospital.organisation.name})`}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </div>
//                             </div>
//                         </div>
//
//                         {/* When adding a new ward, we need to assign an initial department */}
//                         {mode === "add" && (
//                             <div className="field">
//                                 <label className="label">
//                                     Initial Department
//                                 </label>
//                                 <div className="control">
//                                     <div className="select is-fullwidth">
//                                         <select
//                                             name="initialDepartmentId"
//                                             value={initialDepartmentId}
//                                             onChange={handleInputChange}
//                                             required
//                                             disabled={!formData.hospital?.id}
//                                         >
//                                             <option value="">
//                                                 {formData.hospital?.id
//                                                     ? "Select a department"
//                                                     : "Please select a hospital first"}
//                                             </option>
//                                             {getDepartmentsForSelectedHospital().map(
//                                                 (dept) => (
//                                                     <option
//                                                         key={dept.id}
//                                                         value={dept.id}
//                                                     >
//                                                         {dept.name}
//                                                         {dept.code &&
//                                                             ` (${dept.code})`}
//                                                     </option>
//                                                 ),
//                                             )}
//                                         </select>
//                                     </div>
//                                 </div>
//
//                                 <div className="control mt-2">
//                                     <label className="checkbox">
//                                         <input
//                                             type="checkbox"
//                                             name="makeInitialDepartmentPrimary"
//                                             checked={
//                                                 makeInitialDepartmentPrimary
//                                             }
//                                             onChange={handleInputChange}
//                                         />
//                                         &nbsp;Set as primary department
//                                     </label>
//                                 </div>
//                                 <p className="help">
//                                     After creating the ward, you can assign it
//                                     to additional departments.
//                                 </p>
//                             </div>
//                         )}
//
//                         {/* When editing, just show the current primary department */}
//                         {mode === "edit" && (
//                             <div className="field">
//                                 <label className="label">
//                                     Primary Department
//                                 </label>
//                                 <div className="control">
//                                     <div className="is-flex is-align-items-center">
//                                         <span
//                                             className="mr-2"
//                                             style={{
//                                                 width: "16px",
//                                                 height: "16px",
//                                                 backgroundColor:
//                                                     formData.department
//                                                         ?.color || "#3273dc",
//                                                 borderRadius: "50%",
//                                                 display: "inline-block",
//                                             }}
//                                         ></span>
//                                         <span className="has-text-weight-medium">
//                                             {formData.department?.name ||
//                                                 "No primary department"}
//                                         </span>
//                                     </div>
//                                     <p className="help mt-2">
//                                         Use the "Manage Departments" option from
//                                         the ward card to change department
//                                         assignments.
//                                     </p>
//                                 </div>
//                             </div>
//                         )}
//
//                         <div className="field">
//                             <label className="label">Bed Count</label>
//                             <div className="control">
//                                 <input
//                                     className="input"
//                                     type="number"
//                                     name="bedCount"
//                                     value={formData.bedCount}
//                                     onChange={handleInputChange}
//                                     min="0"
//                                 />
//                             </div>
//                         </div>
//
//                         <div className="field mt-4">
//                             <div className="control">
//                                 <label className="checkbox">
//                                     <input
//                                         type="checkbox"
//                                         name="active"
//                                         checked={formData.active}
//                                         onChange={handleInputChange}
//                                     />
//                                     &nbsp;Active
//                                 </label>
//                             </div>
//                         </div>
//                     </section>
//
//                     <footer className="modal-card-foot">
//                         <button
//                             type="submit"
//                             className={`button is-primary ${isSubmitting ? "is-loading" : ""}`}
//                             disabled={isSubmitting}
//                         >
//                             {mode === "add" ? "Add Ward" : "Save Changes"}
//                         </button>
//                         <button
//                             type="button"
//                             className="button"
//                             onClick={onClose}
//                             disabled={isSubmitting}
//                         >
//                             Cancel
//                         </button>
//                     </footer>
//                 </form>
//             </div>
//         </div>
//     );
// }

// src/app/admin/components/wards/WardModal.tsx
import React, { useEffect, useState } from "react";
import { useWards, Ward } from "@/context/WardContext";
import { useOrganisations } from "@/context/OrganisationContext";
import { Hospital } from "@/context/HospitalContext";

type WardModalProps = {
    isOpen: boolean;
    mode: "add" | "edit";
    ward: Ward | null;
    onClose: () => void;
    onSave: (ward: Ward) => void;
    departmentId?: string; // Optional pre-selected department
};

// Enhanced department type with hospital information
type EnhancedDepartment = {
    id: string;
    name: string;
    code?: string;
    color?: string;
    hospital: {
        id: string;
        name: string;
        organisation?: {
            id: string;
            name: string;
        };
    };
};

export default function WardModal({
    isOpen,
    mode,
    ward,
    onClose,
    onSave,
    departmentId,
}: WardModalProps) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { departments, hospitals, assignWardToDepartment } = useWards();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { organisations } = useOrganisations();

    // Default empty ward
    const emptyWard: Ward = {
        id: "",
        name: "",
        code: "",
        // @ts-expect-error only id and name required here
        department: { id: "", name: "" },
        // @ts-expect-error only id and name required here
        hospital: { id: "", name: "" },
        bedCount: 0,
        active: true,
    };

    const [formData, setFormData] = useState<Ward>(emptyWard);
    const [formError, setFormError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State for organisation-hospital-department hierarchy
    const [selectedOrganisationId, setSelectedOrganisationId] =
        useState<string>("");
    const [selectedHospitalId, setSelectedHospitalId] = useState<string>("");
    const [initialDepartmentId, setInitialDepartmentId] = useState<string>("");
    const [makeInitialDepartmentPrimary, setMakeInitialDepartmentPrimary] =
        useState<boolean>(true);
    const [departmentSearchQuery, setDepartmentSearchQuery] =
        useState<string>("");

    // Enhanced departments with hospital info for better selection
    const [enhancedDepartments, setEnhancedDepartments] = useState<
        EnhancedDepartment[]
    >([]);

    // Group departments by organisation and hospital for better organisation\
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [groupedDepartments, setGroupedDepartments] = useState<{
        [orgId: string]: {
            organisation: { id: string; name: string };
            hospitals: {
                [hospitalId: string]: {
                    hospital: Hospital;
                    departments: EnhancedDepartment[];
                };
            };
        };
    }>({});

    // Group hospitals by organisation
    const [hospitalsByOrganisation, setHospitalsByOrganisation] = useState<{
        [orgId: string]: {
            organisation: { id: string; name: string };
            hospitals: Hospital[];
        };
    }>({});

    // Organize hospitals by organisation
    useEffect(() => {
        // @ts-nocheck-next-line
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const grouped: any = {};

        hospitals.forEach((hospital) => {
            if (!hospital.organisation) return;

            const orgId = hospital.organisation.id;
            const orgName = hospital.organisation.name;

            if (!grouped[orgId]) {
                grouped[orgId] = {
                    organisation: { id: orgId, name: orgName },
                    hospitals: [],
                };
            }

            grouped[orgId].hospitals.push(hospital);
        });

        setHospitalsByOrganisation(grouped);
    }, [hospitals]);

    // Process departments to add organisation and hospital context
    useEffect(() => {
        // Create enhanced department objects with hospital info
        const enhanced = departments.map((dept) => ({
            ...dept,
            hospital: dept.hospital || {
                id: "unknown",
                name: "Unknown Hospital",
            },
        })) as EnhancedDepartment[];

        setEnhancedDepartments(enhanced);

        // Group by organisation and hospital
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const grouped: any = {};

        enhanced.forEach((dept) => {
            if (!dept.hospital) return;

            const hospitalId = dept.hospital.id;
            const orgId = dept.hospital.organisation?.id || "unknown";
            const orgName =
                dept.hospital.organisation?.name || "Unknown Organisation";

            if (!grouped[orgId]) {
                grouped[orgId] = {
                    organisation: { id: orgId, name: orgName },
                    hospitals: {},
                };
            }

            if (!grouped[orgId].hospitals[hospitalId]) {
                grouped[orgId].hospitals[hospitalId] = {
                    hospital: dept.hospital,
                    departments: [],
                };
            }

            grouped[orgId].hospitals[hospitalId].departments.push(dept);
        });

        setGroupedDepartments(grouped);

        // If we have a specific department ID, find its organisation and hospital
        if (departmentId) {
            const selectedDept = departments.find((d) => d.id === departmentId);
            if (selectedDept && selectedDept.hospital) {
                const hospitalId = selectedDept.hospital.id;
                const orgId = selectedDept.hospital.organisation?.id;

                if (orgId) setSelectedOrganisationId(orgId);
                if (hospitalId) setSelectedHospitalId(hospitalId);
                setInitialDepartmentId(departmentId);
            }
        }
    }, [departments, departmentId]);

    useEffect(
        () => {
            if (mode === "edit" && ward) {
                setFormData({
                    ...ward,
                });

                // Set organisation and hospital based on the ward
                if (ward.hospital && ward.hospital.organisation) {
                    setSelectedOrganisationId(ward.hospital.organisation.id);
                    setSelectedHospitalId(ward.hospital.id);
                }
            } else {
                // Reset form for add mode
                const initialWard = {
                    ...emptyWard,
                };

                // If departmentId is provided, pre-select that department
                if (departmentId) {
                    const selectedDept = departments.find(
                        (d) => d.id === departmentId,
                    );
                    if (selectedDept) {
                        // For backward compatibility, still set the department field
                        // @ts-expect-error only id and name required here
                        initialWard.department = {
                            id: selectedDept.id,
                            name: selectedDept.name,
                            color: selectedDept.color,
                        };

                        // If department has a hospital, also pre-select that
                        if (selectedDept.hospital) {
                            initialWard.hospital = selectedDept.hospital;
                        }
                    }
                }

                setFormData(initialWard);
            }

            setFormError("");
            setIsSubmitting(false);
        }, // eslint-disable-next-line react-hooks/exhaustive-deps
        [mode, ward, departments, hospitals, isOpen, departmentId],
    );

    // Handle organisation selection
    const handleOrganisationChange = (
        e: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const orgId = e.target.value;
        setSelectedOrganisationId(orgId);
        setSelectedHospitalId(""); // Reset hospital when organisation changes
        setInitialDepartmentId(""); // Reset department when organisation changes

        // Reset form values that depend on this hierarchy
        // @ts-expect-error missing properties
        setFormData((prev) => ({
            ...prev,
            hospital: { id: "", name: "" },
            department: { id: "", name: "" },
        }));
    };

    // Handle hospital selection
    const handleHospitalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const hospitalId = e.target.value;
        setSelectedHospitalId(hospitalId);
        setInitialDepartmentId(""); // Reset department when hospital changes

        // Update the hospital in the form data
        const selectedHospital = hospitals.find((h) => h.id === hospitalId);
        if (selectedHospital) {
            // @ts-expect-error missing properties
            setFormData((prev) => ({
                ...prev,
                hospital: {
                    id: selectedHospital.id,
                    name: selectedHospital.name,
                    organisation: selectedHospital.organisation,
                },
                department: { id: "", name: "" }, // Reset department
            }));
        }
    };

    // Handle department selection
    const handleDepartmentChange = (
        e: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const deptId = e.target.value;
        setInitialDepartmentId(deptId);

        // Update the department in the form data
        if (deptId) {
            const selectedDept = departments.find((d) => d.id === deptId);
            if (selectedDept) {
                // @ts-expect-error only id and name required here
                setFormData((prev) => ({
                    ...prev,
                    department: {
                        id: selectedDept.id,
                        name: selectedDept.name,
                        color: selectedDept.color,
                    },
                }));
            }
        } else {
            // Reset department if none selected
            // @ts-expect-error only id and name required here
            setFormData((prev) => ({
                ...prev,
                department: { id: "", name: "" },
            }));
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value, type } = e.target;

        if (name === "makeInitialDepartmentPrimary") {
            setMakeInitialDepartmentPrimary(
                (e.target as HTMLInputElement).checked,
            );
        } else if (name === "departmentSearchQuery") {
            setDepartmentSearchQuery(value);
        } else {
            setFormData({
                ...formData,
                [name]:
                    type === "checkbox"
                        ? (e.target as HTMLInputElement).checked
                        : type === "number"
                          ? parseInt(value)
                          : value,
            });
        }
    };

    const validateForm = () => {
        // Validate required fields
        if (!formData.name.trim()) {
            setFormError("Ward name is required");
            return false;
        }

        if (!formData.code.trim()) {
            setFormError("Ward code is required");
            return false;
        }

        if (!formData.hospital?.id) {
            setFormError("Hospital is required");
            return false;
        }

        // In add mode, we require an initial department
        if (mode === "add" && !initialDepartmentId) {
            setFormError("Please select a department");
            return false;
        }

        if (formData.bedCount < 0) {
            setFormError("Bed count must be 0 or higher");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            if (mode === "add") {
                // Save the ward
                await onSave(formData);

                // If an initial department was selected, assign it after ward creation
                if (initialDepartmentId) {
                    // The ward id will be set during saving, so we'll need to handle
                    // the department assignment in the backend or after returning
                }
            } else {
                // In edit mode, just save the ward
                onSave(formData);
            }
        } catch (error) {
            console.error("Error saving ward:", error);
            setFormError("An error occurred while saving. Please try again.");
            setIsSubmitting(false);
        }
    };

    // Filter departments based on search and selected hospital
    const getFilteredDepartments = () => {
        if (!selectedHospitalId) return [];

        let depts = enhancedDepartments.filter(
            (dept) => dept.hospital?.id === selectedHospitalId,
        );

        // Filter by search if needed
        if (departmentSearchQuery) {
            const query = departmentSearchQuery.toLowerCase();
            depts = depts.filter(
                (dept) =>
                    dept.name.toLowerCase().includes(query) ||
                    (dept.code?.toLowerCase() || "").includes(query),
            );
        }

        return depts;
    };

    if (!isOpen) return null;

    return (
        <div className={`modal ${isOpen ? "is-active" : ""}`}>
            <div className="modal-background" onClick={onClose}></div>
            <div
                className="modal-card"
                style={{ width: "700px", maxWidth: "90vw" }}
            >
                <header className="modal-card-head">
                    <p className="modal-card-title">
                        {mode === "add" ? "Add New Ward" : "Edit Ward"}
                    </p>
                    <button
                        className="delete"
                        aria-label="close"
                        onClick={onClose}
                        disabled={isSubmitting}
                    ></button>
                </header>

                <form onSubmit={handleSubmit}>
                    <section className="modal-card-body">
                        {formError && (
                            <div className="notification is-danger">
                                <button
                                    type="button"
                                    className="delete"
                                    onClick={() => setFormError("")}
                                ></button>
                                {formError}
                            </div>
                        )}

                        <div className="columns">
                            <div className="column is-8">
                                <div className="field">
                                    <label className="label">Ward Name</label>
                                    <div className="control">
                                        <input
                                            className="input"
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="Enter ward name"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="column is-4">
                                <div className="field">
                                    <label className="label">Code</label>
                                    <div className="control">
                                        <input
                                            className="input"
                                            type="text"
                                            name="code"
                                            value={formData.code}
                                            onChange={handleInputChange}
                                            placeholder="Ward code"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Organisation-Hospital-Department Selection */}
                        <div className="box">
                            <h5 className="title is-6 mb-3">
                                Location & Department
                            </h5>

                            {/* Organisation Selection */}
                            <div className="field">
                                <label className="label">Organisation</label>
                                <div className="control">
                                    <div className="select is-fullwidth">
                                        <select
                                            value={selectedOrganisationId}
                                            onChange={handleOrganisationChange}
                                            disabled={mode === "edit"} // Disable in edit mode
                                        >
                                            <option value="">
                                                Select organisation
                                            </option>
                                            {Object.values(
                                                hospitalsByOrganisation,
                                            ).map((org) => (
                                                <option
                                                    key={org.organisation.id}
                                                    value={org.organisation.id}
                                                >
                                                    {org.organisation.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {mode === "edit" && (
                                        <p className="help mt-1">
                                            Organisation cannot be changed after
                                            ward creation
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Hospital Selection */}
                            <div className="field">
                                <label className="label">Hospital</label>
                                <div className="control">
                                    <div className="select is-fullwidth">
                                        <select
                                            value={selectedHospitalId}
                                            onChange={handleHospitalChange}
                                            disabled={
                                                !selectedOrganisationId ||
                                                mode === "edit"
                                            } // Disable if no org selected or in edit mode
                                        >
                                            <option value="">
                                                {selectedOrganisationId
                                                    ? "Select hospital"
                                                    : "Select organisation first"}
                                            </option>
                                            {selectedOrganisationId &&
                                                hospitalsByOrganisation[
                                                    selectedOrganisationId
                                                ]?.hospitals.map((hospital) => (
                                                    <option
                                                        key={hospital.id}
                                                        value={hospital.id}
                                                    >
                                                        {hospital.name}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                    {mode === "edit" && (
                                        <p className="help mt-1">
                                            Hospital cannot be changed after
                                            ward creation
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Department Selection (with search) */}
                            {mode === "add" && (
                                <div className="field">
                                    <label className="label">Department</label>
                                    <div className="is-flex mb-2">
                                        <div className="control is-expanded mr-2">
                                            <input
                                                className="input is-small"
                                                type="text"
                                                name="departmentSearchQuery"
                                                value={departmentSearchQuery}
                                                onChange={handleInputChange}
                                                placeholder="Search departments..."
                                                disabled={!selectedHospitalId}
                                            />
                                        </div>
                                    </div>
                                    <div className="control">
                                        <div className="select is-fullwidth">
                                            <select
                                                value={initialDepartmentId}
                                                onChange={
                                                    handleDepartmentChange
                                                }
                                                disabled={!selectedHospitalId}
                                                required={mode === "add"}
                                            >
                                                <option value="">
                                                    {selectedHospitalId
                                                        ? "Select department"
                                                        : "Select hospital first"}
                                                </option>
                                                {getFilteredDepartments().map(
                                                    (dept) => (
                                                        <option
                                                            key={dept.id}
                                                            value={dept.id}
                                                        >
                                                            {dept.name}{" "}
                                                            {dept.code
                                                                ? `(${dept.code})`
                                                                : ""}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                        </div>
                                    </div>

                                    {mode === "add" && selectedHospitalId && (
                                        <div className="control mt-2">
                                            <label className="checkbox">
                                                <input
                                                    type="checkbox"
                                                    name="makeInitialDepartmentPrimary"
                                                    checked={
                                                        makeInitialDepartmentPrimary
                                                    }
                                                    onChange={handleInputChange}
                                                />
                                                &nbsp;Set as primary department
                                            </label>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* When editing, just show the current primary department */}
                            {mode === "edit" && (
                                <div className="field">
                                    <label className="label">
                                        Primary Department
                                    </label>
                                    <div className="control">
                                        <div className="is-flex is-align-items-center p-2 has-background-light">
                                            <span
                                                className="mr-2"
                                                style={{
                                                    width: "16px",
                                                    height: "16px",
                                                    backgroundColor:
                                                        formData.department
                                                            ?.color ||
                                                        "#3273dc",
                                                    borderRadius: "50%",
                                                    display: "inline-block",
                                                }}
                                            ></span>
                                            <div>
                                                <span className="has-text-weight-medium">
                                                    {formData.department
                                                        ?.name ||
                                                        "No primary department"}
                                                </span>
                                                <p className="is-size-7 has-text-grey">
                                                    {formData.hospital?.name ||
                                                        ""}
                                                    {formData.hospital
                                                        ?.organisation?.name &&
                                                        ` (${formData.hospital.organisation.name})`}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="help mt-2">
                                            Use the &#34;Manage Departments&#34;
                                            option from the ward card to change
                                            department assignments.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="field">
                            <label className="label">Bed Count</label>
                            <div className="control">
                                <input
                                    className="input"
                                    type="number"
                                    name="bedCount"
                                    value={formData.bedCount}
                                    onChange={handleInputChange}
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className="field mt-4">
                            <div className="control">
                                <label className="checkbox">
                                    <input
                                        type="checkbox"
                                        name="active"
                                        checked={formData.active}
                                        onChange={handleInputChange}
                                    />
                                    &nbsp;Active
                                </label>
                            </div>
                        </div>
                    </section>

                    <footer className="modal-card-foot">
                        <button
                            type="submit"
                            className={`button is-primary ${isSubmitting ? "is-loading" : ""}`}
                            disabled={isSubmitting}
                        >
                            {mode === "add" ? "Add Ward" : "Save Changes"}
                        </button>
                        <button
                            type="button"
                            className="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
}
