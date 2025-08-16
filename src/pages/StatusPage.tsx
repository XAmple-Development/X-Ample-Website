import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Activity, AlertCircle, Clock, Zap, CheckCircle, XCircle, AlertTriangle, TrendingUp, Server, Globe, Wifi } from 'lucide-react';
import Header from '@/components/Header';
import SpaceBackground from '@/components/SpaceBackground';

const StatusPage = () => {
    const [tab, setTab] = useState('overview');
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
        const interval = setInterval(fetchStatus, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    const getOverallStatus = () => {
        if (!data?.monitors?.length) return { status: 'unknown', message: 'No data' };
        
        const downMonitors = data.monitors.filter((m: any) => m.attributes.status !== 'up');
        const activeIncidents = data.incidents?.filter((i: any) => !i.attributes.resolved_at) || [];
        
        if (activeIncidents.length > 0) {
            return { status: 'major', message: 'Major Service Issues' };
        } else if (downMonitors.length > 0) {
            return { status: 'minor', message: 'Minor Service Issues' };
        } else {
            return { status: 'operational', message: 'All Systems Operational' };
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'operational': return <CheckCircle className="w-6 h-6 text-emerald-400" />;
            case 'minor': return <AlertTriangle className="w-6 h-6 text-yellow-400" />;
            case 'major': return <XCircle className="w-6 h-6 text-red-400" />;
            default: return <Activity className="w-6 h-6 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'operational': return 'from-emerald-500/20 to-green-500/10 border-emerald-500/30';
            case 'minor': return 'from-yellow-500/20 to-orange-500/10 border-yellow-500/30';
            case 'major': return 'from-red-500/20 to-pink-500/10 border-red-500/30';
            default: return 'from-gray-500/20 to-slate-500/10 border-gray-500/30';
        }
    };

    const StatusMetrics = () => {
        if (!data?.monitors) return null;
        
        const uptime = ((data.monitors.filter((m: any) => m.attributes.status === 'up').length / data.monitors.length) * 100).toFixed(1);
        const responseTime = Math.floor(Math.random() * 100 + 50); // Mock response time
        
        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Services', value: data.monitors.length, icon: Server, color: 'text-blue-400' },
                    { label: 'Uptime', value: `${uptime}%`, icon: TrendingUp, color: 'text-emerald-400' },
                    { label: 'Response Time', value: `${responseTime}ms`, icon: Zap, color: 'text-purple-400' },
                    { label: 'Incidents', value: data.incidents?.length || 0, icon: AlertCircle, color: 'text-orange-400' }
                ].map((metric, index) => (
                    <motion.div
                        key={metric.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                                        <p className="text-2xl font-bold text-white">{metric.value}</p>
                                    </div>
                                    <metric.icon className={`w-8 h-8 ${metric.color}`} />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        );
    };

    const renderOverview = () => {
        const overallStatus = getOverallStatus();
        
        return (
            <div className="space-y-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className={`bg-gradient-to-br ${getStatusColor(overallStatus.status)} backdrop-blur-sm border p-8`}>
                        <div className="flex items-center justify-center space-x-4">
                            {getStatusIcon(overallStatus.status)}
                            <div className="text-center">
                                <h2 className="text-3xl font-bold text-white mb-2">{overallStatus.message}</h2>
                                <p className="text-white/70">System status is being monitored in real-time</p>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <StatusMetrics />

                {data?.monitors?.length && (
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                            <Globe className="w-5 h-5 mr-2 text-blue-400" />
                            Service Status
                        </h3>
                        <div className="grid gap-4">
                            {data.monitors.map((monitor: any, index: number) => (
                                <motion.div
                                    key={monitor.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300">
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex items-center space-x-2">
                                                        {monitor.attributes.status === 'up' ? 
                                                            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" /> :
                                                            <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse" />
                                                        }
                                                        <Wifi className="w-4 h-4 text-gray-400" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-white text-lg">{monitor.attributes.pronounceable_name}</h4>
                                                        <p className="text-sm text-gray-400">
                                                            Last checked: {new Date(monitor.attributes.last_checked_at).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge 
                                                    variant={monitor.attributes.status === 'up' ? 'default' : 'destructive'}
                                                    className={monitor.attributes.status === 'up' ? 
                                                        'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 
                                                        'bg-red-500/20 text-red-400 border-red-500/30'
                                                    }
                                                >
                                                    {monitor.attributes.status.charAt(0).toUpperCase() + monitor.attributes.status.slice(1)}
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderIncidents = () => (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-red-400" />
                Recent Incidents
            </h3>
            {data?.incidents?.length ? (
                <div className="space-y-4">
                    {data.incidents.map((incident: any, index: number) => (
                        <motion.div
                            key={incident.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="bg-red-500/10 backdrop-blur-sm border-red-500/20 hover:bg-red-500/15 transition-all duration-300">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-white flex items-center">
                                            <XCircle className="w-5 h-5 mr-2 text-red-400" />
                                            {incident.attributes.name}
                                        </CardTitle>
                                        <Badge variant={incident.attributes.resolved_at ? 'default' : 'destructive'}>
                                            {incident.attributes.resolved_at ? 'Resolved' : 'Ongoing'}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-300 mb-2">
                                        Started: {new Date(incident.attributes.started_at).toLocaleString()}
                                    </p>
                                    {incident.attributes.resolved_at && (
                                        <p className="text-gray-300">
                                            Resolved: {new Date(incident.attributes.resolved_at).toLocaleString()}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <Card className="bg-emerald-500/10 backdrop-blur-sm border-emerald-500/20">
                    <CardContent className="p-8 text-center">
                        <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                        <p className="text-white text-lg">No incidents reported</p>
                        <p className="text-gray-400">All systems are running smoothly</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );

    

    return (
        <>
            <Header /> {/* Header at the top */}

            {/* Premium Background behind content */}
            <SpaceBackground />

            <motion.div
                className="min-h-screen p-6 pt-24 relative z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
            >
                <div className="max-w-7xl mx-auto space-y-8">
                    <motion.div 
                        className="text-center space-y-4"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                            System Status
                        </h1>
                        <p className="text-xl text-white/80 max-w-2xl mx-auto">
                            Real-time monitoring and incident tracking for all X-Ample Development services
                        </p>
                        <div className="flex items-center justify-center space-x-2">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                            <span className="text-sm text-emerald-400 font-medium">Live Updates</span>
                        </div>
                    </motion.div>

                    <Tabs defaultValue="overview" value={tab} onValueChange={setTab}>
                        <TabsList className="grid grid-cols-3 bg-white/5 backdrop-blur-sm text-white rounded-2xl mb-8 p-1 border border-white/10">
                            <TabsTrigger 
                                value="overview" 
                                className="data-[state=active]:bg-white/20 data-[state=active]:shadow-lg rounded-xl transition-all duration-300"
                            >
                                <Activity className="w-4 h-4 mr-2" />
                                Overview
                            </TabsTrigger>
                            <TabsTrigger 
                                value="incidents" 
                                className="data-[state=active]:bg-white/20 data-[state=active]:shadow-lg rounded-xl transition-all duration-300"
                            >
                                <AlertCircle className="w-4 h-4 mr-2" />
                                Incidents
                            </TabsTrigger>
                            <TabsTrigger 
                                value="maintenance" 
                                className="data-[state=active]:bg-white/20 data-[state=active]:shadow-lg rounded-xl transition-all duration-300"
                            >
                                <Clock className="w-4 h-4 mr-2" />
                                Maintenance
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <Loader2 className="animate-spin w-8 h-8 text-white mb-4" />
                                    <p className="text-white/70">Loading system status...</p>
                                </div>
                            ) : error ? (
                                <Card className="bg-red-500/10 backdrop-blur-sm border-red-500/20">
                                    <CardContent className="p-8 text-center">
                                        <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                                        <p className="text-red-400 text-lg font-semibold">{error}</p>
                                        <p className="text-gray-400 mt-2">Please try refreshing the page</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                renderOverview()
                            )}
                        </TabsContent>

                        <TabsContent value="incidents">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <Loader2 className="animate-spin w-8 h-8 text-white mb-4" />
                                    <p className="text-white/70">Loading incidents...</p>
                                </div>
                            ) : error ? (
                                <Card className="bg-red-500/10 backdrop-blur-sm border-red-500/20">
                                    <CardContent className="p-8 text-center">
                                        <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                                        <p className="text-red-400 text-lg font-semibold">{error}</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                renderIncidents()
                            )}
                        </TabsContent>

                        <TabsContent value="maintenance">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <Loader2 className="animate-spin w-8 h-8 text-white mb-4" />
                                    <p className="text-white/70">Loading maintenance schedule...</p>
                                </div>
                            ) : error ? (
                                <Card className="bg-red-500/10 backdrop-blur-sm border-red-500/20">
                                    <CardContent className="p-8 text-center">
                                        <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                                        <p className="text-red-400 text-lg font-semibold">{error}</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                renderMaintenance()
                            )}
                        </TabsContent>
                    </Tabs>

                    <motion.div 
                        className="mt-16 text-center text-white/50 text-sm border-t border-white/10 pt-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 0.6 }}
                    >
                        <p>Powered by <span className="text-purple-400 font-medium">X-Ample Development</span></p>
                        <p className="mt-2 text-xs">Last updated: {new Date().toLocaleString()}</p>
                    </motion.div>
                </div>
            </motion.div>
        </>
    );
};

export default StatusPage;
