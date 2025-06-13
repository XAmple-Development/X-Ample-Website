
import { motion } from "framer-motion";
import { Code, Gamepad2, Globe, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/glass/card";

const skills = [
    { icon: <Gamepad2 className="w-5 h-5 text-cyan-400" />, label: "FiveM Scripts" },
    { icon: <Code className="w-5 h-5 text-teal-400" />, label: "Roblox Servers" },
    { icon: <Globe className="w-5 h-5 text-cyan-500" />, label: "Web Development" },
    { icon: <MessageSquare className="w-5 h-5 text-teal-500" />, label: "Discord Development" },
];

const Hero = () => {
    return (
        

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
