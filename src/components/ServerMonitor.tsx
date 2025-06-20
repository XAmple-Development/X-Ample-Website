import React, { useEffect, useState } from 'react';

const servers = [
    { id: '83921b2c', name: 'X-Ample Ultimate Discord Bot' },
    { id: '42bcdf30', name: 'X-Ample Support Bot' },
    { id: 'c02dad34', name: 'AdvertHub Bot' },
    { id: '29d3af00', name: 'X-Ample Dummy Server' },
];

// Helper: convert seconds or ms uptime to human-readable format
function formatUptime(uptimeSeconds: number) {
    const seconds = Math.floor(uptimeSeconds % 60);
    const minutes = Math.floor((uptimeSeconds / 60) % 60);
    const hours = Math.floor((uptimeSeconds / 3600) % 24);
    const days = Math.floor(uptimeSeconds / 86400);

    let result = '';
    if (days > 0) result += `${days}d `;
    if (hours > 0 || days > 0) result += `${hours}h `;
    if (minutes > 0 || hours > 0 || days > 0) result += `${minutes}m `;
    result += `${seconds}s`;
    return result.trim();
}

const statusColorClass = (status: string) => {
    switch (status.toLowerCase()) {
        case 'running': return 'bg-green-600 text-green-100';
        case 'starting': return 'bg-orange-600 text-orange-100';
        case 'suspended': return 'bg-red-600 text-red-100';
        case 'error': return 'bg-red-600 text-red-100';
        default: return 'bg-red-600 text-red-100';
    }
};

const ServerMonitor = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchStatuses = async () => {
        setLoading(true);
        const results = await Promise.all(
            servers.map(async (server) => {
                try {
                    const res = await fetch(`/.netlify/functions/status?id=${server.id}`);
                    if (!res.ok) throw new Error('Network response not ok');
                    const json = await res.json();

                    const uptimeSeconds = (json.attributes?.resources?.uptime ?? 0) / 1000; // assuming ms uptime, adjust if seconds

                    return {
                        name: server.name,
                        status: json.attributes?.current_state || 'unknown',
                        cpu: json.attributes?.resources?.cpu_absolute ?? null,
                        memory: json.attributes?.resources?.memory_bytes ?? null,
                        disk: json.attributes?.resources?.disk_bytes ?? null,
                        networkRx: json.attributes?.resources?.network_rx_bytes ?? null,
                        networkTx: json.attributes?.resources?.network_tx_bytes ?? null,
                        uptime: uptimeSeconds,
                    };
                } catch (e) {
                    return { name: server.name, status: 'error', cpu: null, memory: null, disk: null, networkRx: null, networkTx: null, uptime: 0 };
                }
            })
        );
        setData(results);
        setLoading(false);
    };

    useEffect(() => {
        fetchStatuses();
        const interval = setInterval(fetchStatuses, 30000); // 30 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="max-w-6xl mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Server Monitor</h2>
                <button
                    onClick={fetchStatuses}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                    disabled={loading}
                    aria-label="Refresh status"
                >
                    {loading ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
                {loading ? (
                    <p className="text-white">Loading...</p>
                ) : (
                    data.map((server) => (
                        <div key={server.name} className="bg-white/5 border border-white/10 p-6 rounded-xl text-white shadow-lg flex flex-col">
                            <h3 className="text-xl font-semibold mb-2">{server.name}</h3>

                            <p>
                                Status:{' '}
                                <span className={`inline-block px-2 py-1 rounded ${statusColorClass(server.status)}`}>
                                    {server.status}
                                </span>
                            </p>

                            <p>Uptime: {server.uptime > 0 ? formatUptime(server.uptime) : 'N/A'}</p>

                            <p>CPU Usage: {server.cpu !== null ? server.cpu.toFixed(1) + '%' : 'N/A'}</p>
                            <p>Memory: {server.memory !== null ? (server.memory / 1024 / 1024).toFixed(1) + ' MB' : 'N/A'}</p>
                            <p>Disk Usage: {server.disk !== null ? (server.disk / 1024 / 1024).toFixed(1) + ' MB' : 'N/A'}</p>

                            <p>Network RX: {server.networkRx !== null ? (server.networkRx / 1024 / 1024).toFixed(2) + ' MB' : 'N/A'}</p>
                            <p>Network TX: {server.networkTx !== null ? (server.networkTx / 1024 / 1024).toFixed(2) + ' MB' : 'N/A'}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ServerMonitor;
