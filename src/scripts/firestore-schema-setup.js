import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";

// Read and parse the service account file
const serviceAccount = JSON.parse(
    fs.readFileSync("../../serviceAccountKey.json", "utf8"),
);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = getFirestore();

// Function to create the schema and sample data
async function createSchema() {
    try {
        console.log("Starting database setup...");

        // Create directorates
        const directorates = [
            {
                id: "cote",
                name: "COTE",
                color: "#3498db",
                description: "Care of the Elderly",
            },
            {
                id: "meds",
                name: "MEDS",
                color: "#2ecc71",
                description: "Medicine",
            },
            {
                id: "surg",
                name: "SURG",
                color: "#e74c3c",
                description: "Surgery",
            },
            {
                id: "emrg",
                name: "EMRG",
                color: "#f39c12",
                description: "Emergency",
            },
        ];

        const directorateRefs = {};

        console.log("Creating directorates...");
        for (const dir of directorates) {
            const { id, ...directorate } = dir;
            const docRef = db.collection("directorates").doc(id);
            directorateRefs[id] = docRef;

            await docRef.set({
                ...directorate,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }

        // Create wards
        console.log("Creating wards...");
        const wards = [
            {
                id: "ward1",
                name: "Ward 1",
                directorate: directorateRefs["cote"],
            },
            {
                id: "ward2",
                name: "Ward 2",
                directorate: directorateRefs["cote"],
            },
            {
                id: "ward3",
                name: "Ward 3",
                directorate: directorateRefs["cote"],
            },
            {
                id: "ward4",
                name: "Ward 4",
                directorate: directorateRefs["cote"],
            },
            {
                id: "ward5",
                name: "Ward 5",
                directorate: directorateRefs["meds"],
            },
            {
                id: "ward6",
                name: "Ward 6",
                directorate: directorateRefs["meds"],
            },
            {
                id: "ward7",
                name: "Ward 7",
                directorate: directorateRefs["meds"],
            },
            {
                id: "ward8",
                name: "Ward 8",
                directorate: directorateRefs["meds"],
            },
            {
                id: "ward9",
                name: "Ward 9",
                directorate: directorateRefs["surg"],
            },
            {
                id: "ward10",
                name: "Ward 10",
                directorate: directorateRefs["surg"],
            },
            {
                id: "ward11",
                name: "Ward 11",
                directorate: directorateRefs["surg"],
            },
            {
                id: "ward12",
                name: "Ward 12",
                directorate: directorateRefs["surg"],
            },
            {
                id: "ward13",
                name: "Ward 13",
                directorate: directorateRefs["emrg"],
            },
            {
                id: "ward14",
                name: "Ward 14",
                directorate: directorateRefs["emrg"],
            },
            {
                id: "ward15",
                name: "Ward 15",
                directorate: directorateRefs["emrg"],
            },
            {
                id: "ward16",
                name: "Ward 16",
                directorate: directorateRefs["emrg"],
            },
        ];

        const wardRefs = {};

        for (const ward of wards) {
            const { id, ...wardData } = ward;
            const docRef = db.collection("wards").doc(id);
            wardRefs[id] = docRef;

            await docRef.set({
                ...wardData,
                active: true,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }

        // Create pharmacists
        console.log("Creating pharmacists...");
        const pharmacists = [
            {
                id: "john_smith",
                name: "John Smith",
                email: "john.smith@hospital.org",
            },
            {
                id: "emma_wilson",
                name: "Emma Wilson",
                email: "emma.wilson@hospital.org",
            },
            {
                id: "michael_brown",
                name: "Michael Brown",
                email: "michael.brown@hospital.org",
            },
            {
                id: "sarah_johnson",
                name: "Sarah Johnson",
                email: "sarah.johnson@hospital.org",
            },
            {
                id: "david_lee",
                name: "David Lee",
                email: "david.lee@hospital.org",
            },
        ];

        const pharmacistRefs = {};

        for (const pharmacist of pharmacists) {
            const { id, ...pharmacistData } = pharmacist;
            const docRef = db.collection("pharmacists").doc(id);
            pharmacistRefs[id] = docRef;

            await docRef.set({
                ...pharmacistData,
                active: true,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }

        // Create users
        console.log("Creating users...");
        const users = [
            {
                id: "admin_user",
                displayName: "Admin User",
                email: "admin@hospital.org",
                role: "admin",
            },
            {
                id: "john_smith",
                displayName: "John Smith",
                email: "john.smith@hospital.org",
                role: "pharmacist",
            },
            {
                id: "emma_wilson",
                displayName: "Emma Wilson",
                email: "emma.wilson@hospital.org",
                role: "pharmacist",
            },
            {
                id: "readonly_user",
                displayName: "Read Only",
                email: "readonly@hospital.org",
                role: "readonly",
            },
        ];

        const userRefs = {};

        for (const user of users) {
            const { id, ...userData } = user;
            const docRef = db.collection("users").doc(id);
            userRefs[id] = docRef;

            await docRef.set({
                ...userData,
                lastLogin: admin.firestore.FieldValue.serverTimestamp(),
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }

        // Create notices
        console.log("Creating notices...");
        const notices = [
            {
                text: "Welcome to the new Pharmacy Directorate Workload Tracker system!",
                date: new Date().toISOString().split("T")[0],
                active: true,
                createdBy: userRefs["admin_user"],
            },
            {
                text: "Remember to complete your ward assignments by 9:30 AM each morning.",
                date: new Date().toISOString().split("T")[0],
                active: true,
                createdBy: userRefs["admin_user"],
            },
            {
                text: "Staff meeting today at 2:00 PM in Conference Room B.",
                date: new Date().toISOString().split("T")[0],
                active: true,
                expiryDate: new Date(
                    new Date().setDate(new Date().getDate() + 1),
                )
                    .toISOString()
                    .split("T")[0],
                createdBy: userRefs["admin_user"],
            },
        ];

        for (let i = 0; i < notices.length; i++) {
            await db
                .collection("notices")
                .doc(`notice${i + 1}`)
                .set({
                    ...notices[i],
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });
        }

        // Create daily workloads for today and yesterday
        console.log("Creating daily workloads...");
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const dates = [today, yesterday];

        for (const date of dates) {
            const dateStr = date.toISOString().split("T")[0];
            const options = { weekday: "long", month: "long" };
            const formatter = new Intl.DateTimeFormat("en-US", options);
            const [{ value: weekday }, , { value: month }] =
                formatter.formatToParts(date);

            // Create the daily workload document
            await db.collection("daily_workloads").doc(dateStr).set({
                date: dateStr,
                weekday,
                month,
                year: date.getFullYear(),
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            // Create some ward assignments for this date
            console.log(`Creating ward assignments for ${dateStr}...`);

            // Sample assignments - this would typically be more dynamic in a real app
            const assignments = [
                {
                    ward: wardRefs["ward1"],
                    directorate: directorateRefs["cote"],
                    amPharmacist: pharmacistRefs["john_smith"],
                    pmPharmacist: pharmacistRefs["emma_wilson"],
                    histories: 12,
                    reviews: 25,
                    ttos: 5,
                    notes: "",
                    createdBy: userRefs["admin_user"],
                    updatedBy: null,
                    coordinator: pharmacistRefs["john_smith"],
                },
                {
                    ward: wardRefs["ward5"],
                    directorate: directorateRefs["meds"],
                    amPharmacist: pharmacistRefs["emma_wilson"],
                    pmPharmacist: pharmacistRefs["sarah_johnson"],
                    histories: 15,
                    reviews: 30,
                    ttos: 8,
                    notes: "",
                    createdBy: userRefs["admin_user"],
                    updatedBy: null,
                },
                {
                    ward: wardRefs["ward9"],
                    directorate: directorateRefs["surg"],
                    amPharmacist: pharmacistRefs["michael_brown"],
                    pmPharmacist: pharmacistRefs["michael_brown"],
                    histories: 5,
                    reviews: 18,
                    ttos: 3,
                    notes: "",
                    createdBy: userRefs["admin_user"],
                    updatedBy: null,
                },
                {
                    ward: wardRefs["ward13"],
                    directorate: directorateRefs["emrg"],
                    amPharmacist: pharmacistRefs["david_lee"],
                    pmPharmacist: pharmacistRefs["david_lee"],
                    histories: 20,
                    reviews: 35,
                    ttos: 12,
                    notes: "High patient turnover today",
                    createdBy: userRefs["admin_user"],
                    updatedBy: null,
                },
            ];

            const assignmentsCollection = db
                .collection("daily_workloads")
                .doc(dateStr)
                .collection("ward_assignments");

            for (let i = 0; i < assignments.length; i++) {
                await assignmentsCollection.doc(`assignment${i + 1}`).set({
                    ...assignments[i],
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            }
        }

        console.log("Database setup completed successfully!");
    } catch (error) {
        console.error("Error setting up database:", error);
    }
}

// Run the schema creation
createSchema()
    .then(() => {
        console.log("Script completed.");
        process.exit(0);
    })
    .catch((err) => {
        console.error("Script failed:", err);
        process.exit(1);
    });
