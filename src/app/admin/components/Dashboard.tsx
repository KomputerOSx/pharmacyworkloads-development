import DashboardSummary from "./dashboard/DashboardSummary";
import ActivityFeed from "./dashboard/ActivityFeed";
import NoticeBoard from "./dashboard/NoticeBoard";
import StaffOnDuty from "./dashboard/StaffOnDuty";

export default function Dashboard() {
    return (
        <div className="columns">
            <div className="column is-8">
                <div className="box">
                    <h3 className="title is-4">Today&apos;s Overview</h3>
                    <DashboardSummary />

                    <h4 className="title is-5 mt-5">Department Workload</h4>
                    <div className="mb-4">
                        <div className="is-flex is-justify-content-space-between mb-1">
                            <span>COTE</span>
                            <span>35%</span>
                        </div>
                        <progress
                            className="progress is-primary"
                            value="35"
                            max="100"
                        >
                            COTE: 35%
                        </progress>
                    </div>

                    <div className="mb-4">
                        <div className="is-flex is-justify-content-space-between mb-1">
                            <span>MEDS</span>
                            <span>28%</span>
                        </div>
                        <progress
                            className="progress is-link"
                            value="28"
                            max="100"
                        >
                            MEDS: 28%
                        </progress>
                    </div>

                    <div className="mb-4">
                        <div className="is-flex is-justify-content-space-between mb-1">
                            <span>SURG</span>
                            <span>22%</span>
                        </div>
                        <progress
                            className="progress is-info"
                            value="22"
                            max="100"
                        >
                            SURG: 22%
                        </progress>
                    </div>

                    <div className="mb-4">
                        <div className="is-flex is-justify-content-space-between mb-1">
                            <span>EMRG</span>
                            <span>15%</span>
                        </div>
                        <progress
                            className="progress is-warning"
                            value="15"
                            max="100"
                        >
                            EMRG: 15%
                        </progress>
                    </div>
                </div>

                <div className="box">
                    <h3 className="title is-4">Recent Activity</h3>
                    <ActivityFeed />
                </div>
            </div>

            <div className="column is-4">
                <NoticeBoard />
                <StaffOnDuty />
            </div>
        </div>
    );
}
