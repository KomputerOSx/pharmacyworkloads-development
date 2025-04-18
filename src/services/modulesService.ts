// src/services/modulesService.ts

import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    DocumentData,
    documentId,
    DocumentReference,
    getDoc,
    getDocs,
    limit,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { Module, ModuleAccessLevel } from "@/types/moduleTypes";
import { deleteAssignmentsByModule } from "./depModulesAssService";
import { mapFirestoreDocToModule } from "@/lib/firestoreUtil";

const ModulesCollection = collection(db, "modules");

export async function createModule(
    moduleData: Omit<
        Partial<Module>,
        "id" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy"
    >,
    userId = "system",
): Promise<Module> {
    const moduleName = moduleData.name?.trim();
    const urlPath = moduleData.urlPath
        ?.trim()
        .toLowerCase()
        .replace(/\s+/g, "-"); // Basic slugify
    const displayName = moduleData.displayName?.trim() || moduleName; // Default display name

    // **Validation**
    if (!moduleName)
        throw new Error(`bN9mKlP6 - Internal module name cannot be empty.`);
    if (!displayName)
        throw new Error(`kL9dFgH5 - Display name cannot be empty.`);
    if (!urlPath) throw new Error(`mN3bVcX8 - URL Path cannot be empty.`);

    if (!/^[a-z0-9-]+$/.test(urlPath)) {
        throw new Error(
            "fG4hJkL3 - URL Path can only contain lowercase letters, numbers, and hyphens.",
        );
    }

    const validAccessLevels: ModuleAccessLevel[] = ["admin", "manager", "all"];
    const accessLevel =
        moduleData.accessLevel &&
        validAccessLevels.includes(moduleData.accessLevel)
            ? moduleData.accessLevel
            : "admin"; // Default access level

    try {
        // Check for duplicate internal name GLOBALLY
        const nameCheckQuery = query(
            ModulesCollection,
            where("name", "==", moduleName),
            limit(1),
        );
        const nameSnapshot = await getDocs(nameCheckQuery);
        if (!nameSnapshot.empty) {
            throw new Error(
                `DUPLICATE_MODULE_NAME_GLOBAL_1sWdE9 - A module with the internal name "${moduleName}" already exists.`,
            );
        }
        // Check for duplicate URL Path GLOBALLY
        const pathCheckQuery = query(
            ModulesCollection,
            where("urlPath", "==", urlPath),
            limit(1),
        );
        const pathSnapshot = await getDocs(pathCheckQuery);
        if (!pathSnapshot.empty) {
            throw new Error(
                `DUPLICATE_MODULE_URLPATH_xY9pLmN0 - A module with the URL Path "${urlPath}" already exists.`,
            );
        }

        const dataToAdd: DocumentData = {
            name: moduleName,
            displayName: displayName,
            description: moduleData.description?.trim() ?? null,
            urlPath: urlPath,
            icon: moduleData.icon?.trim() ?? null,
            accessLevel: accessLevel,
            active: moduleData.active ?? true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdBy: userId,
            updatedBy: userId,
        };

        const newDocRef: DocumentReference = await addDoc(
            ModulesCollection,
            dataToAdd,
        );
        const newModuleDoc = await getDoc(newDocRef);

        if (!newModuleDoc.exists()) {
            throw new Error(
                `cM3jKlP0 - Failed to retrieve newly created Module (Ref Path: ${newDocRef.path}) immediately after creation.`,
            );
        }

        const createdModule = mapFirestoreDocToModule(
            newModuleDoc.id,
            newModuleDoc.data(),
        );
        if (!createdModule) {
            throw new Error(
                `xK7lMnB3 - Failed to map newly created module data (ID: ${newModuleDoc.id}).`,
            );
        }

        console.log(`Module created successfully with ID: ${createdModule.id}`);
        return createdModule;
    } catch (error) {
        if (
            error instanceof Error &&
            error.message.startsWith("DUPLICATE_MODULE_NAME_GLOBAL")
        ) {
            console.warn(
                `vD4gHjL9 - Attempt to create duplicate Module (Name: "${moduleName}"):`,
                error.message,
            );
        } else {
            console.error(
                `fB2n MjK5 - Error during Module creation (Name: "${moduleName}"):`,
                error,
            );
        }
        throw error;
    }
}

export async function getModule(id: string): Promise<Module | null> {
    // No changes needed here, still fetches by unique ID
    if (!id) {
        console.error(`gH8jKlP3 - getModule error: Invalid ID provided.`);
        return null;
    }
    try {
        const docRef = doc(ModulesCollection, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return mapFirestoreDocToModule(docSnap.id, docSnap.data());
        } else {
            console.warn(`rT6yUiO0 - Module document with ID ${id} not found.`);
            return null;
        }
    } catch (error) {
        console.error(`zX9cVbN6 - Error fetching Module with ID ${id}:`, error);
        throw new Error(`Failed to retrieve Module data for ID: ${id}.`);
    }
}

export async function getAllModules(): Promise<Module[]> {
    try {
        // Query the entire collection, potentially add ordering
        const modulesQuery = query(ModulesCollection);
        const snapshot = await getDocs(modulesQuery);
        return snapshot.docs
            .map((doc) => mapFirestoreDocToModule(doc.id, doc.data()))
            .filter((m): m is Module => m !== null);
    } catch (error) {
        console.error(`kL0dFgH8 - Error getting all modules:`, error);
        throw error;
    }
}

export async function getModulesByIds(ids: string[]): Promise<Module[]> {
    // Handle cases with empty or invalid input
    if (!ids || ids.length === 0) {
        return [];
    }
    const batchSize = 30;
    const results: Module[] = [];
    const idChunks: string[][] = [];

    for (let i = 0; i < ids.length; i += batchSize) {
        idChunks.push(ids.slice(i, i + batchSize));
    }

    if (idChunks.length > 1) {
        console.warn(
            `bN9mKlP3 - Fetching modules in ${idChunks.length} batches due to Firestore 'in' query limit (${batchSize}). IDs count: ${ids.length}`,
        );
    }

    try {
        // Execute queries for each chunk in parallel
        const queryPromises = idChunks.map((chunk) => {
            const modulesQuery = query(
                ModulesCollection,
                where(documentId(), "in", chunk),
            );
            return getDocs(modulesQuery);
        });

        const querySnapshots = await Promise.all(queryPromises);

        // Process results from all snapshots
        querySnapshots.forEach((snapshot) => {
            snapshot.docs.forEach((doc) => {
                const appModule = mapFirestoreDocToModule(doc.id, doc.data());
                if (appModule) {
                    results.push(appModule);
                }
            });
        });

        const moduleMap = new Map(results.map((m) => [m.id, m]));
        return ids
            .map((id) => moduleMap.get(id))
            .filter((m): m is Module => m !== null);
    } catch (error) {
        console.error(
            `vD4gHjL1 - Error fetching modules by IDs chunk [${ids.slice(0, batchSize).join(", ")}, ...]:`, //
            error,
        );
        throw new Error("Failed to fetch module details by ID.");
    }
}
export async function updateModule(
    id: string,
    data: Omit<Partial<Module>, "id" | "createdAt" | "createdBy" | "name">, // Prevent changing 'name' via update? Or allow carefully? Let's disallow for now.
    userId = "system",
): Promise<Module> {
    if (!id) throw new Error(`mN1bVcX7 - Module ID required for update.`);

    // Prepare updates, trim strings
    const inputData = { ...data };
    if (typeof inputData.displayName === "string")
        inputData.displayName = inputData.displayName.trim();
    if (typeof inputData.description === "string")
        inputData.description = inputData.description.trim();
    if (typeof inputData.icon === "string")
        inputData.icon = inputData.icon.trim();
    if (typeof inputData.urlPath === "string")
        inputData.urlPath = inputData.urlPath
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-");

    // ** Validation **
    if (inputData.displayName === "")
        throw new Error(`pQ5zXcV2 - Display name cannot be empty.`);
    if (inputData.urlPath === "")
        throw new Error(`aZ3kLmN1 - URL Path cannot be empty.`);
    // Optional: Add regex validation for urlPath update
    if (inputData.urlPath && !/^[a-z0-9-]+$/.test(inputData.urlPath)) {
        throw new Error(
            "fG2hJkL7 - URL Path can only contain lowercase letters, numbers, and hyphens.",
        );
    }

    const validAccessLevels: ModuleAccessLevel[] = ["admin", "manager", "all"];
    if (
        inputData.accessLevel &&
        !validAccessLevels.includes(inputData.accessLevel)
    ) {
        console.warn(
            `sE4dRcV5 - Invalid access level '${inputData.accessLevel}' provided for update. Ignoring.`,
        );
        delete inputData.accessLevel; // Don't update with invalid value
    }

    try {
        const moduleRef = doc(ModulesCollection, id);
        const checkSnap = await getDoc(moduleRef);
        if (!checkSnap.exists()) throw new Error(/*...*/);
        const currentData = checkSnap.data();
        // const currentName = currentData?.name; // If allowing name changes
        const currentUrlPath = currentData?.urlPath;

        // Check for duplicate URL Path if it's changing
        if (inputData.urlPath && inputData.urlPath !== currentUrlPath) {
            const pathCheckQuery = query(
                ModulesCollection,
                where("urlPath", "==", inputData.urlPath),
                where(documentId(), "!=", id), // Exclude self
                limit(1),
            );
            const pathSnapshot = await getDocs(pathCheckQuery);
            if (!pathSnapshot.empty) {
                throw new Error(
                    `DUPLICATE_MODULE_URLPATH_UPDATE_qW8eRtY3 - Cannot update Module ${id}. URL Path "${inputData.urlPath}" already exists.`,
                );
            }
        }

        // Prepare final update data
        const dataToUpdate: DocumentData = {
            ...inputData,
            updatedAt: serverTimestamp(),
            updatedBy: userId,
        };
        Object.keys(dataToUpdate).forEach((key) => {
            // Clean undefined
            if (dataToUpdate[key] === undefined) delete dataToUpdate[key];
        });

        // Check if anything actually changed
        let hasChanged = false;
        for (const key in dataToUpdate) {
            if (
                key !== "updatedAt" &&
                key !== "updatedBy" &&
                dataToUpdate[key] !== currentData?.[key]
            ) {
                // Need careful comparison for optional fields (e.g., description null vs "")
                if (
                    (dataToUpdate[key] ?? null) !== (currentData?.[key] ?? null)
                ) {
                    hasChanged = true;
                    break;
                }
            }
        }

        if (!hasChanged) {
            console.log(
                `tY1uIopN - No changes detected for Module ${id}. Skipping update.`,
            );
            // Return current module data directly
            return mapFirestoreDocToModule(id, currentData)!;
        }

        // Perform update
        await updateDoc(moduleRef, dataToUpdate);

        const updatedModuleDoc = await getDoc(moduleRef);
        if (!updatedModuleDoc.exists()) {
            throw new Error(
                `fG2hJkL7 - Consistency error: Module ${id} not found after update call.`,
            );
        }
        const updatedModule = mapFirestoreDocToModule(
            updatedModuleDoc.id,
            updatedModuleDoc.data(),
        );
        if (!updatedModule) {
            throw new Error(
                `xY9pLmN8 - Failed to map updated module data for ID: ${id}.`,
            );
        }

        console.log(`Module ${id} updated successfully by user ${userId}.`);
        return updatedModule;
    } catch (error) {
        if (
            error instanceof Error &&
            error.message.startsWith("DUPLICATE_MODULE_NAME_UPDATE_GLOBAL")
        ) {
            console.warn(
                `sE4dRcV5 - Failed Update Module ${id}: ${error.message}`,
            );
        } else {
            console.error(
                `tY1uIopN - Generic error updating module with ID ${id}:`,
                error,
            );
        }
        throw error;
    }
}

export async function deleteModule(id: string): Promise<void> {
    if (!id)
        throw new Error(`vB7n MjK9 - deleteModule error: Module ID required.`);
    console.log(`dF5gHjL2 - Attempting to delete Module: ${id}`);

    const moduleRef = doc(ModulesCollection, id);

    try {
        const moduleSnap = await getDoc(moduleRef);
        if (!moduleSnap.exists()) {
            console.warn(
                `n M3jKlP0 - Module with ID ${id} not found. Skipping delete.`,
            );
            return;
        }

        // Delete associated Department-Module Assignments FIRST
        console.log(
            `gH9jKlP7 - Deleting associated department assignments for module ${id}...`,
        );
        await deleteAssignmentsByModule(id);
        console.log(
            `wE1rTyU8 - Successfully deleted assignments for module ${id}.`,
        );

        // Delete the Module document itself
        await deleteDoc(moduleRef);
        console.log(`zX9cVbN4 - Successfully deleted Module ${id}.`);
    } catch (error) {
        console.error(
            `aQ3sWdE0 - Error during deletion process for Module ID ${id}:`,
            error,
        );
        let reason = "Unknown error during module deletion.";
        if (error instanceof Error) reason = error.message;
        if (
            error instanceof Error &&
            error.message.includes("Failed to delete assignments")
        ) {
            throw new Error(
                `Assignment cleanup failed before deleting module ${id}. Reason: ${reason}`,
            );
        } else {
            throw new Error(`Failed to delete Module ${id}. Reason: ${reason}`);
        }
    }
}
