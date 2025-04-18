"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import type { UrgentQuery } from "./types/workload";

interface UrgentQueriesColumnProps {
    locationId: string;
    dateId: string;
    urgentQueries: UrgentQuery[];
    onAddUrgentQuery: (
        locationId: string,
        query: Omit<UrgentQuery, "id">,
    ) => void;
    onUpdateUrgentQuery: (
        locationId: string,
        queryId: string,
        data: Partial<UrgentQuery>,
    ) => void;
}

export function UrgentQueriesColumn({
    locationId,
    dateId,
    urgentQueries,
    onAddUrgentQuery,
}: UrgentQueriesColumnProps) {
    // Filter queries for the current date
    const dayQueries = urgentQueries.filter((query) => query.date === dateId);
    const [count, setCount] = useState<number>(dayQueries.length || 0);

    // Update count when date or queries change
    useEffect(() => {
        const filteredQueries = urgentQueries.filter(
            (query) => query.date === dateId,
        );
        setCount(filteredQueries.length);
    }, [dateId, urgentQueries]);

    const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newCount = Number.parseInt(e.target.value, 10) || 0;
        setCount(newCount);

        // If the count increased, add dummy urgent queries
        if (newCount > dayQueries.length) {
            const queriesToAdd = newCount - dayQueries.length;
            for (let i = 0; i < queriesToAdd; i++) {
                onAddUrgentQuery(locationId, {
                    query: "Urgent query",
                    status: "open",
                    timeSubmitted: new Date().toISOString(),
                    date: dateId, // Add the date to associate with this day
                });
            }
        }
        // Note: We don't handle decreasing the count as that would require
        // deciding which queries to remove, which is complex without user input
    };

    return (
        <Input
            id={`uq-${locationId}-${dateId}`}
            type="number"
            min="0"
            value={count}
            onChange={handleCountChange}
            className="h-8"
        />
    );
}
