import React, { useState, useEffect } from 'react';

interface ServerStats {
    current_state: string;
    is_suspended: boolean;
    resources: {
        memory_bytes: number;
        cpu_absolute: number;
        disk_bytes: number;
        network_rx_bytes: number;
        network_tx_bytes: number;
        uptime: number;
    };
}

interface ServerMonitorProps {
    serverId: string;
    serverName: string;
}

const bytesToMB = (bytes: number) => (bytes / (1024 * 1024)).toFixed(1);
const bytesToGB = (bytes: number) => (bytes / (1024 * 1024 * 1024)).toFixed(2);

// Format uptime seconds to human-readable (days/hours/minutes/seconds)
function formatUptime(seconds: number) {
    let remaining = seconds;
    const days = Math.floor(remaining / 86400);
    remaining %= 86400;
    const hours = Math.floor(remaining / 3600);
    remaining %= 3600;
    const minutes = Math.floor(remaining / 60);
    const secs = remaining % 60;

    return (
        (days > 0 ? days + 'd ' : '') +
        (hours > 0 ? hours + 'h ' : '') +
        (minutes > 0 ? minutes + 'm ' : '') +
        secs + 's'
    );
}

// Return color based on status
function statusColor(status: string, isSuspended: boolean) {
    if (isSuspended) return 'text-red-500 bg-red-100';
    switch (status.toLowerCase()) {
        case 'running':
            return 'text-green-600 bg-green-100';
        case 'starting':
            return 'text-yellow-600 bg-yellow-100';
        case 'stopping':
            return 'text-orange-600 bg-orange-100';
        case 'offline':
        case 'suspended':
            return 'text-red-600 bg-red-100';
        default:
            return 'text-gray-600 bg-gray-100';
    }
}

const ServerMonitor: React.FC<{ servers: ServerMonitorProps[] }> = ({ servers }) => {
    const [stats, setStats] = useState<Record<string, ServerStats | null>>({});
    const [loading, setLoading] = useState(false);

    const fetchStatus = async (id: string) => {
        try {
            const res = await fetch(`/.netlify/functions/status?id=${id}`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            return data.attributes;
        } catch (error) {
            console.error(`Error fetching server ${id} status:`, error);
            return null;
        }
    };

    const fetchAllStatuses = async () => {
        setLoading(true);
        const results: Record<string, ServerStats | null> = {};
        await Promise.all(
            servers.map(async (server) => {
                results[server.serverId] = await fetchStatus(server.serverId);
            })
        );
        setStats(results);
        setLoading(false);
    };

    useEffect(() => {
        fetchAllStatuses();
        const interval = setInterval(fetchAllStatuses, 30000); // refresh every 30s
        return () => clearInterval(interval);
    }, [servers]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-white text-2xl font-semibold">Server Monitor</h2>
                <button
                    onClick={fetchAllStatuses}
                    disabled={loading}
                    className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-md transition disabled:opacity-50"
                    title="Refresh Status"
                >
                    {loading ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {servers.map(({ serverId, serverName }) => {
                const stat = stats[serverId];
                if (!stat)
                    return (
                        <div
                            key={serverId}
                            className="bg-white/10 backdrop-blur-md p-4 rounded-lg text-white"
                        >
                            <h3 className="text-xl font-bold">{serverName}</h3>
                            <p className="text-red-400">Failed to load data</p>
                        </div>
                    );

                return (
                    <div
                        key={serverId}
                        className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-md text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    >
                        <div>
                            <h3 className="text-xl font-bold">{serverName}</h3>
                            <span
                                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusColor(
                                    stat.current_state,
                                    stat.is_suspended
                                )}`}
                            >
                                Status: {stat.current_state}{stat.is_suspended ? ' (Suspended)' : ''}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                            <div>
                                <strong>CPU Usage:</strong> {(stat.resources.cpu_absolute * 100).toFixed(1)}%
                            </div>
                            <div>
                                <strong>Memory:</strong> {bytesToMB(stat.resources.memory_bytes)} MB
                            </div>
                            <div>
                                <strong>Disk Usage:</strong> {bytesToMB(stat.resources.disk_bytes)} MB
                            </div>
                            <div>
                                <strong>Network RX:</strong> {bytesToMB(stat.resources.network_rx_bytes)} MB
                            </div>
                            <div>
                                <strong>Network TX:</strong> {bytesToMB(stat.resources.network_tx_bytes)} MB
                            </div>
                            <div>
                                <strong>Uptime:</strong> {formatUptime(stat.resources.uptime)}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ServerMonitor;
