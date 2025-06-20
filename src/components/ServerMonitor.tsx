import React, { useEffect, useState } from 'react';

interface ServerStatus {
    id: string;
    name: string;
    status: string;
    cpuUsage: number;
    memoryUsage: number;
}

const serverList = [
    { id: 'abc123', name: 'Main Web Server' },
    { id: 'def456', name: 'Game Server #1' },
];

const ServerMonitor = () => {
    const [statuses, setStatuses] = useState<ServerStatus[]>([]);

    const fetchServerStatus = async () => {
        const results: ServerStatus[] = [];

        for (const server of serverList) {
            try {
                const res = await fetch(`/api/ptero/status/${server.id}`);
                const data = await res.json();
                results.push({
                    id: server.id,
                    name: server.name,
                    status: data.attributes.current_state,
                    cpuUsage: data.attributes.resources.cpu_absolute,
                    memoryUsage: data.attributes.resources.memory_bytes,
                });
            } catch (err) {
                results.push({
                    id: server.id,
                    name: server.name,
                    status: 'offline',
                    cpuUsage: 0,
                    memoryUsage: 0,
                });
            }
        }

        setStatuses(results);
    };

    useEffect(() => {
        fetchServerStatus();
        const interval = setInterval(fetchServerStatus, 10000); // Auto-refresh every 10s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {statuses.map((server) => (
                <div
                    key={server.id}
                    className="rounded-xl bg-white/5 p-4 text-white border border-white/10 backdrop-blur"
                >
                    <h3 className="text-xl font-semibold">{server.name}</h3>
                    <p>Status: <span className={`font-bold ${server.status === 'running' ? 'text-green-400' : 'text-red-400'}`}>{server.status}</span></p>
                    <p>CPU Usage: {server.cpuUsage.toFixed(1)}%</p>
                    <p>Memory Usage: {(server.memoryUsage / 1024 / 1024).toFixed(1)} MB</p>
                </div>
            ))}
        </div>
    );
};

export default ServerMonitor;
