import { getUser } from "@/services/userService";
import { getOrg } from "@/services/orgService";
import { getDep } from "@/services/depService";

export async function canUserLogin(authUid: string): Promise<boolean> {
    if (!authUid) {
        return false;
    }

    try {
        const user = await getUser(authUid);

        if (!user) {
            return false;
        }

        if (user.role === "admin") {
            return true;
        }

        if (!user.orgId || !user.departmentId) {
            return false;
        }

        const [organisation, department] = await Promise.all([
            getOrg(user.orgId),
            getDep(user.departmentId),
        ]);

        if (!organisation || !department) {
            return false;
        }

        return organisation.active && department.active;
    } catch (error) {
        console.error("canUserLogin Helper - Error fetching data:", error);
        return false;
    }
}
