import { getUser } from "@/services/admin/userService";
import { getOrg } from "@/services/admin/orgService";
import { getDep } from "@/services/admin/depService";

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
