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
        console.log("Starting enhanced database setup...");

        // Create organisations (new top-level entity)
        console.log("Creating organisations...");
        const organizations = [
            {
                id: "nhs_trust_1",
                name: "Central NHS Trust",
                type: "NHS Trust",
                contactEmail: "admin@centralnhs.org",
                contactPhone: "020-1234-5678",
                active: true,
            },
        ];

        const organizationRefs = {};

        for (const org of organizations) {
            const { id, ...orgData } = org;
            const docRef = db.collection("organizations").doc(id);
            organizationRefs[id] = docRef;

            await docRef.set({
                ...orgData,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedById: "system",
                createdById: "system",
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }

        // Create hospitals
        console.log("Creating hospitals...");
        const hospitals = [
            {
                id: "central_hospital",
                name: "Central Hospital",
                address: "123 Hospital Road",
                postcode: "AB12 3CD",
                contactNumber: "020-8765-4321",
                organization: organizationRefs["nhs_trust_1"],
                active: true,
            },
        ];

        const hospitalRefs = {};

        for (const hospital of hospitals) {
            const { id, ...hospitalData } = hospital;
            const docRef = db.collection("hospitals").doc(id);
            hospitalRefs[id] = docRef;

            await docRef.set({
                ...hospitalData,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedById: "system",
                createdById: "system",
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }

        // Create staff roles (new collection)
        console.log("Creating staff roles...");
        const staffRoles = [
            {
                id: "pharmacist",
                name: "Pharmacist",
                description: "Licensed pharmacist",
                canCoordinate: true,
                canSupervise: true,
            },
            {
                id: "technician",
                name: "Pharmacy Technician",
                description: "Qualified pharmacy technician",
                canCoordinate: false,
                canSupervise: false,
            },
            {
                id: "student",
                name: "Pharmacy Student",
                description: "Pharmacy student on rotation",
                canCoordinate: false,
                canSupervise: false,
            },
        ];

        const roleRefs = {};

        for (const role of staffRoles) {
            const { id, ...roleData } = role;
            const docRef = db.collection("staff_roles").doc(id);
            roleRefs[id] = docRef;

            await docRef.set({
                ...roleData,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedById: "system",
                createdById: "system",
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }

        // Create shifts (new collection)
        console.log("Creating shifts...");
        const shifts = [
            {
                id: "am",
                name: "AM",
                startTime: "08:00",
                endTime: "13:00",
                active: true,
            },
            {
                id: "pm",
                name: "PM",
                startTime: "13:00",
                endTime: "17:00",
                active: true,
            },
            {
                id: "night",
                name: "Night",
                startTime: "20:00",
                endTime: "08:00",
                active: true,
            },
        ];

        const shiftRefs = {};

        for (const shift of shifts) {
            const { id, ...shiftData } = shift;
            const docRef = db.collection("shifts").doc(id);
            shiftRefs[id] = docRef;

            await docRef.set({
                ...shiftData,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedById: "system",
                createdById: "system",
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }

        // Create workload types (new collection)
        console.log("Creating workload types...");
        const workloadTypes = [
            {
                id: "med_history",
                name: "Medication History",
                description: "Taking medication history from patient",
                countable: true,
                trackTime: true,
            },
            {
                id: "med_review",
                name: "Medication Review",
                description: "Review of patient medications",
                countable: true,
                trackTime: true,
            },
            {
                id: "tto",
                name: "TTO",
                description: "To Take Out prescriptions",
                countable: true,
                trackTime: true,
            },
        ];

        const workloadTypeRefs = {};

        for (const type of workloadTypes) {
            const { id, ...typeData } = type;
            const docRef = db.collection("workload_types").doc(id);
            workloadTypeRefs[id] = docRef;

            await docRef.set({
                ...typeData,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedById: "system",
                createdById: "system",
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }

        // Create directorates (updated to link to hospitals)
        const directorates = [
            {
                id: "cote",
                name: "COTE",
                code: "COTE",
                color: "#3498db",
                description: "Care of the Elderly",
                hospital: hospitalRefs["central_hospital"],
            },
            {
                id: "meds",
                name: "MEDS",
                code: "MEDS",
                color: "#2ecc71",
                description: "Medicine",
                hospital: hospitalRefs["central_hospital"],
            },
            {
                id: "surg",
                name: "SURG",
                code: "SURG",
                color: "#e74c3c",
                description: "Surgery",
                hospital: hospitalRefs["central_hospital"],
            },
            {
                id: "emrg",
                name: "EMRG",
                code: "EMRG",
                color: "#f39c12",
                description: "Emergency",
                hospital: hospitalRefs["central_hospital"],
            },
        ];

        const directorateRefs = {};

        console.log("Creating directorates...");
        for (const dir of directorates) {
            const { id, ...directorate } = dir;
            const docRef = db.collection("departments").doc(id);
            directorateRefs[id] = docRef;

            await docRef.set({
                ...directorate,
                active: true,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedById: "system",
                createdById: "system",
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }

        // Create wards (updated to link to both departments and hospitals)
        console.log("Creating wards...");
        const wards = [
            {
                id: "ward1",
                name: "Ward 1",
                code: "W1",
                department: directorateRefs["cote"],
                hospital: hospitalRefs["central_hospital"],
                bedCount: 24,
            },
            {
                id: "ward2",
                name: "Ward 2",
                code: "W2",
                department: directorateRefs["cote"],
                hospital: hospitalRefs["central_hospital"],
                bedCount: 28,
            },
            {
                id: "ward3",
                name: "Ward 3",
                code: "W3",
                department: directorateRefs["cote"],
                hospital: hospitalRefs["central_hospital"],
                bedCount: 20,
            },
            {
                id: "ward4",
                name: "Ward 4",
                code: "W4",
                department: directorateRefs["cote"],
                hospital: hospitalRefs["central_hospital"],
                bedCount: 26,
            },
            {
                id: "ward5",
                name: "Ward 5",
                code: "W5",
                department: directorateRefs["meds"],
                hospital: hospitalRefs["central_hospital"],
                bedCount: 30,
            },
            {
                id: "ward6",
                name: "Ward 6",
                code: "W6",
                department: directorateRefs["meds"],
                hospital: hospitalRefs["central_hospital"],
                bedCount: 32,
            },
            {
                id: "ward7",
                name: "Ward 7",
                code: "W7",
                department: directorateRefs["meds"],
                hospital: hospitalRefs["central_hospital"],
                bedCount: 28,
            },
            {
                id: "ward8",
                name: "Ward 8",
                code: "W8",
                department: directorateRefs["meds"],
                hospital: hospitalRefs["central_hospital"],
                bedCount: 24,
            },
            {
                id: "ward9",
                name: "Ward 9",
                code: "W9",
                department: directorateRefs["surg"],
                hospital: hospitalRefs["central_hospital"],
                bedCount: 18,
            },
            {
                id: "ward10",
                name: "Ward 10",
                code: "W10",
                department: directorateRefs["surg"],
                hospital: hospitalRefs["central_hospital"],
                bedCount: 22,
            },
            {
                id: "ward11",
                name: "Ward 11",
                code: "W11",
                department: directorateRefs["surg"],
                hospital: hospitalRefs["central_hospital"],
                bedCount: 20,
            },
            {
                id: "ward12",
                name: "Ward 12",
                code: "W12",
                department: directorateRefs["surg"],
                hospital: hospitalRefs["central_hospital"],
                bedCount: 24,
            },
            {
                id: "ward13",
                name: "Ward 13",
                code: "W13",
                department: directorateRefs["emrg"],
                hospital: hospitalRefs["central_hospital"],
                bedCount: 16,
            },
            {
                id: "ward14",
                name: "Ward 14",
                code: "W14",
                department: directorateRefs["emrg"],
                hospital: hospitalRefs["central_hospital"],
                bedCount: 14,
            },
            {
                id: "ward15",
                name: "Ward 15",
                code: "W15",
                department: directorateRefs["emrg"],
                hospital: hospitalRefs["central_hospital"],
                bedCount: 12,
            },
            {
                id: "ward16",
                name: "Ward 16",
                code: "W16",
                department: directorateRefs["emrg"],
                hospital: hospitalRefs["central_hospital"],
                bedCount: 18,
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
                updatedById: "system",
                createdById: "system",
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }

        // Create staff (replacing pharmacists with a more generic staff collection)
        console.log("Creating staff...");
        const staff = [
            {
                id: "john_smith",
                name: "John Smith",
                email: "john.smith@hospital.org",
                phone: "020-1111-2222",
                primaryRole: roleRefs["pharmacist"],
                organization: organizationRefs["nhs_trust_1"],
                defaultHospital: hospitalRefs["central_hospital"],
            },
            {
                id: "emma_wilson",
                name: "Emma Wilson",
                email: "emma.wilson@hospital.org",
                phone: "020-2222-3333",
                primaryRole: roleRefs["pharmacist"],
                organization: organizationRefs["nhs_trust_1"],
                defaultHospital: hospitalRefs["central_hospital"],
            },
            {
                id: "michael_brown",
                name: "Michael Brown",
                email: "michael.brown@hospital.org",
                phone: "020-3333-4444",
                primaryRole: roleRefs["pharmacist"],
                organization: organizationRefs["nhs_trust_1"],
                defaultHospital: hospitalRefs["central_hospital"],
            },
            {
                id: "sarah_johnson",
                name: "Sarah Johnson",
                email: "sarah.johnson@hospital.org",
                phone: "020-4444-5555",
                primaryRole: roleRefs["pharmacist"],
                organization: organizationRefs["nhs_trust_1"],
                defaultHospital: hospitalRefs["central_hospital"],
            },
            {
                id: "david_lee",
                name: "David Lee",
                email: "david.lee@hospital.org",
                phone: "020-5555-6666",
                primaryRole: roleRefs["pharmacist"],
                organization: organizationRefs["nhs_trust_1"],
                defaultHospital: hospitalRefs["central_hospital"],
            },
            {
                id: "james_wilson",
                name: "James Wilson",
                email: "james.wilson@hospital.org",
                phone: "020-6666-7777",
                primaryRole: roleRefs["technician"],
                organization: organizationRefs["nhs_trust_1"],
                defaultHospital: hospitalRefs["central_hospital"],
            },
            {
                id: "lisa_taylor",
                name: "Lisa Taylor",
                email: "lisa.taylor@hospital.org",
                phone: "020-7777-8888",
                primaryRole: roleRefs["technician"],
                organization: organizationRefs["nhs_trust_1"],
                defaultHospital: hospitalRefs["central_hospital"],
            },
        ];

        const staffRefs = {};

        for (const person of staff) {
            const { id, ...staffData } = person;
            const docRef = db.collection("staff").doc(id);
            staffRefs[id] = docRef;

            await docRef.set({
                ...staffData,
                active: true,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedById: "system",
                createdById: "system",
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }

        // Create staff hospital assignments
        console.log("Creating staff hospital assignments...");

        for (const person of staff) {
            await db
                .collection("staff_hospital_assignments")
                .doc(`${person.id}_central_hospital`)
                .set({
                    staff: staffRefs[person.id],
                    hospital: hospitalRefs["central_hospital"],
                    startDate: admin.firestore.Timestamp.fromDate(
                        new Date(2023, 0, 1),
                    ),
                    endDate: null, // No end date means current assignment
                    active: true,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedById: "system",
                    createdById: "system",
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
        }

        // Create staff department assignments
        console.log("Creating staff department assignments...");

        // Sample department assignments - in reality would be more specific
        const departmentAssignments = [
            { staffId: "john_smith", departmentId: "cote" },
            { staffId: "john_smith", departmentId: "emrg" },
            { staffId: "emma_wilson", departmentId: "cote" },
            { staffId: "emma_wilson", departmentId: "meds" },
            { staffId: "michael_brown", departmentId: "surg" },
            { staffId: "sarah_johnson", departmentId: "meds" },
            { staffId: "sarah_johnson", departmentId: "surg" },
            { staffId: "david_lee", departmentId: "emrg" },
            { staffId: "james_wilson", departmentId: "cote" },
            { staffId: "james_wilson", departmentId: "meds" },
            { staffId: "lisa_taylor", departmentId: "surg" },
            { staffId: "lisa_taylor", departmentId: "emrg" },
        ];

        for (const assignment of departmentAssignments) {
            await db
                .collection("staff_department_assignments")
                .doc(`${assignment.staffId}_${assignment.departmentId}`)
                .set({
                    staff: staffRefs[assignment.staffId],
                    department: directorateRefs[assignment.departmentId],
                    startDate: admin.firestore.Timestamp.fromDate(
                        new Date(2023, 0, 1),
                    ),
                    endDate: null, // No end date means current assignment
                    active: true,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedById: "system",
                    createdById: "system",
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
        }

        // Create users (enhanced with organization and staff links)
        console.log("Creating users...");
        const users = [
            {
                id: "admin_user",
                username: "admin",
                displayName: "Admin User",
                email: "admin@hospital.org",
                role: "admin",
                organization: organizationRefs["nhs_trust_1"],
                staff: null, // Admin might not be a staff member
            },
            {
                id: "john_smith",
                username: "jsmith",
                displayName: "John Smith",
                email: "john.smith@hospital.org",
                role: "pharmacist",
                organization: organizationRefs["nhs_trust_1"],
                staff: staffRefs["john_smith"],
            },
            {
                id: "emma_wilson",
                username: "ewilson",
                displayName: "Emma Wilson",
                email: "emma.wilson@hospital.org",
                role: "pharmacist",
                organization: organizationRefs["nhs_trust_1"],
                staff: staffRefs["emma_wilson"],
            },
            {
                id: "james_wilson",
                username: "jwilson",
                displayName: "James Wilson",
                email: "james.wilson@hospital.org",
                role: "technician",
                organization: organizationRefs["nhs_trust_1"],
                staff: staffRefs["james_wilson"],
            },
            {
                id: "readonly_user",
                username: "readonly",
                displayName: "Read Only",
                email: "readonly@hospital.org",
                role: "readonly",
                organization: organizationRefs["nhs_trust_1"],
                staff: null,
            },
        ];

        const userRefs = {};

        for (const user of users) {
            const { id, ...userData } = user;
            const docRef = db.collection("users").doc(id);
            userRefs[id] = docRef;

            await docRef.set({
                ...userData,
                active: true,
                lastLogin: admin.firestore.FieldValue.serverTimestamp(),
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedById: "system",
                createdById: "system",
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }

        // Create notices (enhanced with hospital and department targeting)
        console.log("Creating notices...");
        const notices = [
            {
                title: "System Launch",
                content:
                    "Welcome to the new Pharmacy Directorate Workload Tracker system!",
                date: new Date().toISOString().split("T")[0],
                active: true,
                hospital: hospitalRefs["central_hospital"],
                department: null, // Null means all departments
                startDate: new Date().toISOString().split("T")[0],
                endDate: null, // No end date
                createdBy: userRefs["admin_user"],
            },
            {
                title: "Morning Reminder",
                content:
                    "Remember to complete your ward assignments by 9:30 AM each morning.",
                date: new Date().toISOString().split("T")[0],
                active: true,
                hospital: hospitalRefs["central_hospital"],
                department: null,
                startDate: new Date().toISOString().split("T")[0],
                endDate: null,
                createdBy: userRefs["admin_user"],
            },
            {
                title: "Meeting Notice",
                content: "Staff meeting today at 2:00 PM in Conference Room B.",
                date: new Date().toISOString().split("T")[0],
                active: true,
                hospital: hospitalRefs["central_hospital"],
                department: directorateRefs["cote"], // Only for COTE department
                startDate: new Date().toISOString().split("T")[0],
                endDate: new Date(new Date().setDate(new Date().getDate() + 1))
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
                    updatedById: "system",
                    createdById: userRefs["admin_user"].id,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
        }

        // Create daily workloads for today and yesterday (enhanced with hospital reference)
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
            const workloadRef = db.collection("daily_workloads").doc(dateStr);
            await workloadRef.set({
                date: dateStr,
                weekday,
                month,
                year: date.getFullYear(),
                hospital: hospitalRefs["central_hospital"],
                finalized: false,
                finalizedBy: null,
                finalizedAt: null,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedById: "system",
                createdById: "system",
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            // Create ward assignments for this date
            console.log(`Creating ward assignments for ${dateStr}...`);

            // Sample assignments
            const wardAssignments = [
                {
                    id: "assignment1",
                    ward: wardRefs["ward1"],
                    department: directorateRefs["cote"],
                    hospital: hospitalRefs["central_hospital"],
                },
                {
                    id: "assignment2",
                    ward: wardRefs["ward5"],
                    department: directorateRefs["meds"],
                    hospital: hospitalRefs["central_hospital"],
                },
                {
                    id: "assignment3",
                    ward: wardRefs["ward9"],
                    department: directorateRefs["surg"],
                    hospital: hospitalRefs["central_hospital"],
                },
                {
                    id: "assignment4",
                    ward: wardRefs["ward13"],
                    department: directorateRefs["emrg"],
                    hospital: hospitalRefs["central_hospital"],
                },
            ];

            // Create ward assignments
            for (const assignment of wardAssignments) {
                const { id, ...assignmentData } = assignment;
                const assignmentRef = workloadRef
                    .collection("ward_assignments")
                    .doc(id);

                await assignmentRef.set({
                    ...assignmentData,
                    notes: "",
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedById: "system",
                    createdById: "system",
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });

                // Create staff assignments for this ward assignment
                await createStaffAssignments(assignmentRef, assignment.id);

                // Create workload entries for this ward assignment
                await createWorkloadEntries(assignmentRef, assignment.id);
            }
        }

        // Create audit log entries
        console.log("Creating sample audit logs...");

        const auditActions = [
            {
                action: "create",
                entityType: "ward_assignments",
                entityId: "assignment1",
                previousValues: null,
                newValues: { ward: "Ward 1", department: "COTE" },
                userId: userRefs["admin_user"].id,
                organizationId: organizationRefs["nhs_trust_1"].id,
                hospitalId: hospitalRefs["central_hospital"].id,
                ipAddress: "192.168.1.1",
                userAgent:
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
            {
                action: "update",
                entityType: "staff_assignments",
                entityId: "staff_assignment1",
                previousValues: { staff: "John Smith", shift: "AM" },
                newValues: { staff: "Emma Wilson", shift: "AM" },
                userId: userRefs["admin_user"].id,
                organizationId: organizationRefs["nhs_trust_1"].id,
                hospitalId: hospitalRefs["central_hospital"].id,
                ipAddress: "192.168.1.2",
                userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
            },
            {
                action: "view",
                entityType: "daily_workloads",
                entityId: today.toISOString().split("T")[0],
                previousValues: null,
                newValues: null,
                userId: userRefs["readonly_user"].id,
                organizationId: organizationRefs["nhs_trust_1"].id,
                hospitalId: hospitalRefs["central_hospital"].id,
                ipAddress: "192.168.1.3",
                userAgent:
                    "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
            },
        ];

        for (let i = 0; i < auditActions.length; i++) {
            await db
                .collection("audit_logs")
                .doc(`audit${i + 1}`)
                .set({
                    ...auditActions[i],
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });
        }

        // Create record versions
        console.log("Creating sample record versions...");

        const recordVersions = [
            {
                entityType: "ward_assignments",
                entityId: "assignment1",
                versionNumber: 1,
                data: {
                    ward: wardRefs["ward1"],
                    department: directorateRefs["cote"],
                    notes: "",
                },
                changeReason: "Initial creation",
                userId: userRefs["admin_user"].id,
            },
            {
                entityType: "ward_assignments",
                entityId: "assignment1",
                versionNumber: 2,
                data: {
                    ward: wardRefs["ward1"],
                    department: directorateRefs["cote"],
                    notes: "Updated ward notes",
                },
                changeReason: "Added notes",
                userId: userRefs["john_smith"].id,
            },
        ];

        for (let i = 0; i < recordVersions.length; i++) {
            await db
                .collection("record_versions")
                .doc(`version${i + 1}`)
                .set({
                    ...recordVersions[i],
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });
        }

        console.log("Enhanced database setup completed successfully!");
    } catch (error) {
        console.error("Error setting up database:", error);
    }
}

// Helper function to create staff assignments
async function createStaffAssignments(wardAssignmentRef, assignmentId) {
    // Sample structure for staff assignments
    const staffAssignments = {
        assignment1: [
            {
                id: "staff_assignment1_am",
                staff: db.collection("staff").doc("john_smith"),
                role: db.collection("staff_roles").doc("pharmacist"),
                shift: db.collection("shifts").doc("am"),
                isCoordinator: true,
                isSupervisor: true,
                supervisorId: null,
            },
            {
                id: "staff_assignment1_pm",
                staff: db.collection("staff").doc("emma_wilson"),
                role: db.collection("staff_roles").doc("pharmacist"),
                shift: db.collection("shifts").doc("pm"),
                isCoordinator: false,
                isSupervisor: true,
                supervisorId: null,
            },
            {
                id: "staff_assignment1_tech",
                staff: db.collection("staff").doc("james_wilson"),
                role: db.collection("staff_roles").doc("technician"),
                shift: db.collection("shifts").doc("am"),
                isCoordinator: false,
                isSupervisor: false,
                supervisorId: db.collection("staff").doc("john_smith"),
            },
        ],
        assignment2: [
            {
                id: "staff_assignment2_am",
                staff: db.collection("staff").doc("emma_wilson"),
                role: db.collection("staff_roles").doc("pharmacist"),
                shift: db.collection("shifts").doc("am"),
                isCoordinator: true,
                isSupervisor: true,
                supervisorId: null,
            },
            {
                id: "staff_assignment2_pm",
                staff: db.collection("staff").doc("sarah_johnson"),
                role: db.collection("staff_roles").doc("pharmacist"),
                shift: db.collection("shifts").doc("pm"),
                isCoordinator: false,
                isSupervisor: true,
                supervisorId: null,
            },
        ],
        assignment3: [
            {
                id: "staff_assignment3_am",
                staff: db.collection("staff").doc("michael_brown"),
                role: db.collection("staff_roles").doc("pharmacist"),
                shift: db.collection("shifts").doc("am"),
                isCoordinator: true,
                isSupervisor: true,
                supervisorId: null,
            },
            {
                id: "staff_assignment3_pm",
                staff: db.collection("staff").doc("michael_brown"),
                role: db.collection("staff_roles").doc("pharmacist"),
                shift: db.collection("shifts").doc("pm"),
                isCoordinator: true,
                isSupervisor: true,
                supervisorId: null,
            },
            {
                id: "staff_assignment3_tech",
                staff: db.collection("staff").doc("lisa_taylor"),
                role: db.collection("staff_roles").doc("technician"),
                shift: db.collection("shifts").doc("am"),
                isCoordinator: false,
                isSupervisor: false,
                supervisorId: db.collection("staff").doc("michael_brown"),
            },
        ],
        assignment4: [
            {
                id: "staff_assignment4_am",
                staff: db.collection("staff").doc("david_lee"),
                role: db.collection("staff_roles").doc("pharmacist"),
                shift: db.collection("shifts").doc("am"),
                isCoordinator: true,
                isSupervisor: true,
                supervisorId: null,
            },
            {
                id: "staff_assignment4_pm",
                staff: db.collection("staff").doc("david_lee"),
                role: db.collection("staff_roles").doc("pharmacist"),
                shift: db.collection("shifts").doc("pm"),
                isCoordinator: true,
                isSupervisor: true,
                supervisorId: null,
            },
        ],
    };

    // Create staff assignments for this ward assignment
    if (staffAssignments[assignmentId]) {
        for (const staffAssignment of staffAssignments[assignmentId]) {
            const { id, ...assignmentData } = staffAssignment;
            await wardAssignmentRef
                .collection("staff_assignments")
                .doc(id)
                .set({
                    ...assignmentData,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedById: "system",
                    createdById: "system",
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
        }
    }
}

// Helper function to create workload entries
async function createWorkloadEntries(wardAssignmentRef, assignmentId) {
    // Sample workload data
    const workloadData = {
        assignment1: [
            {
                staffAssignment: "staff_assignment1_am",
                workloadType: db
                    .collection("workload_types")
                    .doc("med_history"),
                count: 12,
                timeMinutes: 180,
                notes: "",
            },
            {
                staffAssignment: "staff_assignment1_am",
                workloadType: db.collection("workload_types").doc("med_review"),
                count: 25,
                timeMinutes: 300,
                notes: "",
            },
            {
                staffAssignment: "staff_assignment1_tech",
                workloadType: db.collection("workload_types").doc("tto"),
                count: 5,
                timeMinutes: 90,
                notes: "",
            },
        ],
        assignment2: [
            {
                staffAssignment: "staff_assignment2_am",
                workloadType: db
                    .collection("workload_types")
                    .doc("med_history"),
                count: 15,
                timeMinutes: 225,
                notes: "",
            },
            {
                staffAssignment: "staff_assignment2_am",
                workloadType: db.collection("workload_types").doc("med_review"),
                count: 30,
                timeMinutes: 360,
                notes: "",
            },
        ],
        assignment3: [
            {
                staffAssignment: "staff_assignment3_am",
                workloadType: db
                    .collection("workload_types")
                    .doc("med_history"),
                count: 5,
                timeMinutes: 75,
                notes: "",
            },
            {
                staffAssignment: "staff_assignment3_am",
                workloadType: db.collection("workload_types").doc("med_review"),
                count: 18,
                timeMinutes: 216,
                notes: "",
            },
        ],
        assignment4: [
            {
                staffAssignment: "staff_assignment4_am",
                workloadType: db
                    .collection("workload_types")
                    .doc("med_history"),
                count: 20,
                timeMinutes: 300,
                notes: "",
            },
            {
                staffAssignment: "staff_assignment4_am",
                workloadType: db.collection("workload_types").doc("med_review"),
                count: 35,
                timeMinutes: 420,
                notes: "High patient turnover today",
            },
        ],
    };

    // Create workload entries for this ward assignment
    if (workloadData[assignmentId]) {
        for (let i = 0; i < workloadData[assignmentId].length; i++) {
            const entryData = workloadData[assignmentId][i];
            await wardAssignmentRef
                .collection("workload_entries")
                .doc(`entry${i + 1}`)
                .set({
                    ...entryData,
                    staffAssignment: wardAssignmentRef
                        .collection("staff_assignments")
                        .doc(entryData.staffAssignment),
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedById: "system",
                    createdById: "system",
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
        }
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
