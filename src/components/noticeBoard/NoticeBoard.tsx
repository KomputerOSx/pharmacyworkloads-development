"use client";

import React, { useEffect, useState } from "react";

interface Notice {
    id: number;
    text: string;
    timestamp: string;
}

const NoticeBoard: React.FC = () => {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [newNotice, setNewNotice] = useState("");

    // Load sample notices when component mounts
    useEffect(() => {
        const sampleNotices = [
            {
                id: 1,
                text: "Welcome to the new Pharmacy Directorate Workload Tracker system!",
                timestamp: new Date().toLocaleString(),
            },
            {
                id: 2,
                text: "Remember to complete your ward assignments by 9:30 AM each morning.",
                timestamp: new Date().toLocaleString(),
            },
            {
                id: 3,
                text: "Staff meeting today at 2:00 PM in Conference Room B.",
                timestamp: new Date().toLocaleString(),
            },
        ];

        setNotices(sampleNotices);
    }, []);

    const addNotice = () => {
        if (newNotice.trim()) {
            const notice = {
                id: Date.now(),
                text: newNotice.trim(),
                timestamp: new Date().toLocaleString(),
            };

            setNotices([notice, ...notices]);
            setNewNotice("");
        }
    };

    const deleteNotice = (id: number) => {
        setNotices(notices.filter((notice) => notice.id !== id));
    };

    return (
        <div className="notification is-warning is-light mb-5">
            <div className="is-flex is-align-items-center mb-3">
                <span className="icon is-medium">
                    <i className="fas fa-bullhorn"></i>
                </span>
                <h3 className="title is-4 ml-2 mb-0">Notice Board</h3>
            </div>

            <div className="content">
                {notices.length === 0 ? (
                    <p className="has-text-grey is-italic">
                        No notices yet. Add one below!
                    </p>
                ) : (
                    <ul className="mb-4">
                        {notices.map((notice) => (
                            <li
                                key={notice.id}
                                className="is-flex is-justify-content-space-between is-align-items-center mb-2 p-2 has-background-warning-light"
                            >
                                <div>
                                    {notice.text}
                                    <span className="has-text-grey is-size-7 ml-2">
                                        {notice.timestamp}
                                    </span>
                                </div>
                                <button
                                    className="button is-small is-danger"
                                    onClick={() => deleteNotice(notice.id)}
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="field has-addons">
                <div className="control is-expanded">
                    <input
                        className="input"
                        type="text"
                        placeholder="Add a notice..."
                        value={newNotice}
                        onChange={(e) => setNewNotice(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addNotice()}
                    />
                </div>
                <div className="control">
                    <button className="button is-info" onClick={addNotice}>
                        Post
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NoticeBoard;
