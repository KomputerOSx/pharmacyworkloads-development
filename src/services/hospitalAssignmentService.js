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
    documentId,
} from "firebase/firestore";
import { db } from "./firebase.js";
import { formatFirestoreTimestamp } from "@/utils/firestoreUtil";

export const assignHospitalToOrganisation = async (
    hospitalId,
    organisationId,
    userId = "system",
) => {
    try {
        const hospitalRef = doc(db, "hospitals", hospitalId);
        const organisationRef = doc(db, "organisations", organisationId);

        const existingQuery = query(
            collection(db, "hospital_organisation_assignments"),
            where("hospital", "==", hospitalRef),
            where("organisation", "==", organisationRef),
            where("active", "==", true),
        );

        const existingSnapshot = await getDocs(existingQuery);

        if (!existingSnapshot.empty) {
            // Update existing assignment
            const existingDoc = existingSnapshot.docs[0];
            await updateDoc(
                doc(db, "hospital_organisation_assignments", existingDoc.id),
                {
                    updatedAt: serverTimestamp(),
                    updatedById: userId,
                },
            );
            return { id: existingDoc.id };
        }

        const assignmentData = {
            hospital: hospitalRef,
            organisation: organisationRef,
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

// In src/services/hospitalAssignmentService.js
export const getHospitalsByOrganisation = async (organisationId) => {
    try {
        const organisationRef = doc(db, "organisations", organisationId);

        // Get all assignments for this organisation
        const assignmentsQuery = query(
            collection(db, "hospital_organisation_assignments"),
            where("organisation", "==", organisationRef),
        );

        const assignmentsSnapshot = await getDocs(assignmentsQuery);

        // Extract hospital IDs from assignments
        const hospitalIds = assignmentsSnapshot.docs.map((doc) => {
            const data = doc.data();
            return data.hospital.path.split("/").pop();
        });

        if (hospitalIds.length === 0) {
            return [];
        }

        // Get all hospitals that match these IDs and filters
        const hospitals = [];

        let q = query(collection(db, "hospitals"));

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            hospitals.push({
                id: doc.id,
                ...doc.data(),
                createdAt: formatFirestoreTimestamp(doc.data().createdAt),
                updatedAt: formatFirestoreTimestamp(doc.data().updatedAt),
            });
        });

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
