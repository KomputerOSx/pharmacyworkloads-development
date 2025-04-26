import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/config/firebase";
import { User } from "@/types/userTypes";

const mailCol = collection(db, "mail");

// creating a create mail function in firestore collection
export async function createMail(to: string[], subject: string, body: string) {
    try {
        const mailRef = await addDoc(mailCol, {
            to,
            message: {
                subject,
                text: body,
            },
            createdAt: serverTimestamp(),
        });
        console.log("Mail sent with ID: ", mailRef.id);
    } catch (error) {
        console.error("Error sending mail: ", error);
    }
}

export const emailTemplates = {
    welcome: (name: string) => ({
        subject: "Welcome to our service!",
        body: `Hello ${name},\n\nWelcome to our service! We are glad to have you on board.\n\nBest regards,\nThe Team`,
    }),
    published_rota: (
        currentUser: User,
        teamName: string,
        weekNumber: number,
        weekYear: number,
    ) => ({
        subject: `Rota Published for ${teamName} - Week ${weekNumber}/${weekYear}`,
        body: `Hello, \n\nThe rota for ${teamName} has been published for week ${weekNumber}/${weekYear}. \n\nBest regards,\n${currentUser.firstName} ${currentUser.lastName}`,
    }),
    updates_to_rota: (
        currentUser: User,
        teamName: string,
        weekNumber: number,
        weekYear: number,
    ) => ({
        subject: `Updates to Rota for ${teamName} - Week ${weekNumber}/${weekYear}`,
        body: `Hello, \n\nThere have been updates to the rota for ${teamName} for week ${weekNumber}/${weekYear}. \n\nBest regards,\n${currentUser.firstName} ${currentUser.lastName}`,
    }),
};
