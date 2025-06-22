import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

const StatusPage = () => {
    const [tab, setTab] = useState('uptime');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStatus = async () => {
            setLoading(true);
            try {
                const res = await fetch('/.netlify/functions/getstatus');
                if (!res.ok) throw new Error('Failed to fetch');
                const json = await res.json();
                setData(json);
            } catch (err) {
                console.error(err);
                setError('Unable to load status data.');
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 5 * 60 * 1000); // auto-refresh

        return () => clearInterval(interval);
    }, []);

    const renderMonitors = () =>
        data?.monitors?.length ? (
            data.monitors.map((monitor: any) => (
                <div
                    key={monitor.id}
                    className="bg-white/5 p-4 rounded-xl border border-white/10 text-white"
                >
                    <h3 className="text-xl font-semibold">
                        {monitor.attributes.pronounceable_name}
                    </h3>
                    <p className="text-sm text-gray-300">
                        Status:{' '}
                        <span
                            className={
                                monitor.attributes.status === 'up'
                                    ? 'text-green-400'
                                    : 'text-red-400'
                            }
                        >
                            {monitor.attributes.status.charAt(0).toUpperCase() +
                                monitor.attributes.status.slice(1)}
                        </span>
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                        Last Checked:{' '}
                        {new Date(monitor.attributes.last_checked_at).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">
                        URL:{' '}
                        <span className="underline break-all">
                            {monitor.attributes.url}
                        </span>
                    </p>
                </div>
            ))
        ) : (
            <p className="text-white/70">No monitors found.</p>
        );


    const renderIncidents = () =>
        data?.incidents?.length ? (
            data.incidents.map((incident: any) => (
                <div
                    key={incident.id}
                    className="bg-red-900/30 p-4 rounded-xl border border-red-700/30 text-white"
                >
                    <h3 className="font-semibold">{incident.attributes.name}</h3>
                    <p>
                        {incident.attributes.resolved_at ? 'Resolved' : 'Ongoing'} —{' '}
                        {new Date(incident.attributes.started_at).toLocaleString()}
                    </p>
                </div>
            ))
        ) : (
            <p className="text-white/70">No incidents reported.</p>
        );

    const renderMaintenance = () =>
        data?.scheduled_maintenances?.length ? (
            data.scheduled_maintenances.map((event: any) => (
                <div
                    key={event.id}
                    className="bg-yellow-800/30 p-4 rounded-xl border border-yellow-600/30 text-white"
                >
                    <h3 className="font-semibold">{event.attributes.name}</h3>
                    <p>{new Date(event.attributes.scheduled_for).toLocaleString()}</p>
                </div>
            ))
        ) : (
            <p className="text-white/70">No maintenance scheduled.</p>
        );

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
                            <div className="flex justify-center py-10">
                                <Loader2 className="animate-spin w-6 h-6 text-white" />
                            </div>
                        ) : error ? (
                            <p className="text-red-500 text-center">{error}</p>
                        ) : (
                            renderMonitors()
                        )}
                    </TabsContent>

                    <TabsContent value="incidents">
                        {loading ? (
                            <div className="flex justify-center py-10">
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
                            <div className="flex justify-center py-10">
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
