// "use client";
//
// import "@/styles/console/hospConsole.css";
// import React, { useState } from "react";
// import { LoadingSpinner } from "@/components/ui/loadingSpinner";
//
// import { HospCard } from "@/components/hosp/HospCard";
// import { useParams } from "next/navigation";
// import {
//     Dialog,
//     DialogContent,
//     DialogDescription,
//     DialogHeader,
//     DialogTitle,
//     DialogTrigger,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { AddHospForm } from "@/components/hosp/AddHospForm";
// import { useHosps } from "@/hooks/useHosps";
//
// export default function HospitalsPage() {
//     const params = useParams();
//     const orgId = params.orgId as string;
//     const { hosps, isLoading, error, refetchHosps } = useHospContext();
//     const { hosps, isLoading, error, refetchHosps } = useHosps(orgId);
//     const [open, setOpen] = useState(false);
//
//     console.log(orgId);
//
//     if (isLoading) {
//         return (
//             <LoadingSpinner
//                 className={"flex items-center justify-center h-screen"}
//                 text={"Loading Hospitals..."}
//                 size={"xxlg"}
//             />
//         );
//     }
//
//     if (error) {
//         return <div>7v3adTdJ - Error loading hospital: {error.message}</div>;
//     }
//
//     return (
//         <>
//             <div className={"container"}>
//                 <Dialog open={open} onOpenChange={setOpen}>
//                     <DialogTrigger asChild>
//                         <Button>Create Hospital</Button>
//                     </DialogTrigger>
//                     <DialogContent>
//                         <DialogHeader>
//                             <DialogTitle>Create Hospital</DialogTitle>
//                             <DialogDescription>
//                                 Enter the details for your new hospital.
//                             </DialogDescription>
//                         </DialogHeader>
//                         <AddHospForm onOpenChange={setOpen} orgId={orgId} />
//                     </DialogContent>
//                 </Dialog>
//
//                 <Button
//                     className={" container w-[150px]"}
//                     onClick={refetchHosps}
//                     variant={"outline"}
//                 >
//                     Refresh
//                 </Button>
//
//                 <div className={"card-list"}>
//                     <div className={"card"}></div>
//
//                     {hosps.map((hosp) => (
//                         <div key={hosp.id} className={"card"}>
//                             <HospCard key={hosp.id} hosp={hosp} />
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </>
//     );
// }

"use client";

import "@/styles/console/hospConsole.css";
import React, { useState } from "react";
import { LoadingSpinner } from "@/components/ui/loadingSpinner";
import { HospCard } from "@/components/hosp/HospCard";
import { useParams } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AddHospForm } from "@/components/hosp/AddHospForm";
import { useHosps } from "@/hooks/useHosps"; // Import the React Query hook

export default function HospitalsPage() {
    const params = useParams();
    const orgId = params.orgId as string; // Extract orgId from route params
    const [open, setOpen] = useState(false); // State for the Add Hospital Dialog

    // Use the React Query hook to fetch hospitals for the current organisation
    // It replaces the useContext call
    const {
        data: hosps,
        isLoading,
        error,
        refetch: refetchHosps,
    } = useHosps(orgId);

    // console.log(orgId);

    if (isLoading) {
        return (
            <LoadingSpinner
                className={"flex items-center justify-center h-screen"}
                text={"Loading Hospitals..."}
                size={"xxlg"}
            />
        );
    }

    if (error) {
        console.error("7v3adTdJ - Error loading hospitals:", error);
        return <div>Error loading hospitals: {error.message}</div>;
    }

    return (
        <>
            <div className={"container"}>
                {/* Dialog for Creating a New Hospital */}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>Create Hospital</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Hospital</DialogTitle>
                            <DialogDescription>
                                Enter the details for your new hospital.
                            </DialogDescription>
                        </DialogHeader>
                        <AddHospForm onOpenChange={setOpen} orgId={orgId} />
                    </DialogContent>
                </Dialog>

                {/* Refresh Button */}
                <Button
                    className={" container w-[150px] ml-4"}
                    onClick={() => refetchHosps()}
                    variant={"outline"}
                >
                    Refresh
                </Button>

                <div className={"card-list mt-6"}>
                    {" "}
                    {(hosps ?? []).map((hosp) => (
                        <div key={hosp.id} className={"card"}>
                            <HospCard hosp={hosp} />
                        </div>
                    ))}
                    {!isLoading && hosps && hosps.length === 0 && (
                        <p className="text-center text-gray-500 col-span-full mt-4">
                            No hospitals found for this organisation.
                        </p>
                    )}
                </div>
            </div>
        </>
    );
}
