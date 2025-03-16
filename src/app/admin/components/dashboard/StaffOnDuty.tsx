type StaffAssignment = {
    id: number;
    name: string;
    department: string;
};

export default function StaffOnDuty() {
    const amShift: StaffAssignment[] = [
        { id: 1, name: "John Smith", department: "COTE" },
        { id: 2, name: "Emma Wilson", department: "MEDS" },
        { id: 3, name: "Michael Brown", department: "SURG" },
        { id: 4, name: "David Lee", department: "EMRG" },
    ];

    const pmShift: StaffAssignment[] = [
        { id: 5, name: "Emma Wilson", department: "COTE" },
        { id: 6, name: "Sarah Johnson", department: "MEDS" },
        { id: 7, name: "Michael Brown", department: "SURG" },
        { id: 8, name: "David Lee", department: "EMRG" },
    ];

    return (
        <div className="box">
            <h3 className="title is-4">Staff On Duty</h3>
            <div className="content">
                <h5 className="has-text-primary">AM Shift</h5>
                <ul>
                    {amShift.map((staff) => (
                        <li key={staff.id}>
                            {staff.name} - {staff.department}
                        </li>
                    ))}
                </ul>

                <h5 className="has-text-info">PM Shift</h5>
                <ul>
                    {pmShift.map((staff) => (
                        <li key={staff.id}>
                            {staff.name} - {staff.department}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
