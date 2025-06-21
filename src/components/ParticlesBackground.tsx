import { useCallback } from "react";
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";

interface ParticlesBackgroundProps {
    className?: string;
}

const ParticlesBackground = ({ className = "" }: ParticlesBackgroundProps) => {
    const particlesInit = useCallback(async (engine: Engine) => {
        await loadSlim(engine);
    }, []);

    return (
        <Particles
            className={`absolute inset-0 -z-10 ${className}`}
            init={particlesInit}
            options={{
                background: {
                    opacity: 0,
                },
                fpsLimit: 60,
                detectRetina: true,
                interactivity: {
                    events: {
                        onClick: {
                            enable: true,
                            mode: "push",
                        },
                        onHover: {
                            enable: true,
                            mode: "repulse",
                            parallax: { enable: true, force: 30, smooth: 10 },
                        },
                        resize: true,
                    },
                    modes: {
                        push: {
                            quantity: 3,
                        },
                        repulse: {
                            distance: 100,
                            duration: 0.4,
                        },
                    },
                },
                particles: {
                    color: {
                        value: ["#06b6d4", "#14b8a6", "#0ea5e9"], // cyan/teal/blue
                    },
                    links: {
                        enable: true,
                        color: "#06b6d4",
                        distance: 130,
                        opacity: 0.25,
                        width: 1,
                    },
                    move: {
                        enable: true,
                        speed: 0.8,
                        direction: "none",
                        random: false,
                        straight: false,
                        outModes: {
                            default: "out",
                        },
                    },
                    number: {
                        value: 60,
                        density: {
                            enable: true,
                            area: 800,
                        },
                    },
                    opacity: {
                        value: 0.4,
                    },
                    shape: {
                        type: "circle",
                    },
                    size: {
                        value: { min: 1, max: 3 },
                        random: true,
                    },
                },
            }}
        />
    );
};

export default ParticlesBackground;
