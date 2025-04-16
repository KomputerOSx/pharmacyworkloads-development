// // src/services/modulesService.ts
//
// import {
//     addDoc,
//     collection,
//     deleteDoc,
//     doc,
//     DocumentData,
//     documentId,
//     DocumentReference,
//     getDoc,
//     getDocs,
//     limit,
//     orderBy,
//     query,
//     serverTimestamp,
//     updateDoc,
//     where,
// } from "firebase/firestore";
// import { db } from "@/config/firebase";
// import { Module } from "@/types/moduleTypes";
// import { deleteAssignmentsByModule } from "./depModulesAssService";
// import { mapFirestoreDocToModule } from "@/lib/firestoreUtil";
//
// const ModulesCollection = collection(db, "modules");
//
// export async function createModule(
//     moduleData: Omit<
//         Partial<Module>,
//         "id" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy"
//     >,
//     userId = "system",
// ): Promise<Module> {
//     const moduleName = moduleData.name?.trim();
//     if (!moduleName) {
//         throw new Error(`GTP4xam6 - Module name cannot be empty.`);
//     }
//
//     try {
//         const duplicateCheckQuery = query(
//             ModulesCollection,
//             where("name", "==", moduleName),
//             limit(1),
//         );
//         const querySnapshot = await getDocs(duplicateCheckQuery);
//         if (!querySnapshot.empty) {
//             throw new Error(
//                 `3dmCQMUY - A module with the name "${moduleName}" already exists.`,
//             );
//         }
//
//         const dataToAdd: DocumentData = {
//             ...moduleData,
//             name: moduleName,
//             createdAt: serverTimestamp(),
//             updatedAt: serverTimestamp(),
//             createdBy: userId,
//             updatedBy: userId,
//             active: moduleData.active ?? true, // Default to active if not provided
//         };
//
//         const newDocRef: DocumentReference = await addDoc(
//             ModulesCollection,
//             dataToAdd,
//         );
//         const newModuleDoc = await getDoc(newDocRef);
//
//         if (!newModuleDoc.exists()) {
//             throw new Error(
//                 `zm7vfQfj - Failed to retrieve newly created Module (Ref Path: ${newDocRef.path}) immediately after creation.`,
//             );
//         }
//
//         const createdModule = mapFirestoreDocToModule(
//             newModuleDoc.id,
//             newModuleDoc.data(),
//         );
//         if (!createdModule) {
//             throw new Error(
//                 `mQhcLJA9 - Failed to map newly created module data (ID: ${newModuleDoc.id}).`,
//             );
//         }
//
//         console.log(`Module created successfully with ID: ${createdModule.id}`);
//         return createdModule;
//     } catch (error) {
//         if (
//             error instanceof Error &&
//             error.message.startsWith("DUPLICATE_MODULE_NAME")
//         ) {
//             console.warn(
//                 `Mu8K8w2k - Attempt to create duplicate Module "${moduleName}"):`,
//                 error.message,
//             );
//         } else {
//             console.error(
//                 `Z6DEH4rg - Error during Module creation "${moduleName}"):`,
//                 error,
//             );
//         }
//         throw error; // Re-throw original or wrapped error
//     }
// }
//
// export const getModules = async (): Promise<Module[]> => {
//     try {
//         const modules: Module[] = [];
//         const q = query(ModulesCollection, orderBy("name"));
//         const querySnapshot = await getDocs(q);
//
//         querySnapshot.forEach((doc) => {
//             const data = doc.data();
//             const appModules = mapFirestoreDocToModule(doc.id, data);
//
//             if (appModules) {
//                 modules.push(appModules);
//             } else {
//                 console.warn(
//                     `KYss1QW3 - Document ${doc.id} skipped during getOrgs mapping.`,
//                 );
//             }
//         });
//
//         return modules;
//     } catch (error) {
//         console.error("6kc6921A - Error getting Modules:", error);
//         throw error;
//     }
// };
//
// export async function getModule(id: string): Promise<Module | null> {
//     if (!id) {
//         console.error(`1JJu5YcF - getModule error: Invalid ID provided.`);
//         return null;
//     }
//
//     try {
//         const docRef = doc(ModulesCollection, id);
//         const docSnap = await getDoc(docRef);
//
//         if (docSnap.exists()) {
//             return mapFirestoreDocToModule(docSnap.id, docSnap.data());
//         } else {
//             console.warn(`5FWjuV5d - Module document with ID ${id} not found.`);
//             return null;
//         }
//     } catch (error) {
//         console.error(`qt5KstD7 - Error fetching Module with ID ${id}:`, error);
//         throw new Error(`Failed to retrieve Module data for ID: ${id}.`);
//     }
// }
//
// export async function updateModule(
//     id: string,
//     data: Omit<Partial<Module>, "id" | "createdAt" | "createdBy">,
//     userId = "system",
// ): Promise<Module> {
//     if (!id) {
//         throw new Error(`KaDtMY5F - Module ID is required for update.`);
//     }
//
//     const trimmedNewName =
//         typeof data.name === "string" ? data.name.trim() : undefined;
//     const isNameBeingUpdated = trimmedNewName !== undefined;
//     const inputData = { ...data };
//
//     if (isNameBeingUpdated) {
//         if (!trimmedNewName) {
//             throw new Error(
//                 `yUyZ8Yg4 - Module name cannot be empty when updating.`,
//             );
//         }
//         inputData.name = trimmedNewName;
//     }
//
//     try {
//         const moduleRef = doc(ModulesCollection, id);
//         const checkSnap = await getDoc(moduleRef);
//         if (!checkSnap.exists()) {
//             throw new Error(
//                 `zQ7szk2s - Module with ID ${id} not found. Cannot update.`,
//             );
//         }
//         const currentData = checkSnap.data();
//         const currentName = currentData?.name;
//
//         if (isNameBeingUpdated && trimmedNewName !== currentName) {
//             const duplicateCheckQuery = query(
//                 ModulesCollection,
//                 where("name", "==", trimmedNewName),
//                 where(documentId(), "!=", id),
//                 limit(1),
//             );
//             const duplicateSnapshot = await getDocs(duplicateCheckQuery);
//             if (!duplicateSnapshot.empty) {
//                 throw new Error(
//                     `ss65UvLv - Cannot update Module ${id}. Another module with the name "${trimmedNewName}" already exists.`,
//                 );
//             }
//         }
//
//         const dataToUpdate: DocumentData = {
//             ...inputData,
//             updatedAt: serverTimestamp(),
//             updatedBy: userId,
//         };
//
//         Object.keys(dataToUpdate).forEach((key) => {
//             if (dataToUpdate[key] === undefined) delete dataToUpdate[key];
//         });
//
//         await updateDoc(moduleRef, dataToUpdate);
//
//         const updatedModuleDoc = await getDoc(moduleRef);
//         if (!updatedModuleDoc.exists()) {
//             // Should not happen if updateDoc succeeded
//             throw new Error(
//                 `4sadDxrB - Consistency error: Module ${id} not found after update call.`,
//             );
//         }
//
//         const updatedModule = mapFirestoreDocToModule(
//             updatedModuleDoc.id,
//             updatedModuleDoc.data(),
//         );
//         if (!updatedModule) {
//             throw new Error(
//                 `yyJqFS8y - Failed to map updated module data for ID: ${id}.`,
//             );
//         }
//
//         console.log(`Module ${id} updated successfully by user ${userId}.`);
//         return updatedModule;
//     } catch (error) {
//         if (
//             error instanceof Error &&
//             error.message.startsWith("DUPLICATE_MODULE_NAME_UPDATE")
//         ) {
//             console.warn(
//                 `MR6Sc7Ma - Failed Update Module ${id}: ${error.message}`,
//             );
//         } else {
//             console.error(
//                 `bsH1S8d7 - Generic error updating module with ID ${id}:`,
//                 error,
//             );
//         }
//         throw error;
//     }
// }
//
// export async function deleteModule(id: string): Promise<void> {
//     if (!id)
//         throw new Error(`8z7rVG6K - deleteModule error: Module ID required.`);
//     console.log(`5Sx45VwV - Attempting to delete Module: ${id}`);
//
//     const moduleRef = doc(ModulesCollection, id);
//
//     try {
//         // 1. Check if module exists before proceeding
//         const moduleSnap = await getDoc(moduleRef);
//         if (!moduleSnap.exists()) {
//             console.warn(
//                 `rDM7vkmX - Module with ID ${id} not found. Skipping delete.`,
//             );
//             return; // Or throw an error if non-existence should be an error condition
//         }
//
//         // 2. Delete associated Department-Module Assignments FIRST
//         console.log(
//             `DJ2srFW2 - Deleting associated department assignments for module ${id}...`,
//         );
//         await deleteAssignmentsByModule(id);
//         console.log(
//             `BdUdEG3R - Successfully deleted assignments for module ${id}.`,
//         );
//
//         // 3. Delete the Module document itself
//         await deleteDoc(moduleRef);
//         console.log(`jmT5kwpX - Successfully deleted Module ${id}.`);
//     } catch (error) {
//         console.error(
//             `4BEcGh47 - Error during deletion process for Module ID ${id}:`,
//             error,
//         );
//         let reason = "Unknown error during module deletion.";
//         if (error instanceof Error) reason = error.message;
//         if (
//             error instanceof Error &&
//             error.message.includes("Failed to delete assignments")
//         ) {
//             throw new Error(
//                 `Assignment cleanup failed before deleting module ${id}. Reason: ${reason}`,
//             );
//         } else {
//             throw new Error(`Failed to delete Module ${id}. Reason: ${reason}`);
//         }
//     }
// }

// src/services/modulesService.ts

import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    DocumentData,
    DocumentReference,
    getDoc,
    getDocs,
    limit,
    query,
    serverTimestamp,
    updateDoc,
    where,
    documentId,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { Module } from "@/types/moduleTypes";
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
    if (!moduleName) {
        throw new Error(`bN9mKlP6 - Module name cannot be empty.`);
    }

    try {
        // Check for existing module with the same name GLOBALLY
        const duplicateCheckQuery = query(
            ModulesCollection,
            where("name", "==", moduleName),
            limit(1),
        );
        const querySnapshot = await getDocs(duplicateCheckQuery);
        if (!querySnapshot.empty) {
            throw new Error(
                `DUPLICATE_MODULE_NAME_GLOBAL_1sWdE9 - A module with the name "${moduleName}" already exists globally.`,
            );
        }

        const dataToAdd: DocumentData = {
            ...moduleData,
            name: moduleName,
            // orgId: orgId, // REMOVED
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdBy: userId,
            updatedBy: userId,
            active: moduleData.active ?? true,
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

export async function updateModule(
    id: string,
    data: Omit<Partial<Module>, "id" | "createdAt" | "createdBy">, // Removed orgId from Omit
    userId = "system",
): Promise<Module> {
    if (!id) {
        throw new Error(`mN1bVcX7 - Module ID is required for update.`);
    }

    const trimmedNewName =
        typeof data.name === "string" ? data.name.trim() : undefined;
    const isNameBeingUpdated = trimmedNewName !== undefined;
    const inputData = { ...data };

    if (isNameBeingUpdated) {
        if (!trimmedNewName) {
            throw new Error(
                `pQ5zXcV2 - Module name cannot be empty when updating.`,
            );
        }
        inputData.name = trimmedNewName;
    }

    try {
        const moduleRef = doc(ModulesCollection, id);
        const checkSnap = await getDoc(moduleRef);
        if (!checkSnap.exists()) {
            throw new Error(
                `aZ3kLmN1 - Module with ID ${id} not found. Cannot update.`,
            );
        }
        const currentData = checkSnap.data();
        const currentName = currentData?.name;
        // REMOVED orgId fetch and check

        // Check for duplicate name globally if name is changing
        if (isNameBeingUpdated && trimmedNewName !== currentName) {
            const duplicateCheckQuery = query(
                ModulesCollection,
                where("name", "==", trimmedNewName), // Check name globally
                where(documentId(), "!=", id), // Exclude self
                limit(1),
            );
            const duplicateSnapshot = await getDocs(duplicateCheckQuery);
            if (!duplicateSnapshot.empty) {
                throw new Error(
                    `DUPLICATE_MODULE_NAME_UPDATE_GLOBAL_qW8eRtY3 - Cannot update Module ${id}. Another module with the name "${trimmedNewName}" already exists globally.`,
                );
            }
        }

        const dataToUpdate: DocumentData = {
            ...inputData,
            updatedAt: serverTimestamp(),
            updatedBy: userId,
        };
        // Clean undefined fields
        Object.keys(dataToUpdate).forEach((key) => {
            if (dataToUpdate[key] === undefined) delete dataToUpdate[key];
        });

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
