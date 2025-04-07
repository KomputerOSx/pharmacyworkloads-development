// src/components/Redirector.tsx
"use client"; // If using useRouter

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface RedirectorProps {
    to: string;
}

export function Redirector({ to }: RedirectorProps) {
    const router = useRouter();

    // This useEffect is called UNCONDITIONALLY *within this component*
    useEffect(() => {
        console.log(`Redirecting to: ${to}`); // For debugging
        router.replace(to);
    }, [to, router]); // Depend on 'to' and 'router'

    // This component doesn't render anything visible while redirecting
    return null;
}
