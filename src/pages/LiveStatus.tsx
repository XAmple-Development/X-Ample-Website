import React from 'react';

const StatusPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="bg-white/5 border border-white/10 backdrop-blur-md text-white rounded-2xl shadow-lg p-6">
                    <h1 className="text-3xl font-bold mb-2">System Status</h1>
                    <p className="text-gray-300 mb-4">Live uptime and incident information from BetterStack</p>

                    <div className="rounded-xl overflow-hidden border border-white/10 shadow-lg">
                        <iframe
                            src="https://status.x-ampledevelopment.com"
                            title="BetterStack Status Page"
                            className="w-full h-[80vh] bg-white"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatusPage;
