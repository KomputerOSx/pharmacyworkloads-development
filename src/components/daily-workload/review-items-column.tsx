"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import type { ReviewItem } from "./types/workload";

interface ReviewItemsColumnProps {
    locationId: string;
    dateId: string;
    reviewItems: ReviewItem[];
    onAddReviewItem: (locationId: string, item: Omit<ReviewItem, "id">) => void;
    onUpdateReviewItem: (
        locationId: string,
        itemId: string,
        data: Partial<ReviewItem>,
    ) => void;
}

export function ReviewItemsColumn({
    locationId,
    dateId,
    reviewItems,
    onAddReviewItem,
}: ReviewItemsColumnProps) {
    // We need to track items per day, so we'll add a date property to the items
    // For now, we'll filter based on the dateId if it exists in the item
    const dayReviewItems = reviewItems.filter((item) => item.date === dateId);
    const [count, setCount] = useState<number>(dayReviewItems.length || 0);

    // Update count when date or items change
    useEffect(() => {
        const filteredItems = reviewItems.filter(
            (item) => item.date === dateId,
        );
        setCount(filteredItems.length);
    }, [dateId, reviewItems]);

    const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newCount = Number.parseInt(e.target.value, 10) || 0;
        setCount(newCount);

        // If the count increased, add dummy review items
        if (newCount > dayReviewItems.length) {
            const itemsToAdd = newCount - dayReviewItems.length;
            for (let i = 0; i < itemsToAdd; i++) {
                onAddReviewItem(locationId, {
                    title: "Review item",
                    description: "",
                    priority: "medium",
                    status: "pending",
                    date: dateId, // Add the date to associate with this day
                });
            }
        }
        // Note: We don't handle decreasing the count as that would require
        // deciding which items to remove, which is complex without user input
    };

    return (
        <Input
            id={`review-${locationId}-${dateId}`}
            type="number"
            min="0"
            value={count}
            onChange={handleCountChange}
            className="h-8"
        />
    );
}
