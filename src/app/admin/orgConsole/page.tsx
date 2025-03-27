import { useQuery } from "@tanstack/react-query";

import "../styles/orgConsole.css";
import { OrgCard } from "@/app/admin/orgConsole/components/OrgCard";
import AddOrgCard from "@/app/admin/orgConsole/components/AddOrgCard";
import { getOrgs } from "@/services/orgService";

export default function OrgConsole() {
    const { data: orgs, isLoading } = useQuery({
        queryFn: () => getOrgs(),
        queryKey: ["orgs"],
    });

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1 className="container scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                Taxing Laughter: The Joke Tax Chronicles
            </h1>
            <div className={"card-list"}>
                <div className={"card"}>
                    <AddOrgCard />
                </div>

                {orgs?.map((org) => (
                    <div key={org.id} className={"card"}>
                        <OrgCard key={org.id} org={org} />
                    </div>
                ))}
            </div>
        </div>
    );
}
