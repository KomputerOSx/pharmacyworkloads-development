"use client"; // <-- Make the page a Client Component

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { LoginForm } from "@/components/login-form";
import { LoadingSpinner } from "@/components/ui/loadingSpinner";

export default function LoginPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (user) {
                console.log(
                    "User is already logged in. Redirecting from /login to /main...",
                );
                router.replace("/main");
            }
        }
    }, [user, loading, router]);

    if (loading || user) {
        return <LoadingSpinner text="Loading " size={"xxlg"} />;
    }
    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <Suspense
                    fallback={
                        <LoadingSpinner
                            text="Loading login form..."
                            size={"xxlg"}
                        />
                    }
                >
                    <LoginForm />
                </Suspense>
            </div>
        </div>
    );
}
