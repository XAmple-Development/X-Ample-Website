import React, { useState } from "react";
import { motion } from "framer-motion";
import XAmpleLogo from "@/assets/logo/xample-logo.png"; // Replace with your logo path

const TABS = [
    { label: "Uptime", value: "" },
    { label: "Maintenance", value: "maintenance" },
    { label: "Incidents", value: "incidents" },
];

const StatusPage = () => {
    const [activeTab, setActiveTab] = useState("");
    const [isLoaded, setIsLoaded] = useState(false);

    const iframeUrl = `https://status.x-ampledevelopment.com/${activeTab}`;

    return (
        <section className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-900 flex flex-col items-center justify-center px-4 py-12">
            <div className="w-full max-w-6xl space-y-6">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">
                        System Status
                    </h1>
                    <p className="text-slate-300 text-lg">
                        Live uptime, response time & incident history
                    </p>
                </div>

                <div className="flex justify-center gap-4 mb-4">
                    {TABS.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => {
                                setActiveTab(tab.value);
                                setIsLoaded(false);
                            }}
                            className={`px-4 py-2 rounded-full border text-white text-sm transition-all backdrop-blur-md
                ${activeTab === tab.value
                                    ? "bg-white/20 border-white/30"
                                    : "bg-white/5 border-white/10 hover:bg-white/10"}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl backdrop-blur-md bg-white/5 relative">
                    {!isLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/50 text-white">
                            <span className="animate-pulse">Loading status page...</span>
                        </div>
                    )}

                    <motion.iframe
                        key={iframeUrl}
                        src={iframeUrl}
                        title="BetterStack Status Page"
                        className="w-full h-[80vh] rounded-2xl border-none"
                        loading="lazy"
                        onLoad={() => setIsLoaded(true)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isLoaded ? 1 : 0 }}
                        transition={{ duration: 0.6 }}
                    />
                </div>

                <div className="text-center mt-4">
                    <img src={XAmpleLogo} alt="X-Ample Development" className="w-8 h-8 mx-auto mb-1" />
                    <p className="text-xs text-slate-400">Status monitoring by X-Ample Development</p>
                </div>
            </div>
        </section>
    );
};

export default StatusPage;
