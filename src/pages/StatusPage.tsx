import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

const StatusPage = () => {
    const [tab, setTab] = useState('uptime');
    const [loading, setLoading] = useState(true);
    const [statusData, setStatusData] = useState<{
        page?: any;
        monitors?: any[];
        incidents?: any[];
        scheduled_maintenances?: any[];
    } | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchStatus = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('/.netlify/functions/getstatus');
                if (!res.ok) throw new Error(`HTTP error ${res.status}`);
                const json = await res.json();
                if (isMounted) setStatusData(json);
            } catch (err: any) {
                console.error('Error fetching status:', err);
                if (isMounted) setError('Failed to load status data. Please try again later.');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchStatus();

        // Auto-refresh every 5 minutes
        const interval = setInterval(fetchStatus, 5 * 60 * 1000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    const renderUptime = () => {
        if (!statusData?.monitors || statusData.monitors.length === 0) {
            return <p className="text-white/70">No monitors found.</p>;
        }

        return (
            <div className="space-y-4">
                {statusData.monitors.map((service, idx) => (
                    <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <h3 className="text-xl font-bold text-white">{service.attributes.name}</h3>
                        <p className="text-sm text-gray-300">
                            Status:{' '}
                            <span
                                className={
                                    service.attributes.status === 'operational' ? 'text-green-400' : 'text-red-400'
                                }
                            >
                                {service.attributes.status}
                            </span>
                        </p>
                    </div>
                ))}
            </div>
        );
    };

    const renderIncidents = () => {
        if (!statusData?.incidents || statusData.incidents.length === 0) {
            return <p className="text-white/70">No incidents reported.</p>;
        }

        return (
            <div className="space-y-4">
                {statusData.incidents.map((incident, idx) => (
                    <div
                        key={idx}
                        className="bg-red-900/30 p-4 rounded-xl border border-red-700/30 text-white"
                    >
                        <h3 className="font-semibold">{incident.attributes.name}</h3>
                        <p>
                            {incident.attributes.resolved_at ? 'Resolved' : 'Ongoing'} —{' '}
                            {new Date(incident.attributes.started_at).toLocaleString()}
                        </p>
                    </div>
                ))}
            </div>
        );
    };

    const renderMaintenance = () => {
        if (
            !statusData?.scheduled_maintenances ||
            statusData.scheduled_maintenances.length === 0
        ) {
            return <p className="text-white/70">No upcoming maintenance events.</p>;
        }

        return (
            <div className="space-y-4">
                {statusData.scheduled_maintenances.map((event, idx) => (
                    <div
                        key={idx}
                        className="bg-yellow-800/30 p-4 rounded-xl border border-yellow-600/30 text-white"
                    >
                        <h3 className="font-semibold">{event.attributes.name}</h3>
                        <p>{new Date(event.attributes.scheduled_for).toLocaleString()}</p>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <motion.div
            className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-white">X-Ample System Status</h1>
                    <p className="text-gray-400 text-sm">
                        Live uptime and incident tracking for all X-Ample services.
                    </p>
                </div>

                <Tabs defaultValue="uptime" value={tab} onValueChange={setTab}>
                    <TabsList className="grid grid-cols-3 bg-white/10 text-white rounded-xl mb-6">
                        <TabsTrigger value="uptime" className="data-[state=active]:bg-white/20">
                            Uptime
                        </TabsTrigger>
                        <TabsTrigger value="incidents" className="data-[state=active]:bg-white/20">
                            Incidents
                        </TabsTrigger>
                        <TabsTrigger value="maintenance" className="data-[state=active]:bg-white/20">
                            Maintenance
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="uptime">
                        {loading ? (
                            <div className="flex justify-center items-center py-10">
                                <Loader2 className="animate-spin w-6 h-6 text-white" />
                            </div>
                        ) : error ? (
                            <p className="text-red-500 text-center">{error}</p>
                        ) : (
                            renderUptime()
                        )}
                    </TabsContent>

                    <TabsContent value="incidents">
                        {loading ? (
                            <div className="flex justify-center items-center py-10">
                                <Loader2 className="animate-spin w-6 h-6 text-white" />
                            </div>
                        ) : error ? (
                            <p className="text-red-500 text-center">{error}</p>
                        ) : (
                            renderIncidents()
                        )}
                    </TabsContent>

                    <TabsContent value="maintenance">
                        {loading ? (
                            <div className="flex justify-center items-center py-10">
                                <Loader2 className="animate-spin w-6 h-6 text-white" />
                            </div>
                        ) : error ? (
                            <p className="text-red-500 text-center">{error}</p>
                        ) : (
                            renderMaintenance()
                        )}
                    </TabsContent>
                </Tabs>

                <div className="mt-10 text-center text-white/50 text-sm">
                    Powered by <span className="text-purple-400 font-medium">BetterStack</span> — Styled by{' '}
                    <span className="text-blue-400 font-medium">X-Ample Development</span>
                </div>
            </div>
        </motion.div>
    );
};

export default StatusPage;
