// // src/app/admin/components/departments/DepartmentModal.tsx
// import React, { useEffect, useState } from "react";
// import { Department, useDepartments } from "@/context/DepartmentContext";
// import { useHospitals } from "@/context/HospitalContext";
//
// type DepartmentModalProps = {
//     isOpen: boolean;
//     mode: "add" | "edit";
//     department: Department | null;
//     onClose: () => void;
//     onSave: (department: Department) => void;
//     parentDepartment?: Department | null;
// };
//
// export default function DepartmentModal({
//                                             isOpen,
//                                             mode,
//                                             department,
//                                             onClose,
//                                             onSave,
//                                             parentDepartment = null,
//                                         }: DepartmentModalProps) {
//     const {departmentTypes, departments} = useDepartments();
//
//     const {organizations} = useHospitals();
//     const hospitals = useHospitals().hospitals;
//     // Default empty department
//     const emptyDepartment: Department = {
//         id: "",
//         name: "",
//         code: "",
//         description: "",
//         type: "pharmacy",
//         color: "#3273dc",
//         // @ts-expect-error small hospital component just for department creation and connect. Full hospital attributes not required here
//         hospital: {id: "", name: ""},
//         parent: parentDepartment,
//         requiresLunchCover: false,
//         pharmacistCount: 0,
//         technicianCount: 0,
//         active: true,
//     };
//
//     const [formData, setFormData] = useState<Department>(emptyDepartment);
//     const [formError, setFormError] = useState("");
//     const [isSubmitting, setIsSubmitting] = useState(false);
//
//     // Add a new state for filtered hospitals
//     const [filteredHospitals, setFilteredHospitals] = useState(hospitals);
//
//     // Additional state for showing special fields based on department type
//     const [showSpecialFields, setShowSpecialFields] = useState(false);
//
//     useEffect(() => {
//         if (mode === "edit" && department) {
//             const departmentWithOrg = {
//                 ...department,
//                 // If department doesn't have organization but has hospital with organization
//                 organization: department.organization ||
//                     (department.hospital &&
//                         department.hospital.organization) || {
//                         id: "",
//                         name: "",
//                     },
//             };
//             setFormData(departmentWithOrg);
//
//             // Filter hospitals based on selected organization
//             if (formData.organization?.id) {
//                 setFilteredHospitals(
//                     hospitals.filter(
//                         (h) =>
//                             h.organization?.id ===
//                             departmentWithOrg.organization?.id,
//                     ),
//                 );
//             } else {
//                 setFilteredHospitals(hospitals);
//             }
//
//             // Set special fields visibility based on department type
//             setShowSpecialFields(
//                 department.type === "inpatient" ||
//                 department.type === "outpatient" ||
//                 department.type === "pharmacy",
//             );
//         } else {
//             // Reset form for add mode
//             const initialDepartment = {
//                 ...emptyDepartment,
//                 parent: parentDepartment,
//             };
//
//             // If we're adding to a parent, use the parent's hospital and organization
//             if (parentDepartment && parentDepartment.hospital) {
//                 initialDepartment.hospital = parentDepartment.hospital;
//                 initialDepartment.organization =
//                     parentDepartment.organization || {id: "", name: ""};
//
//                 // Filter hospitals based on selected organization
//                 if (parentDepartment.organization?.id) {
//                     setFilteredHospitals(
//                         hospitals.filter(
//                             (h) =>
//                                 h.organization?.id ===
//                                 parentDepartment.organization?.id,
//                         ),
//                     );
//                 }
//             } else {
//                 setFilteredHospitals(hospitals);
//             }
//
//             setFormData(initialDepartment);
//             // Set default special fields visibility
//             setShowSpecialFields(false);
//         }
//         setFormError("");
//         setIsSubmitting(false);
//     }, [mode, department, hospitals, isOpen, parentDepartment]);
//
//     // Get root departments (for parent dropdown)
//     const rootDepartments = departments.filter((dept) => !dept.parent);
//
//     const handleInputChange = (
//         e: React.ChangeEvent<
//             HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
//         >,
//     ) => {
//         const {name, value, type} = e.target;
//
//         if (name === "organizationId") {
//             const selectedOrg = organizations.find((org) => org.id === value);
//
//             // Update organization and filter hospitals
//             setFormData({
//                 ...formData,
//                 organization: selectedOrg
//                     ? {
//                         id: selectedOrg.id,
//                         name: selectedOrg.name,
//                     }
//                     : {id: "", name: ""},
//                 // Reset hospital selection when organization changes
//                 hospital: {id: "", name: ""},
//             });
//
//             // Filter hospitals by selected organization
//             if (value) {
//                 setFilteredHospitals(
//                     hospitals.filter((h) => h.organization?.id === value),
//                 );
//             } else {
//                 setFilteredHospitals(hospitals);
//             }
//         } else if (name === "hospitalId") {
//             const selectedHospital = hospitals.find((h) => h.id === value);
//             if (selectedHospital) {
//                 setFormData({
//                     ...formData,
//                     // @ts-expect-error small hospital component just for department creation and connect
//                     hospital: {
//                         id: selectedHospital.id,
//                         name: selectedHospital.name,
//                     },
//                 });
//             }
//         } else if (name === "parentId") {
//             if (value === "") {
//                 // No parent selected
//                 setFormData({
//                     ...formData,
//                     parent: null,
//                 });
//             } else {
//                 const selectedParent = departments.find((d) => d.id === value);
//                 if (selectedParent) {
//                     const updates: Partial<Department> = {
//                         parent: {
//                             id: selectedParent.id,
//                             name: selectedParent.name,
//                         },
//                     };
//
//                     // Also update hospital to match parent's hospital
//                     if (selectedParent.hospital) {
//                         updates.hospital = selectedParent.hospital;
//                     }
//
//                     // Also update organization to match parent's organization
//                     if (selectedParent.organization) {
//                         updates.organization = selectedParent.organization;
//
//                         // Filter hospitals by parent's organization
//                         setFilteredHospitals(
//                             hospitals.filter(
//                                 (h) =>
//                                     h.organization?.id ===
//                                     selectedParent.organization?.id,
//                             ),
//                         );
//                     }
//
//                     setFormData({
//                         ...formData,
//                         ...updates,
//                     });
//                 }
//             }
//         } else if (name === "type") {
//             // Update special fields visibility when type changes
//             setShowSpecialFields(
//                 value === "inpatient" ||
//                 value === "outpatient" ||
//                 value === "pharmacy",
//             );
//
//             setFormData({
//                 ...formData,
//                 [name]: value,
//             });
//         } else {
//             setFormData({
//                 ...formData,
//                 [name]:
//                     type === "checkbox"
//                         ? (e.target as HTMLInputElement).checked
//                         : type === "number"
//                             ? parseInt(value)
//                             : value,
//             });
//         }
//     };
//
//     const validateForm = () => {
//         // Validate required fields
//         if (!formData.name.trim()) {
//             setFormError("Department name is required");
//             return false;
//         }
//
//         if (!formData.code.trim()) {
//             setFormError("Department code is required");
//             return false;
//         }
//
//         if (!formData.type) {
//             setFormError("Department type is required");
//             return false;
//         }
//
//         if (!formData.organization?.id) {
//             setFormError("Organization is required");
//             return false;
//         }
//
//         if (!formData.hospital?.id) {
//             setFormError("Hospital is required");
//             return false;
//         }
//
//         // Check for special fields if department is inpatient/outpatient
//         if (formData.type === "inpatient" || formData.type === "outpatient") {
//             if (
//                 formData.pharmacistCount === undefined ||
//                 formData.pharmacistCount < 0
//             ) {
//                 setFormError("Pharmacist count must be 0 or higher");
//                 return false;
//             }
//
//             if (
//                 formData.technicianCount === undefined ||
//                 formData.technicianCount < 0
//             ) {
//                 setFormError("Technician count must be 0 or higher");
//                 return false;
//             }
//         }
//
//         return true;
//     };
//
//     const handleSubmit = (e: React.FormEvent) => {
//         e.preventDefault();
//
//         // Validate form
//         if (!validateForm()) {
//             return;
//         }
//
//         setIsSubmitting(true);
//
//         // Save the department
//         try {
//             onSave(formData);
//         } catch (error) {
//             console.error("Error saving department:", error);
//             setFormError("An error occurred while saving. Please try again.");
//             setIsSubmitting(false);
//         }
//     };
//
//     if (!isOpen) return null;
//
//     return (
//         <div className={`modal ${isOpen ? "is-active" : ""}`}>
//             <div className="modal-background" onClick={onClose}></div>
//             <div className="modal-card">
//                 <header className="modal-card-head">
//                     <p className="modal-card-title">
//                         {mode === "add"
//                             ? "Add New Department"
//                             : "Edit Department"}
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
//                                     <label className="label">
//                                         Department Name
//                                     </label>
//                                     <div className="control">
//                                         <input
//                                             className="input"
//                                             type="text"
//                                             name="name"
//                                             value={formData.name}
//                                             onChange={handleInputChange}
//                                             placeholder="Enter department name"
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
//                                             placeholder="Department code"
//                                             required
//                                         />
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//
//                         <div className="field">
//                             <label className="label">Description</label>
//                             <div className="control">
//                                 <textarea
//                                     className="textarea"
//                                     name="description"
//                                     value={formData.description || ""}
//                                     onChange={handleInputChange}
//                                     placeholder="Department description"
//                                     rows={2}
//                                 ></textarea>
//                             </div>
//                         </div>
//
//                         <div className="columns">
//                             <div className="column is-6">
//                                 <div className="field">
//                                     <label className="label">
//                                         Organization
//                                     </label>
//                                     <div className="control">
//                                         <div className="select is-fullwidth">
//                                             <select
//                                                 name="organizationId"
//                                                 value={
//                                                     formData.organization?.id ||
//                                                     formData.hospital
//                                                         ?.organization?.id ||
//                                                     ""
//                                                 }
//                                                 onChange={handleInputChange}
//                                                 required
//                                                 disabled={!!formData.parent} // Disable if parent is selected
//                                             >
//                                                 <option value="">
//                                                     Select organization
//                                                 </option>
//                                                 {organizations.map((org) => (
//                                                     <option
//                                                         key={org.id}
//                                                         value={org.id}
//                                                     >
//                                                         {org.name}
//                                                     </option>
//                                                 ))}
//                                             </select>
//                                         </div>
//                                         {formData.parent && (
//                                             <p className="help">
//                                                 Organization is determined by
//                                                 parent department
//                                             </p>
//                                         )}
//                                     </div>
//                                 </div>
//                             </div>
//
//                             <div className="column is-6">
//                                 <div className="field">
//                                     <label className="label">Hospital</label>
//                                     <div className="control">
//                                         <div className="select is-fullwidth">
//                                             <select
//                                                 name="hospitalId"
//                                                 value={
//                                                     formData.hospital?.id || ""
//                                                 }
//                                                 onChange={handleInputChange}
//                                                 required
//                                                 disabled={
//                                                     !!formData.parent ||
//                                                     !formData.organization?.id
//                                                 } // Disable if parent is selected or no organization
//                                             >
//                                                 <option value="">
//                                                     Select hospital
//                                                 </option>
//                                                 {filteredHospitals.map(
//                                                     (hospital) => (
//                                                         <option
//                                                             key={hospital.id}
//                                                             value={hospital.id}
//                                                         >
//                                                             {hospital.name}
//                                                         </option>
//                                                     ),
//                                                 )}
//                                             </select>
//                                         </div>
//                                         {formData.parent ? (
//                                             <p className="help">
//                                                 Hospital is determined by parent
//                                                 department
//                                             </p>
//                                         ) : (
//                                             !formData.organization?.id && (
//                                                 <p className="help">
//                                                     Please select an
//                                                     organization first
//                                                 </p>
//                                             )
//                                         )}
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//
//                         <div className="columns">
//                             <div className="column is-6">
//                                 <div className="field">
//                                     <label className="label">
//                                         Department Type
//                                     </label>
//                                     <div className="control">
//                                         <div className="select is-fullwidth">
//                                             <select
//                                                 name="type"
//                                                 value={formData.type}
//                                                 onChange={handleInputChange}
//                                                 required
//                                             >
//                                                 <option value="">
//                                                     Select type
//                                                 </option>
//                                                 {departmentTypes.map((type) => (
//                                                     <option
//                                                         key={type.id}
//                                                         value={type.id}
//                                                     >
//                                                         {type.name}
//                                                     </option>
//                                                 ))}
//                                             </select>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//
//                             <div className="column is-6">
//                                 <div className="field">
//                                     <label className="label">
//                                         Parent Department
//                                     </label>
//                                     <div className="control">
//                                         <div className="select is-fullwidth">
//                                             <select
//                                                 name="parentId"
//                                                 value={
//                                                     formData.parent?.id || ""
//                                                 }
//                                                 onChange={handleInputChange}
//                                                 // Disable if this is an edit and we have children
//                                                 disabled={
//                                                     mode === "edit" &&
//                                                     department?.children &&
//                                                     department.children.length >
//                                                     0
//                                                 }
//                                             >
//                                                 <option value="">
//                                                     No Parent (Top-Level)
//                                                 </option>
//                                                 {rootDepartments
//                                                     .filter(
//                                                         (d) =>
//                                                             d.id !==
//                                                             formData.id,
//                                                     ) // Prevent selecting self as parent
//                                                     .map((dept) => (
//                                                         <option
//                                                             key={dept.id}
//                                                             value={dept.id}
//                                                         >
//                                                             {dept.name}
//                                                         </option>
//                                                     ))}
//                                             </select>
//                                         </div>
//                                         {mode === "edit" &&
//                                             department?.children &&
//                                             department.children.length > 0 && (
//                                                 <p className="help">
//                                                     Cannot change parent when
//                                                     department has
//                                                     subdepartments
//                                                 </p>
//                                             )}
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//
//                         <div className="field mt-3">
//                             <label className="label">Color</label>
//                             <div className="control has-icons-left">
//                                 <input
//                                     className="input"
//                                     type="color"
//                                     name="color"
//                                     value={formData.color || "#3273dc"}
//                                     onChange={handleInputChange}
//                                 />
//                                 <span className="icon is-small is-left">
//                                     <i className="fas fa-palette"></i>
//                                 </span>
//                             </div>
//                         </div>
//
//                         {/* Special fields for inpatient/outpatient pharmacy */}
//                         {showSpecialFields && (
//                             <div className="box mt-4">
//                                 <h4 className="title is-5 mb-3">
//                                     Special Settings
//                                 </h4>
//
//                                 <div className="field">
//                                     <div className="control">
//                                         <label className="checkbox">
//                                             <input
//                                                 type="checkbox"
//                                                 name="requiresLunchCover"
//                                                 checked={
//                                                     formData.requiresLunchCover ||
//                                                     false
//                                                 }
//                                                 onChange={handleInputChange}
//                                             />
//                                             &nbsp;Requires Lunch Cover
//                                         </label>
//                                     </div>
//                                 </div>
//
//                                 <div className="columns">
//                                     <div className="column is-6">
//                                         <div className="field">
//                                             <label className="label">
//                                                 Pharmacist Count
//                                             </label>
//                                             <div className="control">
//                                                 <input
//                                                     className="input"
//                                                     type="number"
//                                                     name="pharmacistCount"
//                                                     value={
//                                                         formData.pharmacistCount ||
//                                                         0
//                                                     }
//                                                     onChange={handleInputChange}
//                                                     min="0"
//                                                 />
//                                             </div>
//                                         </div>
//                                     </div>
//
//                                     <div className="column is-6">
//                                         <div className="field">
//                                             <label className="label">
//                                                 Technician Count
//                                             </label>
//                                             <div className="control">
//                                                 <input
//                                                     className="input"
//                                                     type="number"
//                                                     name="technicianCount"
//                                                     value={
//                                                         formData.technicianCount ||
//                                                         0
//                                                     }
//                                                     onChange={handleInputChange}
//                                                     min="0"
//                                                 />
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         )}
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
//                             {mode === "add" ? "Add Department" : "Save Changes"}
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

// src/app/admin/components/departments/DepartmentModal.tsx
import React, {useEffect, useState} from "react";
import {Department, useDepartments} from "@/context/DepartmentContext";
import {useHospitals} from "@/context/HospitalContext";

type DepartmentModalProps = {
    isOpen: boolean;
    mode: "add" | "edit";
    department: Department | null;
    onClose: () => void;
    onSave: (department: Department) => void;
    parentDepartment?: Department | null;
};

export default function DepartmentModal({
    isOpen,
    mode,
    department,
    onClose,
    onSave,
    parentDepartment = null,
}: DepartmentModalProps) {
    const { departmentTypes, departments } = useDepartments();
    const { organizations } = useHospitals();
    const hospitals = useHospitals().hospitals;
    // Default empty department
    const emptyDepartment: Department = {
        id: "",
        name: "",
        code: "",
        description: "",
        type: "",
        color: "#3273dc",
        // @ts-expect-error small hospital component just for department creation and connect. Full hospital attributes not required here
        hospital: { id: "", name: "" },
        parent: parentDepartment,
        requiresLunchCover: false,
        pharmacistCount: 0,
        technicianCount: 0,
        active: true,
    };

    const [formData, setFormData] = useState<Department>(emptyDepartment);
    const [formError, setFormError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Add a new state for filtered hospitals
    const [filteredHospitals, setFilteredHospitals] = useState(hospitals);

    // Additional state for showing special fields based on department type
    const [showSpecialFields, setShowSpecialFields] = useState(false);

    useEffect(() => {
        if (mode === "edit" && department) {
            const departmentWithOrg = {
                ...department,
                // If department doesn't have organization but has hospital with organization
                organization: department.hospital.organization ||
                    (department.hospital &&
                        department.hospital.organization) || {
                        id: "",
                        name: "",
                    },
            };
            setFormData(departmentWithOrg);

            // Filter hospitals based on selected organization
            if (formData.hospital.organization?.id) {
                setFilteredHospitals(
                    hospitals.filter(
                        (h) =>
                            h.organization?.id ===
                            departmentWithOrg.organization?.id,
                    ),
                );
            } else {
                setFilteredHospitals(hospitals);
            }

            // Set special fields visibility based on department type
            setShowSpecialFields(
                department.type === "inpatient" ||
                    department.type === "outpatient" ||
                    department.type === "pharmacy",
            );
        } else {
            // Reset form for add mode
            const initialDepartment = {
                ...emptyDepartment,
                parent: parentDepartment,
            };

            // If we're adding to a parent, use the parent's hospital and organization
            if (parentDepartment && parentDepartment.hospital) {
                initialDepartment.hospital = parentDepartment.hospital;
                initialDepartment.hospital.organization = parentDepartment
                    .hospital.organization || { id: "", name: "" };

                // Filter hospitals based on selected organization
                if (parentDepartment.hospital.organization?.id) {
                    setFilteredHospitals(
                        hospitals.filter(
                            (h) =>
                                h.organization?.id ===
                                parentDepartment.hospital.organization?.id,
                        ),
                    );
                }
            } else {
                setFilteredHospitals(hospitals);
            }

            setFormData(initialDepartment);
            // Set default special fields visibility
            setShowSpecialFields(false);
        }
        setFormError("");
        setIsSubmitting(false);
    }, [mode, department, hospitals, isOpen, parentDepartment]);

    // Get root departments (for parent dropdown)
    const rootDepartments = departments.filter((dept) => !dept.parent);

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >,
    ) => {
        const { name, value, type } = e.target;

        if (name === "organizationId") {
            // Find the selected organization from the organizations array
            const selectedOrg = organizations.find((org) => org.id === value);

            // Update the form data with the selected organization
            const updatedFormData = {
                ...formData,
                hospital: {
                    ...formData.hospital,
                    organization: selectedOrg
                        ? {
                              id: selectedOrg.id,
                              name: selectedOrg.name,
                          }
                        : { id: "", name: "" },
                    // Reset hospital ID when organization changes
                    id: "",
                    name: "",
                },
            };
            // @ts-expect-error small hospital component just for department creation and connect
            setFormData(updatedFormData);

            // Filter hospitals based on selected organization
            if (value) {
                setFilteredHospitals(
                    hospitals.filter((h) => h.organization?.id === value),
                );
            } else {
                setFilteredHospitals(hospitals);
            }
        } else if (name === "hospitalId") {
            const selectedHospital = hospitals.find((h) => h.id === value);
            if (selectedHospital) {
                setFormData({
                    ...formData,
                    hospital: {
                        ...formData.hospital, // Preserve existing hospital properties, including organization
                        id: selectedHospital.id,
                        name: selectedHospital.name,
                    },
                });
            }
        } else if (name === "parentId") {
            if (value === "") {
                // No parent selected
                setFormData({
                    ...formData,
                    parent: null,
                });
            } else {
                const selectedParent = departments.find((d) => d.id === value);
                if (selectedParent) {
                    const updates: Partial<Department> = {
                        parent: {
                            id: selectedParent.id,
                            name: selectedParent.name,
                        },
                    };

                    // Also update hospital to match parent's hospital
                    if (selectedParent.hospital) {
                        updates.hospital = selectedParent.hospital;
                    }

                    // Also update organization to match parent's organization
                    if (selectedParent.hospital && updates.hospital) {
                        updates.hospital.organization =
                            selectedParent.hospital.organization;

                        // Filter hospitals by parent's organization
                        setFilteredHospitals(
                            hospitals.filter(
                                (h) =>
                                    h.organization?.id ===
                                    selectedParent.hospital.organization?.id,
                            ),
                        );
                    }

                    setFormData({
                        ...formData,
                        ...updates,
                    });
                }
            }
        } else if (name === "type") {
            // Update special fields visibility when type changes
            setShowSpecialFields(
                value === "inpatient" ||
                    value === "outpatient" ||
                    value === "pharmacy",
            );

            setFormData({
                ...formData,
                [name]: value,
            });
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
            setFormError("Department name is required");
            return false;
        }

        if (!formData.code.trim()) {
            setFormError("Department code is required");
            return false;
        }

        if (!formData.type) {
            setFormError("Department type is required");
            return false;
        }

        if (!formData.hospital.organization?.id) {
            setFormError("Organization is required");
            return false;
        }

        if (!formData.hospital?.id) {
            setFormError("Hospital is required");
            return false;
        }

        // Check for special fields if department is inpatient/outpatient
        if (formData.type === "inpatient" || formData.type === "outpatient") {
            if (
                formData.pharmacistCount === undefined ||
                formData.pharmacistCount < 0
            ) {
                setFormError("Pharmacist count must be 0 or higher");
                return false;
            }

            if (
                formData.technicianCount === undefined ||
                formData.technicianCount < 0
            ) {
                setFormError("Technician count must be 0 or higher");
                return false;
            }
        }

        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        // Save the department
        try {
            onSave(formData);
        } catch (error) {
            console.error("Error saving department:", error);
            setFormError("An error occurred while saving. Please try again.");
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={`modal ${isOpen ? "is-active" : ""}`}>
            <div className="modal-background" onClick={onClose}></div>
            <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">
                        {mode === "add"
                            ? "Add New Department"
                            : "Edit Department"}
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
                                    <label className="label">
                                        Department Name
                                    </label>
                                    <div className="control">
                                        <input
                                            className="input"
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="Enter department name"
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
                                            placeholder="Department code"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="field">
                            <label className="label">Description</label>
                            <div className="control">
                                <textarea
                                    className="textarea"
                                    name="description"
                                    value={formData.description || ""}
                                    onChange={handleInputChange}
                                    placeholder="Department description"
                                    rows={2}
                                ></textarea>
                            </div>
                        </div>

                        <div className="columns">
                            <div className="column is-6">
                                <div className="field">
                                    <label className="label">
                                        Organization
                                    </label>
                                    <div className="control">
                                        <div className="select is-fullwidth">
                                            <select
                                                name="organizationId"
                                                value={
                                                    formData.hospital
                                                        .organization?.id ||
                                                    formData.hospital
                                                        ?.organization?.id ||
                                                    ""
                                                }
                                                onChange={handleInputChange}
                                                required
                                                disabled={!!formData.parent} // Disable if parent is selected
                                            >
                                                <option value="">
                                                    Select organization
                                                </option>
                                                {organizations.map((org) => (
                                                    <option
                                                        key={org.id}
                                                        value={org.id}
                                                    >
                                                        {org.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {formData.parent && (
                                            <p className="help">
                                                Organization is determined by
                                                parent department
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="column is-6">
                                <div className="field">
                                    <label className="label">Hospital</label>
                                    <div className="control">
                                        <div className="select is-fullwidth">
                                            <select
                                                name="hospitalId"
                                                value={
                                                    formData.hospital?.id || ""
                                                }
                                                onChange={handleInputChange}
                                                required
                                                disabled={
                                                    !!formData.parent ||
                                                    !formData.hospital
                                                        .organization?.id
                                                } // Disable if parent is selected or no organization
                                            >
                                                <option value="">
                                                    Select hospital
                                                </option>
                                                {filteredHospitals.map(
                                                    (hospital) => (
                                                        <option
                                                            key={hospital.id}
                                                            value={hospital.id}
                                                        >
                                                            {hospital.name}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                        </div>
                                        {formData.parent ? (
                                            <p className="help">
                                                Hospital is determined by parent
                                                department
                                            </p>
                                        ) : (
                                            !formData.hospital.organization
                                                ?.id && (
                                                <p className="help">
                                                    Please select an
                                                    organization first
                                                </p>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="columns">
                            <div className="column is-6">
                                <div className="field">
                                    <label className="label">
                                        Department Type
                                    </label>
                                    <div className="control">
                                        <div className="select is-fullwidth">
                                            <select
                                                name="type"
                                                value={formData.type}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="">
                                                    Select type
                                                </option>
                                                {departmentTypes.map((type) => (
                                                    <option
                                                        key={type.id}
                                                        value={type.id}
                                                    >
                                                        {type.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="column is-6">
                                <div className="field">
                                    <label className="label">
                                        Parent Department
                                    </label>
                                    <div className="control">
                                        <div className="select is-fullwidth">
                                            <select
                                                name="parentId"
                                                value={
                                                    formData.parent?.id || ""
                                                }
                                                onChange={handleInputChange}
                                                // Disable if this is an edit and we have children
                                                disabled={
                                                    mode === "edit" &&
                                                    department?.children &&
                                                    department.children.length >
                                                        0
                                                }
                                            >
                                                <option value="">
                                                    No Parent (Top-Level)
                                                </option>
                                                {rootDepartments
                                                    .filter(
                                                        (d) =>
                                                            d.id !==
                                                            formData.id,
                                                    ) // Prevent selecting self as parent
                                                    .map((dept) => (
                                                        <option
                                                            key={dept.id}
                                                            value={dept.id}
                                                        >
                                                            {dept.name}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>
                                        {mode === "edit" &&
                                            department?.children &&
                                            department.children.length > 0 && (
                                                <p className="help">
                                                    Cannot change parent when
                                                    department has
                                                    subdepartments
                                                </p>
                                            )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="field mt-3">
                            <label className="label">Color</label>
                            <div className="control has-icons-left">
                                <input
                                    className="input"
                                    type="color"
                                    name="color"
                                    value={formData.color || "#3273dc"}
                                    onChange={handleInputChange}
                                />
                                <span className="icon is-small is-left">
                                    <i className="fas fa-palette"></i>
                                </span>
                            </div>
                        </div>

                        {/* Special fields for inpatient/outpatient pharmacy */}
                        {showSpecialFields && (
                            <div className="box mt-4">
                                <h4 className="title is-5 mb-3">
                                    Special Settings
                                </h4>

                                <div className="field">
                                    <div className="control">
                                        <label className="checkbox">
                                            <input
                                                type="checkbox"
                                                name="requiresLunchCover"
                                                checked={
                                                    formData.requiresLunchCover ||
                                                    false
                                                }
                                                onChange={handleInputChange}
                                            />
                                            &nbsp;Requires Lunch Cover
                                        </label>
                                    </div>
                                </div>

                                <div className="columns">
                                    <div className="column is-6">
                                        <div className="field">
                                            <label className="label">
                                                Pharmacist Count
                                            </label>
                                            <div className="control">
                                                <input
                                                    className="input"
                                                    type="number"
                                                    name="pharmacistCount"
                                                    value={
                                                        formData.pharmacistCount ||
                                                        0
                                                    }
                                                    onChange={handleInputChange}
                                                    min="0"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="column is-6">
                                        <div className="field">
                                            <label className="label">
                                                Technician Count
                                            </label>
                                            <div className="control">
                                                <input
                                                    className="input"
                                                    type="number"
                                                    name="technicianCount"
                                                    value={
                                                        formData.technicianCount ||
                                                        0
                                                    }
                                                    onChange={handleInputChange}
                                                    min="0"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

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
                            {mode === "add" ? "Add Department" : "Save Changes"}
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
