import { shadcnColors } from "@/types/subDepTypes";

export function getColorObject(
    colorId: string | null | undefined,
): (typeof shadcnColors)[number] | undefined {
    // `(typeof shadcnColors)[number]` means "the type of an element within the shadcnColors array"
    if (!colorId) {
        return undefined; // Return undefined if the input ID is null, undefined, or empty
    }
    return shadcnColors.find((color) => color.id === colorId);
}

export function getColorObjectWithDefault(
    colorId: string | null | undefined,
): (typeof shadcnColors)[number] {
    const foundColor = getColorObject(colorId);
    if (foundColor) {
        return foundColor;
    }
    // Fallback to gray if the specific ID isn't found or input is invalid
    // Ensure 'gray' exists in your array, otherwise, this might fail.
    const grayColor = shadcnColors.find((color) => color.id === "gray");

    // As a final safety net, if even gray isn't found (which indicates an issue with the array), return the first item.
    return grayColor || shadcnColors[0];
}
