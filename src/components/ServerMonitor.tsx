import React, { useEffect, useState, useRef } from 'react';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const servers = [
    { id: '83921b2c', name: 'X-Ample Ultimate Discord Bot' },
    { id: '42bcdf30', name: 'X-Ample Support Bot' },
    { id: 'c02dad34', name: 'AdvertHub Bot' },
    { id: '29d3af00', name: 'X-Ample Dummy Server' },
];

type ServerStatus = {
    name: string;
    status: string;
    cpu: number;
    memory: number;
    networkRx: number;
    networkTx: number;
    uptime: number;
    isSuspended: boolean;
    timestamp: number;
};

const ServerMonitor = () => {
    const [data, setData] = useState<ServerStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [refreshInterval, setRefreshInterval] = useState(10000);
    const historyRef = useRef<Record<string, ServerStatus[]>>({}); // store history per server

    // Fetch server statuses
    const fetchStatuses = async () => {
        setLoading(true);
        const results = await Promise.all(
            servers.map(async (server) => {
                try {
                    const res = await fetch(`/.netlify/functions/status?id=${server.id}`);
                    const json = await res.json();
                    const attr = json.attributes || {};
                    const resources = attr.resources || {};
                    const statusObj: ServerStatus = {
                        name: server.name,
                        status: attr.current_state || 'unknown',
                        cpu: resources.cpu_absolute || 0,
                        memory: resources.memory_bytes || 0,
                        networkRx: resources.network_rx_bytes || 0,
                        networkTx: resources.network_tx_bytes || 0,
                        uptime: resources.uptime || 0,
                        isSuspended: attr.is_suspended || false,
                        timestamp: Date.now(),
                    };

                    // Add to history
                    if (!historyRef.current[server.id]) historyRef.current[server.id] = [];
                    historyRef.current[server.id].push(statusObj);

                    // Keep last 30 entries (~5 minutes if fetching every 10s)
                    if (historyRef.current[server.id].length > 30) {
                        historyRef.current[server.id].shift();
                    }

                    return statusObj;
                } catch {
                    return {
                        name: server.name,
                        status: 'error',
                        cpu: 0,
                        memory: 0,
                        networkRx: 0,
                        networkTx: 0,
                        uptime: 0,
                        isSuspended: false,
                        timestamp: Date.now(),
                    };
                }
            }),
        );
        setData(results);
        setLoading(false);
    };

    useEffect(() => {
        fetchStatuses();
        const interval = setInterval(fetchStatuses, refreshInterval);
        return () => clearInterval(interval);
    }, [refreshInterval]);

    // Server control stubs (replace with your API calls)
    const controlServer = async (serverId: string, action: 'start' | 'stop' | 'restart') => {
        try {
            // Example POST request to your backend API for server control
            // Replace URL and body with your actual API specs
            await fetch(`/.netlify/functions/control`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: serverId, action }),
            });
            alert(`${action} command sent to server ${serverId}`);
            fetchStatuses(); // refresh data after control action
        } catch {
            alert(`Failed to ${action} server ${serverId}`);
        }
    };

    // Filter data by server name or status
    const filteredData = data.filter(
        (srv) =>
            srv.name.toLowerCase().includes(filter.toLowerCase()) ||
            srv.status.toLowerCase().includes(filter.toLowerCase()),
    );

    // Export to CSV helper
    const exportToCSV = () => {
        let csvContent = 'data:text/csv;charset=utf-8,';
        csvContent += 'Server,Status,CPU %,Memory MB,Network RX,Network TX,Uptime (s),Suspended,Timestamp\n';
        data.forEach((srv) => {
            csvContent += `${srv.name},${srv.status},${srv.cpu.toFixed(1)},${(srv.memory / 1024 / 1024).toFixed(1)},${srv.networkRx},${srv.networkTx},${srv.uptime},${srv.isSuspended},${new Date(srv.timestamp).toISOString()}\n`;
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.href = encodedUri;
        link.download = `server_status_${Date.now()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Format uptime in HH:MM:SS
    const formatUptime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="p-4 max-w-6xl mx-auto">
            <h1 className="text-white text-3xl mb-4 font-bold">Server Monitor</h1>

            {/* Controls */}
            <div className="flex flex-col md:flex-row md:items-center mb-4 gap-4">
                <input
                    type="text"
                    placeholder="Search servers or status..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="p-2 rounded bg-gray-700 text-white flex-grow"
                />
                <select
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(Number(e.target.value))}
                    className="p-2 rounded bg-gray-700 text-white w-48"
                >
                    <option value={5000}>Refresh: 5 seconds</option>
                    <option value={10000}>Refresh: 10 seconds</option>
                    <option value={30000}>Refresh: 30 seconds</option>
                    <option value={60000}>Refresh: 1 minute</option>
                </select>
                <button
                    onClick={exportToCSV}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
                >
                    Export CSV
                </button>
            </div>

            {loading && <p className="text-white">Loading...</p>}

            {/* Server Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredData.map((server) => {
                    const history = historyRef.current[servers.find((s) => s.name === server.name)?.id || ''] || [];

                    return (
                        <div
                            key={server.name}
                            className="bg-white/5 border border-white/10 p-4 rounded-xl text-white flex flex-col"
                        >
                            <h3 className="text-lg font-bold mb-2">{server.name}</h3>
                            <p>
                                Status:{' '}
                                <span
                                    className={
                                        server.status === 'running'
                                            ? 'text-green-400'
                                            : server.status === 'starting'
                                                ? 'text-yellow-400'
                                                : 'text-red-400'
                                    }
                                >
                                    {server.status}
                                </span>
                            </p>
                            <p>CPU Usage: {server.cpu.toFixed(1)}%</p>
                            <p>Memory: {(server.memory / 1024 / 1024).toFixed(1)} MB</p>
                            <p>Network RX: {(server.networkRx / 1024 / 1024).toFixed(2)} MB</p>
                            <p>Network TX: {(server.networkTx / 1024 / 1024).toFixed(2)} MB</p>
                            <p>Uptime: {formatUptime(server.uptime)}</p>
                            <p>Suspended: {server.isSuspended ? 'Yes' : 'No'}</p>

                            {/* Server Controls */}
                            <div className="mt-3 flex gap-2 flex-wrap">
                                <button
                                    onClick={() => controlServer(servers.find((s) => s.name === server.name)?.id || '', 'start')}
                                    className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded"
                                    disabled={server.status === 'running'}
                                >
                                    Start
                                </button>
                                <button
                                    onClick={() => controlServer(servers.find((s) => s.name === server.name)?.id || '', 'stop')}
                                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
                                    disabled={server.status === 'stopped' || server.status === 'error'}
                                >
                                    Stop
                                </button>
                                <button
                                    onClick={() => controlServer(servers.find((s) => s.name === server.name)?.id || '', 'restart')}
                                    className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded"
                                >
                                    Restart
                                </button>
                            </div>

                            {/* Chart for history */}
                            {history.length > 1 && (
                                <div className="mt-4" style={{ height: 200 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={history}>
                                            <XAxis
                                                dataKey="timestamp"
                                                tickFormatter={(timestamp) =>
                                                    new Date(timestamp).toLocaleTimeString()
                                                }
                                            />
                                            <YAxis domain={[0, 100]} />
                                            <Tooltip
                                                labelFormatter={(label) =>
                                                    new Date(label).toLocaleTimeString()
                                                }
                                            />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="cpu"
                                                stroke="#8884d8"
                                                dot={false}
                                                name="CPU %"
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey={(d) => d.memory / 1024 / 1024}
                                                stroke="#82ca9d"
                                                dot={false}
                                                name="Memory MB"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ServerMonitor;
