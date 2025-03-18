// // // src/app/admin/components/departments/DepartmentFilter.tsx
// // import { useDepartments } from "@/context/DepartmentContext";
// //
// // type FilterProps = {
// //     filter: {
// //         hospital: string;
// //         type: string;
// //         parent: string;
// //         search: string;
// //     };
// //     setFilter: React.Dispatch<
// //         React.SetStateAction<{
// //             hospital: string;
// //             type: string;
// //             parent: string;
// //             search: string;
// //         }>
// //     >;
// // };
// //
// // export default function DepartmentFilter({ filter, setFilter }: FilterProps) {
// //     const { hospitals, departmentTypes, departments, departmentHierarchy } =
// //         useDepartments();
// //
// //     const handleFilterChange = (
// //         e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
// //     ) => {
// //         const { name, value } = e.target;
// //         setFilter({
// //             ...filter,
// //             [name]: value,
// //         });
// //     };
// //
// //     // Get top-level departments for parent filter
// //     const allRootDepartments = departmentHierarchy;
// //
// //     return (
// //         <aside className="menu">
// //             <p className="menu-label">Filters</p>
// //             <div className="field">
// //                 <label className="label is-small">Hospital</label>
// //                 <div className="control">
// //                     <div className="select is-small is-fullwidth">
// //                         <select
// //                             name="hospital"
// //                             value={filter.hospital}
// //                             onChange={handleFilterChange}
// //                         >
// //                             <option value="all">All Hospitals</option>
// //                             {hospitals.map((hospital) => (
// //                                 <option key={hospital.id} value={hospital.id}>
// //                                     {hospital.name}
// //                                 </option>
// //                             ))}
// //                         </select>
// //                     </div>
// //                 </div>
// //             </div>
// //
// //             <div className="field">
// //                 <label className="label is-small">Department Type</label>
// //                 <div className="control">
// //                     <div className="select is-small is-fullwidth">
// //                         <select
// //                             name="type"
// //                             value={filter.type}
// //                             onChange={handleFilterChange}
// //                         >
// //                             <option value="all">All Types</option>
// //                             {departmentTypes.map((type) => (
// //                                 <option key={type.id} value={type.id}>
// //                                     {type.name}
// //                                 </option>
// //                             ))}
// //                         </select>
// //                     </div>
// //                 </div>
// //             </div>
// //
// //             <div className="field">
// //                 <label className="label is-small">Parent Department</label>
// //                 <div className="control">
// //                     <div className="select is-small is-fullwidth">
// //                         <select
// //                             name="parent"
// //                             value={filter.parent}
// //                             onChange={handleFilterChange}
// //                         >
// //                             <option value="all">All Departments</option>
// //                             <option value="root">Top Level Only</option>
// //                             {allRootDepartments.map((dept) => (
// //                                 <option key={dept.id} value={dept.id}>
// //                                     {dept.name}
// //                                 </option>
// //                             ))}
// //                         </select>
// //                     </div>
// //                 </div>
// //             </div>
// //
// //             <div className="field">
// //                 <label className="label is-small">Search</label>
// //                 <div className="control has-icons-left">
// //                     <input
// //                         className="input is-small"
// //                         type="text"
// //                         placeholder="Search departments"
// //                         name="search"
// //                         value={filter.search}
// //                         onChange={handleFilterChange}
// //                     />
// //                     <span className="icon is-small is-left">
// //                         <i className="fas fa-search"></i>
// //                     </span>
// //                 </div>
// //             </div>
// //         </aside>
// //     );
// // }
//
// // src/app/admin/components/departments/DepartmentFilter.tsx
// import {useEffect, useState} from "react";
// import {Department, useDepartments} from "@/context/DepartmentContext";
//
// type FilterProps = {
//     filter: {
//         hospital: string;
//         type: string;
//         parent: string;
//         search: string;
//     };
//     setFilter: React.Dispatch<
//         React.SetStateAction<{
//             hospital: string;
//             type: string;
//             parent: string;
//             search: string;
//         }>
//     >;
// };
//
// export default function DepartmentFilter({ filter, setFilter }: FilterProps) {
//     const { hospitals, departmentTypes, getAllDepartments } = useDepartments();
//
//     // Keep a separate state for root departments that won't be affected by filters
//     const [rootDepartments, setRootDepartments] = useState<Department[]>([]);
//
//     // Fetch all departments and filter for root departments on component mount
//     useEffect(() => {
//         // This assumes your context has a method to get all departments unfiltered
//         // If it doesn't, you'd need to add such a method to your context
//         const allDepartments = getAllDepartments ? getAllDepartments() : [];
//         const rootDepts = allDepartments.filter((dept) => !dept.parent);
//         setRootDepartments(rootDepts);
//     }, [getAllDepartments]);
//
//     const handleFilterChange = (
//         e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
//     ) => {
//         const { name, value } = e.target;
//         setFilter({
//             ...filter,
//             [name]: value,
//         });
//     };
//
//     return (
//         <aside className="menu">
//             <p className="menu-label">Filters</p>
//             <div className="field">
//                 <label className="label is-small">Hospital</label>
//                 <div className="control">
//                     <div className="select is-small is-fullwidth">
//                         <select
//                             name="hospital"
//                             value={filter.hospital}
//                             onChange={handleFilterChange}
//                         >
//                             <option value="all">All Hospitals</option>
//                             {hospitals.map((hospital) => (
//                                 <option key={hospital.id} value={hospital.id}>
//                                     {hospital.name}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>
//                 </div>
//             </div>
//
//             <div className="field">
//                 <label className="label is-small">Department Type</label>
//                 <div className="control">
//                     <div className="select is-small is-fullwidth">
//                         <select
//                             name="type"
//                             value={filter.type}
//                             onChange={handleFilterChange}
//                         >
//                             <option value="all">All Types</option>
//                             {departmentTypes.map((type) => (
//                                 <option key={type.id} value={type.id}>
//                                     {type.name}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>
//                 </div>
//             </div>
//
//             <div className="field">
//                 <label className="label is-small">Parent Department</label>
//                 <div className="control">
//                     <div className="select is-small is-fullwidth">
//                         <select
//                             name="parent"
//                             value={filter.parent}
//                             onChange={handleFilterChange}
//                         >
//                             <option value="all">All Departments</option>
//                             <option value="root">Top Level Only</option>
//                             {rootDepartments.map((dept) => (
//                                 <option key={dept.id} value={dept.id}>
//                                     {dept.name}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>
//                 </div>
//             </div>
//
//             <div className="field">
//                 <label className="label is-small">Search</label>
//                 <div className="control has-icons-left">
//                     <input
//                         className="input is-small"
//                         type="text"
//                         placeholder="Search departments"
//                         name="search"
//                         value={filter.search}
//                         onChange={handleFilterChange}
//                     />
//                     <span className="icon is-small is-left">
//                         <i className="fas fa-search"></i>
//                     </span>
//                 </div>
//             </div>
//         </aside>
//     );
// }

// src/app/admin/components/departments/DepartmentFilter.tsx
import {useDepartments} from "@/context/DepartmentContext";
import {useHospitals} from "@/context/HospitalContext";
import React from "react";

type FilterProps = {
    filter: {
        hospital: string;
        type: string;
        parent: string;
        search: string;
    };
    setFilter: React.Dispatch<
        React.SetStateAction<{
            hospital: string;
            type: string;
            parent: string;
            search: string;
        }>
    >;
};

export default function DepartmentFilter({ filter, setFilter }: FilterProps) {
    const { departmentTypes, getAllRootDepartments } = useDepartments();
    const hospitals = useHospitals().hospitals;
    const { organizations } = useHospitals();
    // Get all root departments using the new context method
    // const rootDepartments = getAllRootDepartments();

    const handleFilterChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;
        setFilter({
            ...filter,
            [name]: value,
        });
    };

    return (
        <aside className="menu">
            <p className="menu-label">Filters</p>
            <div className="field">
                <label className="label is-small">Organization</label>
                <div className="control">
                    <div className="select is-small is-fullwidth">
                        <select
                            name="hospital"
                            value={filter.hospital}
                            onChange={handleFilterChange}
                        >
                            <option value="all">All Organizations</option>
                            {organizations.map((hospital) => (
                                <option key={hospital.id} value={hospital.id}>
                                    {hospital.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
            <div className="field">
                <label className="label is-small">Hospital</label>
                <div className="control">
                    <div className="select is-small is-fullwidth">
                        <select
                            name="hospital"
                            value={filter.hospital}
                            onChange={handleFilterChange}
                        >
                            <option value="all">All Hospitals</option>
                            {hospitals.map((hospital) => (
                                <option key={hospital.id} value={hospital.id}>
                                    {hospital.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="field">
                <label className="label is-small">Department Type</label>
                <div className="control">
                    <div className="select is-small is-fullwidth">
                        <select
                            name="type"
                            value={filter.type}
                            onChange={handleFilterChange}
                        >
                            <option value="all">All Types</option>
                            {departmentTypes.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/*<div className="field">*/}
            {/*    <label className="label is-small">Parent Department</label>*/}
            {/*    <div className="control">*/}
            {/*        <div className="select is-small is-fullwidth">*/}
            {/*            <select*/}
            {/*                name="parent"*/}
            {/*                value={filter.parent}*/}
            {/*                onChange={handleFilterChange}*/}
            {/*            >*/}
            {/*                <option value="all">All Departments</option>*/}
            {/*                <option value="root">Top Level Only</option>*/}
            {/*                {rootDepartments.map((dept) => (*/}
            {/*                    <option key={dept.id} value={dept.id}>*/}
            {/*                        {dept.name}*/}
            {/*                    </option>*/}
            {/*                ))}*/}
            {/*            </select>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*</div>*/}

            <div className="field">
                <label className="label is-small">Search</label>
                <div className="control has-icons-left">
                    <input
                        className="input is-small"
                        type="text"
                        placeholder="Search departments"
                        name="search"
                        value={filter.search}
                        onChange={handleFilterChange}
                    />
                    <span className="icon is-small is-left">
                        <i className="fas fa-search"></i>
                    </span>
                </div>
            </div>
        </aside>
    );
}
