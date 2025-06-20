import React, { useEffect, useState } from 'react';

const servers = [
    { id: 'abc123', name: 'Main Server' },
    { id: 'def456', name: 'Backup Server' },
];

const ServerMonitor = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchStatuses = async () => {
        setLoading(true);
        const results = await Promise.all(
            servers.map(async (server) => {
                try {
                    const res = await fetch(`/.netlify/functions/status?id=${server.id}`);
                    const json = await res.json();
                    return {
                        name: server.name,
                        status: json.attributes?.current_state || 'unknown',
                        cpu: json.attributes?.resources.cpu_absolute || 0,
                        memory: json.attributes?.resources.memory_bytes || 0,
                    };
                } catch (e) {
                    return { name: server.name, status: 'error', cpu: 0, memory: 0 };
                }
            })
        );
        setData(results);
        setLoading(false);
    };

    useEffect(() => {
        fetchStatuses();
        const interval = setInterval(fetchStatuses, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="grid md:grid-cols-2 gap-4">
            {loading ? (
                <p className="text-white">Loading...</p>
            ) : (
                data.map((server, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-xl text-white">
                        <h3 className="text-lg font-bold">{server.name}</h3>
                        <p>Status: <span className={server.status === 'running' ? 'text-green-400' : 'text-red-400'}>{server.status}</span></p>
                        <p>CPU Usage: {server.cpu.toFixed(1)}%</p>
                        <p>Memory: {(server.memory / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                ))
            )}
        </div>
    );
};

export default ServerMonitor;
