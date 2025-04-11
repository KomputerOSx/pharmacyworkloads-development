"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Home } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
    const [position, setPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // Calculate mouse position relative to the center of the screen
            const x = (e.clientX / window.innerWidth - 0.5) * 20;
            const y = (e.clientY / window.innerHeight - 0.5) * 20;
            setPosition({ x, y });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4 text-center">
            <div
                className="relative mb-8 text-[180px] font-bold leading-none tracking-tighter text-gray-900 md:text-[250px]"
                style={{
                    transform: `translate(${position.x}px, ${position.y}px)`,
                    textShadow: `
            ${-position.x * 0.5}px ${-position.y * 0.5}px 0px rgba(0,0,0,0.1),
            ${position.x * 0.7}px ${position.y * 0.7}px 0px rgba(0,0,0,0.05)
          `,
                }}
            >
                404
            </div>

            <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
                Page not found
            </h1>

            <p className="mb-8 max-w-md text-gray-600">
                Sorry, we couldn&#39;t find the page you&#39;re looking for. It
                might have been moved, deleted, or never existed in the first
                place.
            </p>

            <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
                <Button asChild size="lg">
                    <Link href="/">
                        <Home className="mr-2 h-4 w-4" />
                        Back to home
                    </Link>
                </Button>
                <Button
                    variant="outline"
                    size="lg"
                    onClick={() => window.history.back()}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Go back
                </Button>
            </div>

            <div
                className="absolute inset-0 -z-10 overflow-hidden"
                aria-hidden="true"
            >
                {Array.from({ length: 40 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-gray-200"
                        style={{
                            width: `${Math.random() * 10 + 5}px`,
                            height: `${Math.random() * 10 + 5}px`,
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            opacity: Math.random() * 0.5 + 0.1,
                            animation: `float ${Math.random() * 10 + 10}s linear infinite`,
                            animationDelay: `${Math.random() * 5}s`,
                        }}
                    />
                ))}
            </div>

            <style jsx global>{`
                @keyframes float {
                    0% {
                        transform: translateY(0) rotate(0deg);
                    }
                    50% {
                        transform: translateY(-20px) rotate(180deg);
                    }
                    100% {
                        transform: translateY(0) rotate(360deg);
                    }
                }
            `}</style>
        </div>
    );
}
