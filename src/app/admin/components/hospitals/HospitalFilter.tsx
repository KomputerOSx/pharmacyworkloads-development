// // src/app/admin/components/hospitals/HospitalFilter.tsx
// import { useHospitals } from "@/context/HospitalContext";
//
// type FilterProps = {
//     filter: {
//         organization: string;
//         status: string;
//         search: string;
//     };
//     setFilter: React.Dispatch<
//         React.SetStateAction<{
//             organization: string;
//             status: string;
//             search: string;
//         }>
//     >;
// };
//
// export default function HospitalFilter({ filter, setFilter }: FilterProps) {
//     const { organizations } = useHospitals();
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
//                 <label className="label is-small">Organization</label>
//                 <div className="control">
//                     <div className="select is-small is-fullwidth">
//                         <select
//                             name="organization"
//                             value={filter.organization}
//                             onChange={handleFilterChange}
//                         >
//                             <option value="all">All Organizations</option>
//                             {organizations.map((org) => (
//                                 <option key={org.id} value={org.id}>
//                                     {org.name}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>
//                 </div>
//             </div>
//
//             <div className="field">
//                 <label className="label is-small">Status</label>
//                 <div className="control">
//                     <div className="select is-small is-fullwidth">
//                         <select
//                             name="status"
//                             value={filter.status}
//                             onChange={handleFilterChange}
//                         >
//                             <option value="all">All Status</option>
//                             <option value="active">Active</option>
//                             <option value="inactive">Inactive</option>
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
//                         placeholder="Search by name, city, or postcode"
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
