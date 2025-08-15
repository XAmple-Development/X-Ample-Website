import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

interface SpectacularBackgroundProps {
  className?: string;
}

const SpectacularBackground = ({ className = "" }: SpectacularBackgroundProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Transform mouse position for parallax effects
  const x1 = useTransform(mouseX, [0, 1000], [-50, 50]);
  const y1 = useTransform(mouseY, [0, 1000], [-50, 50]);
  const x2 = useTransform(mouseX, [0, 1000], [-30, 30]);
  const y2 = useTransform(mouseY, [0, 1000], [-30, 30]);
  const x3 = useTransform(mouseX, [0, 1000], [-20, 20]);
  const y3 = useTransform(mouseY, [0, 1000], [-20, 20]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      setMousePosition({ x, y });
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Deep space base layer */}
      <motion.div 
        className="absolute inset-0"
        animate={{
          background: [
            `radial-gradient(circle at 20% 30%, hsl(270 100% 5%) 0%, hsl(240 100% 3%) 25%, hsl(220 100% 2%) 50%, hsl(200 100% 1%) 100%)`,
            `radial-gradient(circle at 80% 70%, hsl(280 100% 6%) 0%, hsl(250 100% 4%) 25%, hsl(230 100% 3%) 50%, hsl(210 100% 2%) 100%)`,
            `radial-gradient(circle at 50% 50%, hsl(290 100% 7%) 0%, hsl(260 100% 5%) 25%, hsl(240 100% 4%) 50%, hsl(220 100% 3%) 100%)`
          ]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Nebula clouds - Layer 1 */}
      <motion.div
        className="absolute inset-0"
        style={{ x: x1, y: y1 }}
        animate={{
          background: [
            `radial-gradient(ellipse 150% 100% at 20% 80%, hsl(var(--primary) / 0.3) 0%, hsl(300 80% 40% / 0.2) 30%, transparent 70%)`,
            `radial-gradient(ellipse 120% 120% at 80% 20%, hsl(var(--accent) / 0.4) 0%, hsl(320 90% 50% / 0.25) 35%, transparent 75%)`,
            `radial-gradient(ellipse 160% 90% at 50% 60%, hsl(var(--primary) / 0.35) 0%, hsl(280 85% 45% / 0.22) 32%, transparent 72%)`
          ]
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Nebula clouds - Layer 2 */}
      <motion.div
        className="absolute inset-0"
        style={{ x: x2, y: y2 }}
        animate={{
          background: [
            `radial-gradient(ellipse 180% 80% at 70% 30%, hsl(var(--accent) / 0.25) 0%, hsl(340 70% 60% / 0.15) 40%, transparent 80%)`,
            `radial-gradient(ellipse 140% 140% at 30% 70%, hsl(var(--secondary) / 0.3) 0%, hsl(200 80% 70% / 0.2) 45%, transparent 85%)`,
            `radial-gradient(ellipse 200% 70% at 60% 40%, hsl(var(--accent) / 0.28) 0%, hsl(310 75% 55% / 0.18) 42%, transparent 82%)`
          ]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Interactive energy field */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle 300px at ${mousePosition.x}px ${mousePosition.y}px, 
            hsl(var(--primary) / 0.15) 0%, 
            hsl(var(--primary) / 0.08) 30%, 
            hsl(var(--accent) / 0.05) 50%, 
            transparent 70%)`,
        }}
        animate={{
          opacity: [0.7, 1, 0.7],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Cosmic particles - Large */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`cosmic-large-${i}`}
          className="absolute rounded-full"
          style={{
            width: 60 + Math.random() * 120,
            height: 60 + Math.random() * 120,
            left: `${Math.random() * 120 - 10}%`,
            top: `${Math.random() * 120 - 10}%`,
            background: `radial-gradient(circle, 
              hsl(${200 + Math.random() * 160} 80% ${60 + Math.random() * 40}% / ${0.4 + Math.random() * 0.3}) 0%, 
              hsl(${200 + Math.random() * 160} 70% ${40 + Math.random() * 30}% / ${0.2 + Math.random() * 0.2}) 40%, 
              transparent 100%)`,
            filter: `blur(${Math.random() * 2}px)`,
            boxShadow: `0 0 ${30 + Math.random() * 50}px hsl(${200 + Math.random() * 160} 80% ${60 + Math.random() * 40}% / 0.4)`,
            x: x3,
            y: y3,
          }}
          animate={{
            x: [0, (Math.random() - 0.5) * 400, 0],
            y: [0, (Math.random() - 0.5) * 400, 0],
            scale: [1, 1.3 + Math.random() * 0.5, 1],
            opacity: [0.3, 0.8, 0.3],
            rotate: [0, 360],
          }}
          transition={{
            duration: 40 + Math.random() * 30,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 15,
          }}
        />
      ))}

      {/* Floating energy orbs */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`energy-orb-${i}`}
          className="absolute rounded-full"
          style={{
            width: 20 + Math.random() * 40,
            height: 20 + Math.random() * 40,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `conic-gradient(
              hsl(var(--primary)) 0deg,
              hsl(var(--accent)) 90deg,
              hsl(var(--secondary)) 180deg,
              hsl(var(--primary)) 270deg,
              hsl(var(--primary)) 360deg
            )`,
            filter: 'blur(1px)',
            boxShadow: `
              0 0 20px hsl(var(--primary) / 0.8),
              inset 0 0 20px hsl(var(--accent) / 0.3)
            `,
          }}
          animate={{
            x: [0, (Math.random() - 0.5) * 200, 0],
            y: [0, (Math.random() - 0.5) * 200, 0],
            rotate: [0, 360],
            scale: [1, 1.5, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 20 + Math.random() * 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 10,
          }}
        />
      ))}

      {/* Quantum field lines */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`field-line-${i}`}
          className="absolute"
          style={{
            width: '200%',
            height: '2px',
            left: '-50%',
            top: `${20 + i * 15}%`,
            background: `linear-gradient(90deg, 
              transparent 0%, 
              hsl(var(--primary) / 0.3) 20%, 
              hsl(var(--accent) / 0.4) 50%, 
              hsl(var(--primary) / 0.3) 80%, 
              transparent 100%)`,
            transform: `rotate(${-20 + i * 8}deg)`,
            filter: 'blur(1px)',
            boxShadow: `0 0 10px hsl(var(--primary) / 0.5)`,
          }}
          animate={{
            x: ['-100%', '100%'],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 8 + Math.random() * 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 8,
          }}
        />
      ))}

      {/* Dimensional rifts */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `conic-gradient(from 0deg at 25% 75%, 
            transparent 0deg, 
            hsl(var(--primary) / 0.1) 30deg, 
            hsl(var(--accent) / 0.15) 60deg,
            transparent 90deg)`,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        className="absolute inset-0"
        style={{
          background: `conic-gradient(from 180deg at 75% 25%, 
            transparent 0deg, 
            hsl(var(--accent) / 0.08) 45deg, 
            hsl(var(--secondary) / 0.12) 90deg,
            transparent 135deg)`,
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        className="absolute inset-0"
        style={{
          background: `conic-gradient(from 90deg at 50% 50%, 
            transparent 0deg, 
            hsl(var(--primary) / 0.06) 20deg, 
            hsl(300 80% 60% / 0.1) 40deg,
            transparent 60deg)`,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
      />

      {/* Starfield */}
      {[...Array(100)].map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `hsl(${200 + Math.random() * 160} 80% ${80 + Math.random() * 20}%)`,
            boxShadow: `0 0 ${2 + Math.random() * 8}px hsl(${200 + Math.random() * 160} 80% ${80 + Math.random() * 20}%)`,
          }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 2 + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5,
          }}
        />
      ))}

      {/* Cosmic aurora */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(145deg, 
            hsl(var(--primary) / 0.1) 0%, 
            hsl(var(--accent) / 0.08) 25%, 
            transparent 50%, 
            hsl(var(--secondary) / 0.06) 75%, 
            hsl(var(--primary) / 0.04) 100%)`,
          filter: 'blur(3px)',
        }}
        animate={{
          opacity: [0.5, 0.8, 0.5],
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Final cinematic overlay */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 100% 60% at 50% 40%, 
            transparent 0%, 
            hsl(var(--background) / 0.1) 60%, 
            hsl(var(--background) / 0.3) 100%)`,
        }}
        animate={{
          opacity: [0.7, 0.9, 0.7],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};

export default SpectacularBackground;