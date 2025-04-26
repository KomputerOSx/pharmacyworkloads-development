// src/services/depModulesAssService.ts

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
    where,
    writeBatch,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { DepModuleAssignment } from "@/types/moduleTypes";
import { mapFirestoreDocToDepModuleAssignment } from "@/lib/firestoreUtil";

const AssignmentsCollection = collection(db, "department_module_assignments");

export async function createDepModuleAssignment(
    depId: string,
    moduleId: string,
    orgId: string,
    userId = "system",
): Promise<DepModuleAssignment> {
    if (!depId || !moduleId || !orgId) {
        throw new Error(
            `5WgVS7Tc - Department ID, Module ID, and Org ID are required to create an assignment.`,
        );
    }

    try {
        // Check if this specific assignment already exists
        const duplicateCheckQuery = query(
            AssignmentsCollection,
            where("depId", "==", depId),
            where("moduleId", "==", moduleId),
            limit(1),
        );
        const querySnapshot = await getDocs(duplicateCheckQuery);
        if (!querySnapshot.empty) {
            const existingAssignmentId = querySnapshot.docs[0].id;
            console.warn(
                `9TVM5Zqv - Assignment between Dep ${depId} and Module ${moduleId} already exists (ID: ${existingAssignmentId}). Returning existing.`,
            );
            // Optionally, fetch and return the existing one, or just throw an error
            // For simplicity, let's throw, assuming UI prevents duplicate adds
            throw new Error(
                `ufcjC3ee - This module is already assigned to this department.`,
            );
        }

        const dataToAdd: DocumentData = {
            depId,
            moduleId,
            orgId, // Store orgId for easier querying/security rules
            assignedAt: serverTimestamp(),
            assignedBy: userId,
        };

        const newDocRef: DocumentReference = await addDoc(
            AssignmentsCollection,
            dataToAdd,
        );
        const newAssignmentDoc = await getDoc(newDocRef);

        if (!newAssignmentDoc.exists()) {
            throw new Error(
                `a9XDsxS6 - Failed to retrieve newly created assignment (Ref Path: ${newDocRef.path}) immediately after creation.`,
            );
        }

        const createdAssignment = mapFirestoreDocToDepModuleAssignment(
            newAssignmentDoc.id,
            newAssignmentDoc.data(),
        );
        if (!createdAssignment) {
            throw new Error(
                `cuX521gC - Failed to map newly created assignment data (ID: ${newAssignmentDoc.id}).`,
            );
        }

        console.log(
            `Assignment created successfully (ID: ${createdAssignment.id}) between Dep ${depId} and Module ${moduleId}`,
        );
        return createdAssignment;
    } catch (error) {
        if (
            error instanceof Error &&
            error.message.startsWith("DUPLICATE_ASSIGNMENT")
        ) {
            console.warn(`9es5EAHq - ${error.message}`);
        } else {
            console.error(
                `2xbxAB5y - Error creating assignment between Dep ${depId} and Module ${moduleId}:`,
                error,
            );
        }
        throw error;
    }
}

export async function getModuleAssignmentsByDepartment(
    depId: string,
): Promise<DepModuleAssignment[]> {
    if (!depId) {
        console.error(
            `M4m6GvTj - getAssignmentsByDepartment error: Invalid Department ID.`,
        );
        return [];
    }
    try {
        const assQuery = query(
            AssignmentsCollection,
            where("depId", "==", depId),
        );
        const snapshot = await getDocs(assQuery);
        return snapshot.docs
            .map((doc) =>
                mapFirestoreDocToDepModuleAssignment(doc.id, doc.data()),
            )
            .filter((a): a is DepModuleAssignment => a !== null);
    } catch (error) {
        console.error(
            `QGBDyUu6 - Error getting assignments for department ${depId}:`,
            error,
        );
        throw error;
    }
}

export async function getAssignmentsByModule(
    moduleId: string,
): Promise<DepModuleAssignment[]> {
    if (!moduleId) {
        console.error(
            `5ew3UVwy - getAssignmentsByModule error: Invalid Module ID.`,
        );
        return [];
    }
    try {
        const assQuery = query(
            AssignmentsCollection,
            where("moduleId", "==", moduleId),
        );
        const snapshot = await getDocs(assQuery);
        return snapshot.docs
            .map((doc) =>
                mapFirestoreDocToDepModuleAssignment(doc.id, doc.data()),
            )
            .filter((a): a is DepModuleAssignment => a !== null);
    } catch (error) {
        console.error(
            `mYXaGJ9M - Error getting assignments for module ${moduleId}:`,
            error,
        );
        throw error;
    }
}

export async function deleteDepModuleAssignment(id: string): Promise<void> {
    if (!id)
        throw new Error(
            `X7eVNk2k - deleteDepModuleAssignment error: Assignment ID required.`,
        );
    const assignmentRef = doc(AssignmentsCollection, id);

    try {
        await deleteDoc(assignmentRef);
        console.log(`5Y5vAvL7 - Successfully deleted assignment ${id}.`);
    } catch (error) {
        console.error(
            `vPL7FTGw - Error deleting assignment with ID ${id}:`,
            error,
        );
        throw new Error(
            `Failed to delete assignment ${id}. Reason: ${error instanceof Error ? error.message : String(error)}`,
        );
    }
}

// --- Bulk Deletion Functions for Cascading ---

export async function deleteDepModuleAssignmentsByDepartment(
    depId: string,
): Promise<void> {
    if (!depId)
        throw new Error(
            `tR2Lr6Lj - deleteAssignmentsByDepartment error: Department ID required.`,
        );

    const assignmentsQuery = query(
        AssignmentsCollection,
        where("depId", "==", depId),
    );

    try {
        const snapshot = await getDocs(assignmentsQuery);
        if (snapshot.empty) {
            console.log(
                `Y2bhrf8S - No module assignments found for department ${depId} to delete.`,
            );
            return;
        }

        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        console.log(
            `DUd7zEpU - Committing batch deletion of ${snapshot.size} module assignments for department ${depId}...`,
        );
        await batch.commit();
        console.log(
            `Q12TVYvy - Successfully deleted ${snapshot.size} module assignments for department ${depId}.`,
        );
    } catch (error) {
        console.error(
            `uK8xwVbA - Error deleting module assignments for department ${depId}:`,
            error,
        );
        throw new Error(
            `Failed to delete module assignments for department ${depId}. Reason: ${error instanceof Error ? error.message : String(error)}`,
        );
    }
}

export async function deleteAssignmentsByModule(
    moduleId: string,
): Promise<void> {
    if (!moduleId)
        throw new Error(
            `kK8McCac - deleteAssignmentsByModule error: Module ID required.`,
        );

    const assignmentsQuery = query(
        AssignmentsCollection,
        where("moduleId", "==", moduleId),
    );

    try {
        const snapshot = await getDocs(assignmentsQuery);
        if (snapshot.empty) {
            console.log(
                `JMGNc3f8 - No department assignments found for module ${moduleId} to delete.`,
            );
            return;
        }

        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        console.log(
            `Fwh98KS8 - Committing batch deletion of ${snapshot.size} department assignments for module ${moduleId}...`,
        );
        await batch.commit();
        console.log(
            `Dca9gE7z - Successfully deleted ${snapshot.size} department assignments for module ${moduleId}.`,
        );
    } catch (error) {
        console.error(
            `HRFC9Yw5 - Error deleting department assignments for module ${moduleId}:`,
            error,
        );
        // Add specific context to the error message for easier debugging in deleteModule
        throw new Error(
            `Failed to delete assignments linked to module ${moduleId}. Reason: ${error instanceof Error ? error.message : String(error)}`,
        );
    }
}
