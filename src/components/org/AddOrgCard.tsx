"use client";

import * as React from "react";
import { useState } from "react";
import { toast } from "sonner"; // Import the toast function
import { Button } from "@/components/ui/button";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addOrganisation, getOrganisationTypes } from "@/services/orgService"; // Adjust the import path
import { Checkbox } from "@/components/ui/checkbox"; // Import Checkbox

interface FormData {
    name: string;
    type: string;
    contactEmail: string;
    contactPhone: string;
    active: boolean;
}

export default function AddOrgCard() {
    const [open, setOpen] = useState(false); // State for controlling the dialog
    const [formData, setFormData] = useState<FormData>({
        name: "",
        type: "",
        contactEmail: "",
        contactPhone: "",
        active: true,
    });
    const [loading, setLoading] = useState(false); // State for loading state
    const [error, setError] = useState<string | null>(null);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => {
        const target = e.target;
        const { name, value, type } = target;
        const checked = (target as HTMLInputElement).checked;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            if (!formData.name.trim()) {
                setError("Organisation name is required.");
                return;
            }
            await addOrganisation(formData); // Call your createOrg service with formData
            setOpen(false); // Close the dialog after successful creation
            setFormData({
                name: "",
                type: "",
                contactEmail: "",
                contactPhone: "",
                active: true,
            }); // Reset the form
            toast.success("Organisation created successfully!"); // Success toast
        } catch (err) {
            console.error("6vtJHW8N - Error creating organisation:", err);
            setError(
                //@ts-expect-error error type
                err.message ||
                    "ZYU6m1bF - Failed to create organisation. Please try again.",
            );

            toast.error(
                //@ts-expect-error error type
                err.message || "tV15Uh7X - Failed to create organisation.",
            ); // Error toast
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className={"justify-center"}>
                    Create Organisation
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Organisation</DialogTitle>
                    <DialogDescription>
                        Enter the details for your new organisation.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="col-span-3"
                            disabled={loading}
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">
                            Type
                        </Label>
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Orgnisation Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {getOrganisationTypes().map((type) => (
                                        <SelectItem
                                            key={type.id}
                                            value={type.name}
                                        >
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="contactEmail" className="">
                            Contact Email
                        </Label>
                        <Input
                            id="contactEmail"
                            name="contactEmail"
                            type="email"
                            value={formData.contactEmail}
                            onChange={handleChange}
                            className="col-span-3"
                            disabled={loading}
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="contactPhone">Contact Phone</Label>
                        <Input
                            id="contactPhone"
                            name="contactPhone"
                            type="tel" // Important: Set the input type to "tel" for phone validation
                            value={formData.contactPhone}
                            onChange={handleChange}
                            className="col-span-3"
                            disabled={loading}
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="active" className="text-right">
                            Active
                        </Label>
                        <Checkbox
                            id="active"
                            name="active"
                            checked={formData.active}
                            onCheckedChange={(checked) =>
                                setFormData({
                                    ...formData,
                                    active: !!checked,
                                })
                            } // Explicitly cast to boolean
                            disabled={loading}
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
                <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? "Creating..." : "Create"}
                </Button>
            </DialogContent>
        </Dialog>
    );
}
