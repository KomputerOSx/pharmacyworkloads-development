// src/types/subDepTypes.ts
import { Timestamp } from "firebase/firestore";

export type HospLoc = {
    id: string;
    name: string;
    type: string;
    hospId: string;
    orgId: string;
    description: string | null;
    address: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    color: string | null;
    active: boolean;
    isDeleted: boolean;
    createdAt: Timestamp | null;
    updatedAt: Timestamp | null;
    createdById: string;
    updatedById: string;
};

export const getHospLocTypes = () => {
    return [
        { id: "ward", name: "Ward" },
        { id: "clinic", name: "Clinic" },
        { id: "pharmacy", name: "Pharmacy" },
        { id: "supplies", name: "Supplies" },
        { id: "manufacturing", name: "Manufacturing" },
        { id: "other", name: "Other" },
    ];
};

export type DepTeam = {
    id: string;
    name: string;
    depId: string;
    orgId: string;
    description: string | null;
    active: boolean;
    createdAt: Timestamp | null;
    updatedAt: Timestamp | null;
    createdById: string;
    updatedById: string;
};

// export const shadcnColors = [
//     // {
//     //     id: "slate",
//     //     name: "Slate",
//     //     colorClasses: {
//     //         bg: "bg-slate-100",
//     //         border: "border-l-slate-400",
//     //         text: "text-slate-800",
//     //         swatchBg: "bg-slate-500",
//     //         darkBg: "dark:bg-slate-800",
//     //         darkBorder: "dark:border-l-slate-500",
//     //         darkText: "dark:text-slate-200",
//     //         darkSwatchBg: "dark:bg-slate-700",
//     //     },
//     // },
//     {
//         id: "gray",
//         name: "Gray",
//         colorClasses: {
//             bg: "bg-gray-100",
//             border: "border-l-gray-400",
//             text: "text-gray-800",
//             swatchBg: "bg-gray-500",
//             darkBg: "dark:bg-gray-800",
//             darkBorder: "dark:border-l-gray-500",
//             darkText: "dark:text-gray-200",
//             darkSwatchBg: "dark:bg-gray-700",
//         },
//     },
//     // {
//     //     id: "zinc",
//     //     name: "Zinc",
//     //     colorClasses: {
//     //         bg: "bg-zinc-100",
//     //         border: "border-l-zinc-400",
//     //         text: "text-zinc-800",
//     //         swatchBg: "bg-zinc-500",
//     //         darkBg: "dark:bg-zinc-800",
//     //         darkBorder: "dark:border-l-zinc-500",
//     //         darkText: "dark:text-zinc-200",
//     //         darkSwatchBg: "dark:bg-zinc-700",
//     //     },
//     // },
//     // {
//     //     id: "neutral",
//     //     name: "Neutral",
//     //     colorClasses: {
//     //         bg: "bg-neutral-100",
//     //         border: "border-l-neutral-400",
//     //         text: "text-neutral-800",
//     //         swatchBg: "bg-neutral-500",
//     //         darkBg: "dark:bg-neutral-800",
//     //         darkBorder: "dark:border-l-neutral-500",
//     //         darkText: "dark:text-neutral-200",
//     //         darkSwatchBg: "dark:bg-neutral-700",
//     //     },
//     // },
//     // {
//     //     id: "stone",
//     //     name: "Stone",
//     //     colorClasses: {
//     //         bg: "bg-stone-100",
//     //         border: "border-l-stone-400",
//     //         text: "text-stone-800",
//     //         swatchBg: "bg-stone-500",
//     //         darkBg: "dark:bg-stone-800",
//     //         darkBorder: "dark:border-l-stone-500",
//     //         darkText: "dark:text-stone-200",
//     //         darkSwatchBg: "dark:bg-stone-700",
//     //     },
//     // },
//     {
//         id: "red",
//         name: "Red",
//         colorClasses: {
//             bg: "bg-red-100",
//             border: "border-l-red-400",
//             text: "text-red-800",
//             swatchBg: "bg-red-500",
//             darkBg: "dark:bg-red-900",
//             darkBorder: "dark:border-l-red-600",
//             darkText: "dark:text-red-200",
//             darkSwatchBg: "dark:bg-red-700",
//         },
//     },
//     {
//         id: "orange",
//         name: "Orange",
//         colorClasses: {
//             bg: "bg-orange-100",
//             border: "border-l-orange-400",
//             text: "text-orange-800",
//             swatchBg: "bg-orange-500",
//             darkBg: "dark:bg-orange-900",
//             darkBorder: "dark:border-l-orange-600",
//             darkText: "dark:text-orange-200",
//             darkSwatchBg: "dark:bg-orange-700",
//         },
//     },
//     // {
//     //     id: "amber",
//     //     name: "Amber",
//     //     colorClasses: {
//     //         bg: "bg-amber-100",
//     //         border: "border-l-amber-400",
//     //         text: "text-amber-800",
//     //         swatchBg: "bg-amber-500",
//     //         darkBg: "dark:bg-amber-900",
//     //         darkBorder: "dark:border-l-amber-600",
//     //         darkText: "dark:text-amber-200",
//     //         darkSwatchBg: "dark:bg-amber-700",
//     //     },
//     // },
//     {
//         id: "yellow",
//         name: "Yellow",
//         colorClasses: {
//             bg: "bg-yellow-100",
//             border: "border-l-yellow-400",
//             text: "text-yellow-800",
//             swatchBg: "bg-yellow-500",
//             darkBg: "dark:bg-yellow-900",
//             darkBorder: "dark:border-l-yellow-600",
//             darkText: "dark:text-yellow-200",
//             darkSwatchBg: "dark:bg-yellow-700",
//         },
//     },
//     {
//         id: "lime",
//         name: "Lime",
//         colorClasses: {
//             bg: "bg-lime-100",
//             border: "border-l-lime-400",
//             text: "text-lime-800",
//             swatchBg: "bg-lime-500",
//             darkBg: "dark:bg-lime-900",
//             darkBorder: "dark:border-l-lime-600",
//             darkText: "dark:text-lime-200",
//             darkSwatchBg: "dark:bg-lime-700",
//         },
//     },
//     {
//         id: "green",
//         name: "Green",
//         colorClasses: {
//             bg: "bg-green-100",
//             border: "border-l-green-400",
//             text: "text-green-800",
//             swatchBg: "bg-green-500",
//             darkBg: "dark:bg-green-900",
//             darkBorder: "dark:border-l-green-600",
//             darkText: "dark:text-green-200",
//             darkSwatchBg: "dark:bg-green-700",
//         },
//     },
//     // {
//     //     id: "emerald",
//     //     name: "Emerald",
//     //     colorClasses: {
//     //         bg: "bg-emerald-100",
//     //         border: "border-l-emerald-400",
//     //         text: "text-emerald-800",
//     //         swatchBg: "bg-emerald-500",
//     //         darkBg: "dark:bg-emerald-900",
//     //         darkBorder: "dark:border-l-emerald-600",
//     //         darkText: "dark:text-emerald-200",
//     //         darkSwatchBg: "dark:bg-emerald-700",
//     //     },
//     // },
//     {
//         id: "teal",
//         name: "Teal",
//         colorClasses: {
//             bg: "bg-teal-100",
//             border: "border-l-teal-400",
//             text: "text-teal-800",
//             swatchBg: "bg-teal-500",
//             darkBg: "dark:bg-teal-900",
//             darkBorder: "dark:border-l-teal-600",
//             darkText: "dark:text-teal-200",
//             darkSwatchBg: "dark:bg-teal-700",
//         },
//     },
//     {
//         id: "cyan",
//         name: "Cyan",
//         colorClasses: {
//             bg: "bg-cyan-100",
//             border: "border-l-cyan-400",
//             text: "text-cyan-800",
//             swatchBg: "bg-cyan-500",
//             darkBg: "dark:bg-cyan-900",
//             darkBorder: "dark:border-l-cyan-600",
//             darkText: "dark:text-cyan-200",
//             darkSwatchBg: "dark:bg-cyan-700",
//         },
//     },
//     // {
//     //     id: "sky",
//     //     name: "Sky",
//     //     colorClasses: {
//     //         bg: "bg-sky-100",
//     //         border: "border-l-sky-400",
//     //         text: "text-sky-800",
//     //         swatchBg: "bg-sky-500",
//     //         darkBg: "dark:bg-sky-900",
//     //         darkBorder: "dark:border-l-sky-600",
//     //         darkText: "dark:text-sky-200",
//     //         darkSwatchBg: "dark:bg-sky-700",
//     //     },
//     // },
//     {
//         id: "blue",
//         name: "Blue",
//         colorClasses: {
//             bg: "bg-blue-100",
//             border: "border-l-blue-400",
//             text: "text-blue-800",
//             swatchBg: "bg-blue-500",
//             darkBg: "dark:bg-blue-900",
//             darkBorder: "dark:border-l-blue-600",
//             darkText: "dark:text-blue-200",
//             darkSwatchBg: "dark:bg-blue-700",
//         },
//     },
//     {
//         id: "indigo",
//         name: "Indigo",
//         colorClasses: {
//             bg: "bg-indigo-100",
//             border: "border-l-indigo-400",
//             text: "text-indigo-800",
//             swatchBg: "bg-indigo-500",
//             darkBg: "dark:bg-indigo-900",
//             darkBorder: "dark:border-l-indigo-600",
//             darkText: "dark:text-indigo-200",
//             darkSwatchBg: "dark:bg-indigo-700",
//         },
//     },
//     // {
//     //     id: "violet",
//     //     name: "Violet",
//     //     colorClasses: {
//     //         bg: "bg-violet-100",
//     //         border: "border-l-violet-400",
//     //         text: "text-violet-800",
//     //         swatchBg: "bg-violet-500",
//     //         darkBg: "dark:bg-violet-900",
//     //         darkBorder: "dark:border-l-violet-600",
//     //         darkText: "dark:text-violet-200",
//     //         darkSwatchBg: "dark:bg-violet-700",
//     //     },
//     // },
//     {
//         id: "purple",
//         name: "Purple",
//         colorClasses: {
//             bg: "bg-purple-100",
//             border: "border-l-purple-400",
//             text: "text-purple-800",
//             swatchBg: "bg-purple-500",
//             darkBg: "dark:bg-purple-900",
//             darkBorder: "dark:border-l-purple-600",
//             darkText: "dark:text-purple-200",
//             darkSwatchBg: "dark:bg-purple-700",
//         },
//     },
//     {
//         id: "fuchsia",
//         name: "Fuchsia",
//         colorClasses: {
//             bg: "bg-fuchsia-100",
//             border: "border-l-fuchsia-400",
//             text: "text-fuchsia-800",
//             swatchBg: "bg-fuchsia-500",
//             darkBg: "dark:bg-fuchsia-900",
//             darkBorder: "dark:border-l-fuchsia-600",
//             darkText: "dark:text-fuchsia-200",
//             darkSwatchBg: "dark:bg-fuchsia-700",
//         },
//     },
//     {
//         id: "pink",
//         name: "Pink",
//         colorClasses: {
//             bg: "bg-pink-100",
//             border: "border-l-pink-400",
//             text: "text-pink-800",
//             swatchBg: "bg-pink-500",
//             darkBg: "dark:bg-pink-900",
//             darkBorder: "dark:border-l-pink-600",
//             darkText: "dark:text-pink-200",
//             darkSwatchBg: "dark:bg-pink-700",
//         },
//     },
//     {
//         id: "rose",
//         name: "Rose",
//         colorClasses: {
//             bg: "bg-rose-100",
//             border: "border-l-rose-400",
//             text: "text-rose-800",
//             swatchBg: "bg-rose-500",
//             darkBg: "dark:bg-rose-900",
//             darkBorder: "dark:border-l-rose-600",
//             darkText: "dark:text-rose-200",
//             darkSwatchBg: "dark:bg-rose-700",
//         },
//     },
// ];

export const shadcnColors = [
    // {
    //     id: "slate",
    //     name: "Slate",
    //     colorClasses: {
    //         bg: "bg-slate-100",
    //         border: "border-l-slate-400",
    //         text: "text-slate-800",
    //         swatchBg: "bg-slate-500",
    //         darkBg: "dark:bg-slate-800",
    //         darkBorder: "dark:border-l-slate-500",
    //         darkText: "dark:text-slate-200",
    //         darkSwatchBg: "dark:bg-slate-700",
    //         excelFillArgb: "FFE5E7EB", // Example: Light Slate Gray ARGB
    //         pdfFillHex: "#E5E7EB",     // Example: Light Slate Gray Hex
    //     },
    // },
    {
        id: "gray",
        name: "Gray",
        colorClasses: {
            bg: "bg-gray-100",
            border: "border-l-gray-400",
            text: "text-gray-800",
            swatchBg: "bg-gray-500",
            darkBg: "dark:bg-gray-800",
            darkBorder: "dark:border-l-gray-500",
            darkText: "dark:text-gray-200",
            darkSwatchBg: "dark:bg-gray-700",
            excelFillArgb: "FFF3F4F6", // Light Gray ARGB (Tailwind gray-100)
            pdfFillHex: "#F3F4F6", // Light Gray Hex
        },
    },
    // {
    //     id: "zinc",
    //     name: "Zinc",
    //     colorClasses: {
    //         bg: "bg-zinc-100",
    //         border: "border-l-zinc-400",
    //         text: "text-zinc-800",
    //         swatchBg: "bg-zinc-500",
    //         darkBg: "dark:bg-zinc-800",
    //         darkBorder: "dark:border-l-zinc-500",
    //         darkText: "dark:text-zinc-200",
    //         darkSwatchBg: "dark:bg-zinc-700",
    //         excelFillArgb: "FFF4F4F5", // Light Zinc ARGB
    //         pdfFillHex: "#F4F4F5",     // Light Zinc Hex
    //     },
    // },
    // {
    //     id: "neutral",
    //     name: "Neutral",
    //     colorClasses: {
    //         bg: "bg-neutral-100",
    //         border: "border-l-neutral-400",
    //         text: "text-neutral-800",
    //         swatchBg: "bg-neutral-500",
    //         darkBg: "dark:bg-neutral-800",
    //         darkBorder: "dark:border-l-neutral-500",
    //         darkText: "dark:text-neutral-200",
    //         darkSwatchBg: "dark:bg-neutral-700",
    //         excelFillArgb: "FFF5F5F5", // Light Neutral ARGB
    //         pdfFillHex: "#F5F5F5",     // Light Neutral Hex
    //     },
    // },
    // {
    //     id: "stone",
    //     name: "Stone",
    //     colorClasses: {
    //         bg: "bg-stone-100",
    //         border: "border-l-stone-400",
    //         text: "text-stone-800",
    //         swatchBg: "bg-stone-500",
    //         darkBg: "dark:bg-stone-800",
    //         darkBorder: "dark:border-l-stone-500",
    //         darkText: "dark:text-stone-200",
    //         darkSwatchBg: "dark:bg-stone-700",
    //         excelFillArgb: "FFF5F5F4", // Light Stone ARGB
    //         pdfFillHex: "#F5F5F4",     // Light Stone Hex
    //     },
    // },
    {
        id: "red",
        name: "Red",
        colorClasses: {
            bg: "bg-red-100",
            border: "border-l-red-400",
            text: "text-red-800",
            swatchBg: "bg-red-500",
            darkBg: "dark:bg-red-900",
            darkBorder: "dark:border-l-red-600",
            darkText: "dark:text-red-200",
            darkSwatchBg: "dark:bg-red-700",
            excelFillArgb: "FFFEE2E2", // Light Red ARGB (Tailwind red-100)
            pdfFillHex: "#FEE2E2", // Light Red Hex
        },
    },
    {
        id: "orange",
        name: "Orange",
        colorClasses: {
            bg: "bg-orange-100",
            border: "border-l-orange-400",
            text: "text-orange-800",
            swatchBg: "bg-orange-500",
            darkBg: "dark:bg-orange-900",
            darkBorder: "dark:border-l-orange-600",
            darkText: "dark:text-orange-200",
            darkSwatchBg: "dark:bg-orange-700",
            excelFillArgb: "FFFFF7ED", // Light Orange ARGB (Tailwind orange-100)
            pdfFillHex: "#FFF7ED", // Light Orange Hex
        },
    },
    // {
    //     id: "amber",
    //     name: "Amber",
    //     colorClasses: {
    //         bg: "bg-amber-100",
    //         border: "border-l-amber-400",
    //         text: "text-amber-800",
    //         swatchBg: "bg-amber-500",
    //         darkBg: "dark:bg-amber-900",
    //         darkBorder: "dark:border-l-amber-600",
    //         darkText: "dark:text-amber-200",
    //         darkSwatchBg: "dark:bg-amber-700",
    //         excelFillArgb: "FFFFFBEB", // Light Amber ARGB
    //         pdfFillHex: "#FFFBEB",     // Light Amber Hex
    //     },
    // },
    {
        id: "yellow",
        name: "Yellow",
        colorClasses: {
            bg: "bg-yellow-100",
            border: "border-l-yellow-400",
            text: "text-yellow-800",
            swatchBg: "bg-yellow-500",
            darkBg: "dark:bg-yellow-900",
            darkBorder: "dark:border-l-yellow-600",
            darkText: "dark:text-yellow-200",
            darkSwatchBg: "dark:bg-yellow-700",
            excelFillArgb: "FFFFFDE4", // Light Yellow ARGB (Tailwind yellow-100)
            pdfFillHex: "#FEFDE8", // Slightly different Hex for better PDF look maybe
        },
    },
    {
        id: "lime",
        name: "Lime",
        colorClasses: {
            bg: "bg-lime-100",
            border: "border-l-lime-400",
            text: "text-lime-800",
            swatchBg: "bg-lime-500",
            darkBg: "dark:bg-lime-900",
            darkBorder: "dark:border-l-lime-600",
            darkText: "dark:text-lime-200",
            darkSwatchBg: "dark:bg-lime-700",
            excelFillArgb: "FFF7FEE7", // Light Lime ARGB (Tailwind lime-100)
            pdfFillHex: "#F7FEE7", // Light Lime Hex
        },
    },
    {
        id: "green",
        name: "Green",
        colorClasses: {
            bg: "bg-green-100",
            border: "border-l-green-400",
            text: "text-green-800",
            swatchBg: "bg-green-500",
            darkBg: "dark:bg-green-900",
            darkBorder: "dark:border-l-green-600",
            darkText: "dark:text-green-200",
            darkSwatchBg: "dark:bg-green-700",
            excelFillArgb: "FFDCFCE7", // Light Green ARGB (Tailwind green-100)
            pdfFillHex: "#DCFCE7", // Light Green Hex
        },
    },
    // {
    //     id: "emerald",
    //     name: "Emerald",
    //     colorClasses: {
    //         bg: "bg-emerald-100",
    //         border: "border-l-emerald-400",
    //         text: "text-emerald-800",
    //         swatchBg: "bg-emerald-500",
    //         darkBg: "dark:bg-emerald-900",
    //         darkBorder: "dark:border-l-emerald-600",
    //         darkText: "dark:text-emerald-200",
    //         darkSwatchBg: "dark:bg-emerald-700",
    //         excelFillArgb: "FFD1FAE5", // Light Emerald ARGB
    //         pdfFillHex: "#D1FAE5",     // Light Emerald Hex
    //     },
    // },
    {
        id: "teal",
        name: "Teal",
        colorClasses: {
            bg: "bg-teal-100",
            border: "border-l-teal-400",
            text: "text-teal-800",
            swatchBg: "bg-teal-500",
            darkBg: "dark:bg-teal-900",
            darkBorder: "dark:border-l-teal-600",
            darkText: "dark:text-teal-200",
            darkSwatchBg: "dark:bg-teal-700",
            excelFillArgb: "FFCCFBF1", // Light Teal ARGB (Tailwind teal-100)
            pdfFillHex: "#CCFBF1", // Light Teal Hex
        },
    },
    {
        id: "cyan",
        name: "Cyan",
        colorClasses: {
            bg: "bg-cyan-100",
            border: "border-l-cyan-400",
            text: "text-cyan-800",
            swatchBg: "bg-cyan-500",
            darkBg: "dark:bg-cyan-900",
            darkBorder: "dark:border-l-cyan-600",
            darkText: "dark:text-cyan-200",
            darkSwatchBg: "dark:bg-cyan-700",
            excelFillArgb: "FFCFFAFE", // Light Cyan ARGB (Tailwind cyan-100)
            pdfFillHex: "#CFFAFE", // Light Cyan Hex
        },
    },
    // {
    //     id: "sky",
    //     name: "Sky",
    //     colorClasses: {
    //         bg: "bg-sky-100",
    //         border: "border-l-sky-400",
    //         text: "text-sky-800",
    //         swatchBg: "bg-sky-500",
    //         darkBg: "dark:bg-sky-900",
    //         darkBorder: "dark:border-l-sky-600",
    //         darkText: "dark:text-sky-200",
    //         darkSwatchBg: "dark:bg-sky-700",
    //         excelFillArgb: "FFE0F2FE", // Light Sky ARGB
    //         pdfFillHex: "#E0F2FE",     // Light Sky Hex
    //     },
    // },
    {
        id: "blue",
        name: "Blue",
        colorClasses: {
            bg: "bg-blue-100",
            border: "border-l-blue-400",
            text: "text-blue-800",
            swatchBg: "bg-blue-500",
            darkBg: "dark:bg-blue-900",
            darkBorder: "dark:border-l-blue-600",
            darkText: "dark:text-blue-200",
            darkSwatchBg: "dark:bg-blue-700",
            excelFillArgb: "FFDBEAFE", // Light Blue ARGB (Tailwind blue-100)
            pdfFillHex: "#DBEAFE", // Light Blue Hex
        },
    },
    {
        id: "indigo",
        name: "Indigo",
        colorClasses: {
            bg: "bg-indigo-100",
            border: "border-l-indigo-400",
            text: "text-indigo-800",
            swatchBg: "bg-indigo-500",
            darkBg: "dark:bg-indigo-900",
            darkBorder: "dark:border-l-indigo-600",
            darkText: "dark:text-indigo-200",
            darkSwatchBg: "dark:bg-indigo-700",
            excelFillArgb: "FFE0E7FF", // Light Indigo ARGB (Tailwind indigo-100)
            pdfFillHex: "#E0E7FF", // Light Indigo Hex
        },
    },
    // {
    //     id: "violet",
    //     name: "Violet",
    //     colorClasses: {
    //         bg: "bg-violet-100",
    //         border: "border-l-violet-400",
    //         text: "text-violet-800",
    //         swatchBg: "bg-violet-500",
    //         darkBg: "dark:bg-violet-900",
    //         darkBorder: "dark:border-l-violet-600",
    //         darkText: "dark:text-violet-200",
    //         darkSwatchBg: "dark:bg-violet-700",
    //         excelFillArgb: "FFEEF2FF", // Light Violet ARGB
    //         pdfFillHex: "#EEF2FF",     // Light Violet Hex
    //     },
    // },
    {
        id: "purple",
        name: "Purple",
        colorClasses: {
            bg: "bg-purple-100",
            border: "border-l-purple-400",
            text: "text-purple-800",
            swatchBg: "bg-purple-500",
            darkBg: "dark:bg-purple-900",
            darkBorder: "dark:border-l-purple-600",
            darkText: "dark:text-purple-200",
            darkSwatchBg: "dark:bg-purple-700",
            excelFillArgb: "FFF3E8FF", // Light Purple ARGB (Tailwind purple-100)
            pdfFillHex: "#F3E8FF", // Light Purple Hex
        },
    },
    {
        id: "fuchsia",
        name: "Fuchsia",
        colorClasses: {
            bg: "bg-fuchsia-100",
            border: "border-l-fuchsia-400",
            text: "text-fuchsia-800",
            swatchBg: "bg-fuchsia-500",
            darkBg: "dark:bg-fuchsia-900",
            darkBorder: "dark:border-l-fuchsia-600",
            darkText: "dark:text-fuchsia-200",
            darkSwatchBg: "dark:bg-fuchsia-700",
            excelFillArgb: "FFFCE7F3", // Light Fuchsia ARGB (Tailwind fuchsia-100)
            pdfFillHex: "#FCE7F3", // Light Fuchsia Hex
        },
    },
    {
        id: "pink",
        name: "Pink",
        colorClasses: {
            bg: "bg-pink-100",
            border: "border-l-pink-400",
            text: "text-pink-800",
            swatchBg: "bg-pink-500",
            darkBg: "dark:bg-pink-900",
            darkBorder: "dark:border-l-pink-600",
            darkText: "dark:text-pink-200",
            darkSwatchBg: "dark:bg-pink-700",
            excelFillArgb: "FFFCE7F3", // Light Pink ARGB (Tailwind pink-100 - same as fuchsia-100)
            pdfFillHex: "#FCE7F3", // Light Pink Hex
        },
    },
    {
        id: "rose",
        name: "Rose",
        colorClasses: {
            bg: "bg-rose-100",
            border: "border-l-rose-400",
            text: "text-rose-800",
            swatchBg: "bg-rose-500",
            darkBg: "dark:bg-rose-900",
            darkBorder: "dark:border-l-rose-600",
            darkText: "dark:text-rose-200",
            darkSwatchBg: "dark:bg-rose-700",
            excelFillArgb: "FFFFF1F2", // Light Rose ARGB (Tailwind rose-100)
            pdfFillHex: "#FFF1F2", // Light Rose Hex
        },
    },
];
