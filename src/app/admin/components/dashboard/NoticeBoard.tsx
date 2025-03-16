import { useState } from "react";

type Notice = {
    id: number;
    title: string;
    content: string;
    type: "info" | "warning" | "primary" | "danger";
};

export default function NoticeBoard() {
    const [notices, setNotices] = useState<Notice[]>([
        {
            id: 1,
            title: "System Update",
            content:
                "The system will be updated tonight between 2-3 AM. Please save all work before leaving.",
            type: "info",
        },
        {
            id: 2,
            title: "Staff Meeting",
            content:
                "Reminder: Staff meeting today at 2:00 PM in Conference Room B.",
            type: "warning",
        },
        {
            id: 3,
            title: "New Protocol",
            content:
                "New medication reconciliation protocol is now in effect. Please review the updated guidelines.",
            type: "primary",
        },
    ]);
    const [newNotice, setNewNotice] = useState("");

    const removeNotice = (id: number) => {
        setNotices(notices.filter((notice) => notice.id !== id));
    };

    const addNotice = () => {
        if (newNotice.trim()) {
            const notice: Notice = {
                id: Date.now(),
                title: "New Announcement",
                content: newNotice,
                type: "info",
            };
            setNotices([notice, ...notices]);
            setNewNotice("");
        }
    };

    return (
        <div className="box mb-5">
            <h3 className="title is-4">Notices</h3>

            {notices.map((notice) => (
                <article
                    key={notice.id}
                    className={`message is-${notice.type}`}
                >
                    <div className="message-header">
                        <p>{notice.title}</p>
                        <button
                            className="delete"
                            aria-label="delete"
                            onClick={() => removeNotice(notice.id)}
                        ></button>
                    </div>
                    <div className="message-body">{notice.content}</div>
                </article>
            ))}

            <div className="field">
                <div className="control">
                    <textarea
                        className="textarea is-small"
                        placeholder="Add a new notice..."
                        value={newNotice}
                        onChange={(e) => setNewNotice(e.target.value)}
                    ></textarea>
                </div>
                <div className="control mt-2">
                    <button
                        className="button is-small is-primary"
                        onClick={addNotice}
                    >
                        Post Notice
                    </button>
                </div>
            </div>
        </div>
    );
}
