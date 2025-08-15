
import { motion } from "framer-motion";
import { Code, Gamepad2, Globe, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/glass/card";
import TransparentAstronaut from '@/components/TransparentAstronaut';

const skills = [
    { icon: <Gamepad2 className="w-5 h-5 text-cyan-400" />, label: "FiveM Scripts" },
    { icon: <Code className="w-5 h-5 text-teal-400" />, label: "Roblox Servers" },
    { icon: <Globe className="w-5 h-5 text-cyan-500" />, label: "Web Development" },
    { icon: <MessageSquare className="w-5 h-5 text-teal-500" />, label: "Discord Development" },
];

const Hero = () => {
    return (
        <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-16">
            {/* Space-themed background */}
            <div className="absolute inset-0">
                {/* Deep space base */}
                <div 
                    className="absolute inset-0"
                    style={{
                        background: `
                            radial-gradient(ellipse at top left, #1a1a2e 0%, #16213e 30%, #0f0f23 70%, #000000 100%),
                            radial-gradient(ellipse at bottom right, #16213e 0%, #1a1a2e 40%, #000000 100%)
                        `
                    }}
                />

                {/* Animated nebula layers */}
                <motion.div
                    className="absolute inset-0"
                    animate={{
                        background: [
                            `radial-gradient(ellipse 120% 80% at 20% 30%, rgba(138, 43, 226, 0.15) 0%, rgba(75, 0, 130, 0.1) 50%, transparent 100%)`,
                            `radial-gradient(ellipse 100% 100% at 80% 70%, rgba(72, 61, 139, 0.12) 0%, rgba(138, 43, 226, 0.08) 50%, transparent 100%)`,
                            `radial-gradient(ellipse 140% 60% at 50% 50%, rgba(75, 0, 130, 0.1) 0%, rgba(138, 43, 226, 0.06) 50%, transparent 100%)`
                        ]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Starfield */}
                {[...Array(100)].map((_, i) => (
                    <motion.div
                        key={`star-${i}`}
                        className="absolute rounded-full bg-white"
                        style={{
                            width: Math.random() * 2 + 0.5,
                            height: Math.random() * 2 + 0.5,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            opacity: 0.3 + Math.random() * 0.7,
                            boxShadow: `0 0 ${2 + Math.random() * 4}px rgba(255, 255, 255, 0.6)`,
                        }}
                        animate={{
                            opacity: [0.3, 1, 0.3],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: 2 + Math.random() * 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: Math.random() * 5,
                        }}
                    />
                ))}

                {/* Astronaut floating with sign */}
                <motion.div
                    className="absolute z-20"
                    style={{
                        right: '10%',
                        top: '20%',
                        width: '300px',
                        height: '300px',
                    }}
                    animate={{
                        y: [0, -20, 0],
                        rotate: [0, 3, -3, 0],
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    <TransparentAstronaut 
                        className="w-full h-full object-contain"
                        style={{
                            filter: 'drop-shadow(0 0 30px rgba(138, 43, 226, 0.8)) drop-shadow(0 0 60px rgba(0, 191, 255, 0.4))',
                        }}
                    />
                </motion.div>

                {/* Cosmic rings */}
                <motion.div
                    className="absolute inset-0"
                    style={{
                        background: `conic-gradient(from 0deg at 25% 75%, 
                            transparent 0deg, 
                            rgba(138, 43, 226, 0.08) 20deg,
                            transparent 40deg)`,
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                />
            </div>

            <div className="container mx-auto px-6 text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                >
                    <motion.h1 
                        className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                    >
                        X-Ample
                        <motion.span 
                            className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent"
                            animate={{ 
                                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] 
                            }}
                            transition={{ 
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            {" "}
                            Development
                        </motion.span>
                    </motion.h1>

                    <motion.p 
                        className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                    >
                        Creating exceptional digital experiences across FiveM, Roblox, Web, and Discord platforms
                    </motion.p>

                    <motion.div 
                        className="flex flex-wrap justify-center gap-4 mb-12"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 1 }}
                    >
                        {skills.map(({ icon, label }, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 1.2 + i * 0.1 }}
                                whileHover={{ 
                                    scale: 1.05,
                                    y: -5,
                                    transition: { duration: 0.2 }
                                }}
                            >
                                <Card className="bg-white/10 backdrop-blur-sm px-6 py-3 border border-white/20 flex items-center space-x-2 max-w-max hover:bg-white/20 transition-all duration-300">
                                    <CardContent className="p-0 flex items-center space-x-2 text-white">
                                        <motion.div
                                            animate={{ rotate: [0, 5, -5, 0] }}
                                            transition={{ 
                                                duration: 2,
                                                repeat: Infinity,
                                                delay: i * 0.5 
                                            }}
                                        >
                                            {icon}
                                        </motion.div>
                                        <span>{label}</span>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>

                    <motion.div 
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 1.5 }}
                    >
                        <Link to="/portfolio">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    size="lg"
                                    className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300"
                                >
                                    View Our Work
                                </Button>
                            </motion.div>
                        </Link>
                        <Link to="/contact">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300"
                                >
                                    Get Quote
                                </Button>
                            </motion.div>
                        </Link>
                    </motion.div>
                </motion.div>
            </div>

            {/* Enhanced scroll indicator */}
            <motion.div 
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                animate={{ y: [0, 10, 0] }}
                transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <motion.div 
                    className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
                    whileHover={{ scale: 1.1 }}
                >
                    <motion.div 
                        className="w-1 h-3 bg-white/60 rounded-full mt-2"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </motion.div>
            </motion.div>
        </section>
    );
};

export default Hero;
