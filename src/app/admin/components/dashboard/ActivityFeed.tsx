type Activity = {
    id: number;
    time: string;
    user: string;
    action: "Created" | "Updated" | "Deleted" | "Assigned" | "Completed";
    details: string;
};

export default function ActivityFeed() {
    const activities: Activity[] = [
        {
            id: 1,
            time: "10:45 AM",
            user: "John Smith",
            action: "Created",
            details: "Added 12 medication histories for Ward 1",
        },
        {
            id: 2,
            time: "10:30 AM",
            user: "Emma Wilson",
            action: "Updated",
            details: "Updated TTO count for Ward 5",
        },
        {
            id: 3,
            time: "10:15 AM",
            user: "Admin User",
            action: "Assigned",
            details: "Assigned Michael Brown to Ward 9",
        },
        {
            id: 4,
            time: "09:50 AM",
            user: "Sarah Johnson",
            action: "Completed",
            details: "Completed medication reviews for Ward 10",
        },
        {
            id: 5,
            time: "09:30 AM",
            user: "David Lee",
            action: "Deleted",
            details: "Removed duplicate entry for Ward 13",
        },
    ];

    const getTagClass = (action: Activity["action"]) => {
        switch (action) {
            case "Created":
                return "is-success";
            case "Updated":
                return "is-info";
            case "Deleted":
                return "is-danger";
            case "Assigned":
                return "is-warning";
            case "Completed":
                return "is-primary";
            default:
                return "is-light";
        }
    };

    return (
        <div className="table-container">
            <table className="table is-fullwidth is-hoverable">
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>User</th>
                        <th>Action</th>
                        <th>Details</th>
                    </tr>
                </thead>
                <tbody>
                    {activities.map((activity) => (
                        <tr key={activity.id}>
                            <td>{activity.time}</td>
                            <td>{activity.user}</td>
                            <td>
                                <span
                                    className={`tag ${getTagClass(activity.action)}`}
                                >
                                    {activity.action}
                                </span>
                            </td>
                            <td>{activity.details}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
