// src/lib/errorUtils.ts

/**
 * Type guard to check if an error object is likely a Firebase Auth Error.
 * Firebase Auth errors typically have a string `code` property starting with "auth/".
 *
 * @param error The error object caught in a catch block (usually of type `unknown`).
 * @returns `true` if the error resembles a Firebase Auth Error, `false` otherwise.
 */
export function isFirebaseAuthError(
    error: unknown,
): error is { code: string; message: string } & Error {
    if (typeof error !== "object" || error === null) {
        return false;
    }
    if (!("code" in error) || !("message" in error)) {
        return false;
    }

    const potentialError = error as { code: unknown; message: unknown };

    if (
        typeof potentialError.code !== "string" ||
        typeof potentialError.message !== "string"
    ) {
        return false;
    }

    return potentialError.code.startsWith("auth/");
}
