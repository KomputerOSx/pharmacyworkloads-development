export default function DashboardSummary() {
    return (
        <div className="columns is-multiline">
            <div className="column is-3">
                <div className="notification is-primary has-text-centered">
                    <p className="heading">Medication Histories</p>
                    <p className="title">126</p>
                </div>
            </div>
            <div className="column is-3">
                <div className="notification is-info has-text-centered">
                    <p className="heading">Medication Reviews</p>
                    <p className="title">258</p>
                </div>
            </div>
            <div className="column is-3">
                <div className="notification is-success has-text-centered">
                    <p className="heading">TTOs</p>
                    <p className="title">48</p>
                </div>
            </div>
            <div className="column is-3">
                <div className="notification is-warning has-text-centered">
                    <p className="heading">Assigned Staff</p>
                    <p className="title">22</p>
                </div>
            </div>
        </div>
    );
}
