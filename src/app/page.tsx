"use client";

import React from "react";
import NoticeBoard from "@/components/noticeBoard/NoticeBoard";
import "../context/sampleData1";
import RenderTabContent from "@/components/RenderTabContent";

function Home() {
    return (
        <main>
            <div className="container">
                <h1 className="title is-1">
                    Pharmacy Directorate Workload Tracker
                </h1>

                <div className="is-flex is-justify-content-flex-end mb-3">
                    <div className="has-text-grey">
                        {new Date().toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </div>
                </div>

                <NoticeBoard />

                <RenderTabContent />
            </div>
        </main>
    );
}

export default Home;
