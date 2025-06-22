import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const { user, profile } = useAuth();

    const navigation = [
        { name: "Home", href: "/" },
        { name: "Services", href: "/services" },
        { name: "About", href: "/about" },
        { name: "Team", href: "/team" },
        { name: "Portfolio", href: "/portfolio" },
        { name: "Contact", href: "/contact" },
        { name: "Status", href: "/status" },
        { name: "Discord", href: "https://discord.gg/bGhguE93Xp" },
    ];

const StatusPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="bg-white/5 border border-white/10 backdrop-blur-md text-white rounded-2xl shadow-lg p-6">
                    <h1 className="text-3xl font-bold mb-2">System Status</h1>
                    <p className="text-gray-300 mb-4">Live uptime and incident information</p>

                    <div className="rounded-xl overflow-hidden border border-white/10 shadow-lg">
                        <iframe
                            src="https://status.x-ampledevelopment.com"
                            title="XD Status Page"
                            className="w-full h-[80vh] bg-white"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatusPage;
