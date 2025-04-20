"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { LoadingSpinner } from "@/components/ui/loadingSpinner";
import { canUserLogin } from "@/lib/helper/canUserLogin";

export default function ProtectedLayoutComponent({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);
    const [isEligible, setIsEligible] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAuthAndEligibility = async () => {
            if (loading) {
                return;
            }

            if (!user) {
                console.log(
                    `Protected route (${pathname}): No user found, redirecting to login.`,
                );
                router.replace(
                    `/login?redirect=${encodeURIComponent(pathname)}`,
                );
                setIsEligible(false);
                return;
            }

            setIsCheckingEligibility(true);
            setIsEligible(null);
            try {
                const canLogin = await canUserLogin(user.uid);

                if (!canLogin) {
                    console.error(
                        "Eligibility check failed: User cannot log in (Org/Dept inactive or error). Logging out.",
                    );
                    setIsEligible(false);
                    await logout();
                    // No explicit redirect needed here, the component will re-render
                    // due to user becoming null and trigger the !user condition above
                    // on the next render cycle, or show the redirect spinner below.
                } else {
                    setIsEligible(true);
                }
            } catch (error) {
                console.error("Error during eligibility check:", error);
                setIsEligible(false);
                await logout();
                // Optionally redirect immediately after error + logout
                router.replace("/login?reason=check_error");
            } finally {
                setIsCheckingEligibility(false);
            }
        };

        void checkAuthAndEligibility();
    }, [user, loading, router, pathname, logout]);

    if (loading || isCheckingEligibility) {
        return (
            <LoadingSpinner
                className={"flex items-center justify-center h-screen"}
                text={loading ? "Authenticating..." : "Verifying access..."}
                size={"xxlg"}
            />
        );
    }

    if (!loading && user && isEligible === true) {
        return <>{children}</>;
    }

    return <LoadingSpinner text="Processing..." />;
}
