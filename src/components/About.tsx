import { Users, Award, Clock, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/glass/card";

const About = () => {
    const stats = [
        {
            icon: <Users className="w-8 h-8 text-cyan-400" />,
            number: "500+",
            label: "Happy Clients",
        },
        {
            icon: <Award className="w-8 h-8 text-cyan-400" />,
            number: "1000+",
            label: "Projects Completed",
        },
        {
            icon: <Clock className="w-8 h-8 text-cyan-400" />,
            number: "8+",
            label: "Years Experience",
        },
        {
            icon: <Star className="w-8 h-8 text-cyan-400" />,
            number: "4.9",
            label: "Average Rating",
        },
    ];

    return (
        <section className="py-20 bg-gradient-to-r from-slate-900 to-teal-900">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* About Text */}
                    <div className="text-white">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
                            About{" "}
                            <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                                X-Ample Development
                            </span>
                        </h2>
                        <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                            We are a passionate team of developers specializing in creating
                            exceptional digital experiences across gaming and web platforms.
                            With years of expertise in FiveM, Roblox, web development, and
                            Discord solutions, we bring your ideas to life with precision and
                            creativity.
                        </p>
                        <p className="text-lg text-gray-400 mb-8">
                            Our commitment to quality and innovation has made us a trusted
                            partner for clients worldwide. From small custom scripts to
                            large-scale server deployments, we deliver solutions that exceed
                            expectations.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            {["Custom Solutions", "24/7 Support", "Fast Delivery"].map(
                                (label, i) => (
                                    <Card
                                        key={i}
                                        className="border-white/20 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg text-sm text-white"
                                    >
                                        <CardContent className="p-0 font-semibold text-cyan-400">
                                            {label}
                                        </CardContent>
                                    </Card>
                                )
                            )}
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-6">
                        {stats.map((stat, index) => (
                            <Card
                                key={index}
                                className="border-white/20 bg-white/10 backdrop-blur-sm text-center hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
                            >
                                <CardContent className="p-6">
                                    <div className="flex justify-center mb-4">{stat.icon}</div>
                                    <div className="text-3xl font-bold text-white mb-2">
                                        {stat.number}
                                    </div>
                                    <div className="text-gray-300">{stat.label}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
