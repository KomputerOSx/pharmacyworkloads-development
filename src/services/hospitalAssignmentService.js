//src/services/hospitalAssignmentService.js
import {
    addDoc,
    collection,
    doc,
    getDocs,
    query,
    where,
    serverTimestamp,
    updateDoc,
    deleteDoc,
    getDoc,
} from "firebase/firestore";
import { db } from "./firebase.js";
import { formatFirestoreTimestamp } from "@/utils/firestoreUtil";

// export const assignHospitalToOrganisation = async (
//     hospitalId,
//     organisationId,
//     userId = "system",
// ) => {
//     try {
//         const hospitalRef = doc(db, "hospitals", hospitalId);
//         const organisationRef = doc(db, "organisations", organisationId);
//
//         const existingQuery = query(
//             collection(db, "hospital_organisation_assignments"),
//             where("hospital", "==", hospitalRef),
//             where("organisation", "==", organisationRef),
//             where("active", "==", true),
//         );
//
//         const existingSnapshot = await getDocs(existingQuery);
//
//         if (!existingSnapshot.empty) {
//             // Update existing assignment
//             const existingDoc = existingSnapshot.docs[0];
//             await updateDoc(
//                 doc(db, "hospital_organisation_assignments", existingDoc.id),
//                 {
//                     updatedAt: serverTimestamp(),
//                     updatedById: userId,
//                 },
//             );
//             return { id: existingDoc.id };
//         }
//
//         const assignmentData = {
//             hospital: hospitalRef,
//             organisation: organisationRef,
//             createdAt: serverTimestamp(),
//             updatedAt: serverTimestamp(),
//             createdById: userId,
//             updatedById: userId,
//         };
//
//         const docRef = await addDoc(
//             collection(db, "hospital_organisation_assignments"),
//             assignmentData,
//         );
//
//         return { id: docRef.id };
//     } catch (err) {
//         console.error("Error assigning hospital to organisation:", err);
//         throw err;
//     }
// };

export const assignHospitalToOrganisation = async (
    hospitalId,
    organisationId,
    userId = "system",
) => {
    try {
        const hospitalRef = doc(db, "hospitals", hospitalId);
        const organisationRef = doc(db, "organisations", organisationId);

        // Clean up any existing assignments first
        const existingAssignment = await cleanupExistingAssignments(
            hospitalId,
            organisationId,
        );

        if (existingAssignment) {
            // Update the existing assignment
            await updateDoc(
                doc(
                    db,
                    "hospital_organisation_assignments",
                    existingAssignment.id,
                ),
                {
                    updatedAt: serverTimestamp(),
                    updatedById: userId,
                    active: true, // Ensure it's marked as active
                },
            );
            return { id: existingAssignment.id };
        }

        // No existing assignment, create a new one
        const assignmentData = {
            hospital: hospitalRef,
            organisation: organisationRef,
            active: true, // Always set the active flag
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdById: userId,
            updatedById: userId,
        };

        const docRef = await addDoc(
            collection(db, "hospital_organisation_assignments"),
            assignmentData,
        );

        return { id: docRef.id };
    } catch (err) {
        console.error("Error assigning hospital to organisation:", err);
        throw err;
    }
};
export const getHospitalOrganisationAssignment = async (hospitalId) => {
    try {
        const assignments = await getDocs(
            query(
                collection(db, "hospital_organisation_assignments"),
                where("hospital", "==", doc(db, "hospitals", hospitalId)),
                where("active", "==", true),
            ),
        );
        return assignments.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (err) {
        console.error("Error fetching hospital assignments:", err);
        throw err;
    }
};

export const getHospitalsByOrganisation = async (organisationId) => {
    try {
        const organisationRef = doc(db, "organisations", organisationId);

        // Get all assignments for this organisation
        const assignmentsQuery = query(
            collection(db, "hospital_organisation_assignments"),
            where("organisation", "==", organisationRef),
        );

        const assignmentsSnapshot = await getDocs(assignmentsQuery);

        // Use a Set to track unique hospital IDs
        const uniqueHospitalIds = new Set();
        const hospitalRefs = [];

        assignmentsSnapshot.docs.forEach((doc) => {
            const data = doc.data();
            if (data.hospital) {
                const hospitalId = data.hospital.path.split("/").pop();
                // Only add if we haven't seen this hospital yet
                if (!uniqueHospitalIds.has(hospitalId)) {
                    uniqueHospitalIds.add(hospitalId);
                    hospitalRefs.push(data.hospital);
                }
            }
        });

        // Fetch the hospital data for each unique reference
        const hospitals = [];
        for (const hospitalRef of hospitalRefs) {
            const hospitalDoc = await getDoc(hospitalRef);
            if (hospitalDoc.exists()) {
                hospitals.push({
                    id: hospitalDoc.id,
                    ...hospitalDoc.data(),
                    createdAt: formatFirestoreTimestamp(
                        hospitalDoc.data().createdAt,
                    ),
                    updatedAt: formatFirestoreTimestamp(
                        hospitalDoc.data().updatedAt,
                    ),
                });
            }
        }

        return hospitals;
    } catch (error) {
        console.error("Error getting hospitals by organisation:", error);
        throw error;
    }
};
export const removeHospitalAssignment = async (assignmentId) => {
    try {
        await deleteDoc(
            doc(db, "hospital_organisation_assignments", assignmentId),
        );
    } catch (err) {
        console.error("Error deleting hospital assignment:", err);
        throw err;
    }
};

export const cleanupExistingAssignments = async (
    hospitalId,
    organisationId,
) => {
    try {
        const hospitalRef = doc(db, "hospitals", hospitalId);
        const organisationRef = doc(db, "organisations", organisationId);

        // Find all existing assignments for this hospital-org pair
        const existingQuery = query(
            collection(db, "hospital_organisation_assignments"),
            where("hospital", "==", hospitalRef),
            where("organisation", "==", organisationRef),
        );

        const existingSnapshot = await getDocs(existingQuery);

        if (existingSnapshot.empty) {
            // No existing assignments found
            return null;
        }

        if (existingSnapshot.docs.length === 1) {
            // Only one assignment exists, return it
            return {
                id: existingSnapshot.docs[0].id,
                data: existingSnapshot.docs[0].data(),
            };
        }

        // Multiple assignments found, keep the oldest and delete the rest
        const assignments = existingSnapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),
            createdAt: doc.data().createdAt,
        }));

        // Sort by createdAt (oldest first)
        assignments.sort((a, b) => {
            if (!a.createdAt) return 1;
            if (!b.createdAt) return -1;
            return a.createdAt.seconds - b.createdAt.seconds;
        });

        // Keep the oldest assignment
        const keepAssignment = assignments[0];
        console.log(
            `Keeping assignment ${keepAssignment.id} for hospital ${hospitalId} and org ${organisationId}`,
        );

        // Delete all other assignments
        for (let i = 1; i < assignments.length; i++) {
            console.log(`Deleting duplicate assignment ${assignments[i].id}`);
            await removeHospitalAssignment(assignments[i].id);
        }

        return keepAssignment;
    } catch (error) {
        console.error("Error cleaning up hospital assignments:", error);
        throw error;
    }
};
