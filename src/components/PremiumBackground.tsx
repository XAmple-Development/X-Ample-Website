import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface PremiumBackgroundProps {
  className?: string;
}

const PremiumBackground = ({ className = "" }: PremiumBackgroundProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Base gradient */}
      <motion.div 
        className="absolute inset-0"
        animate={{
          background: [
            `linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--muted) / 0.3) 50%, hsl(var(--background)) 100%)`,
            `linear-gradient(225deg, hsl(var(--background)) 0%, hsl(var(--muted) / 0.2) 50%, hsl(var(--background)) 100%)`,
            `linear-gradient(315deg, hsl(var(--background)) 0%, hsl(var(--muted) / 0.25) 50%, hsl(var(--background)) 100%)`
          ]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Interactive gradient following mouse */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}% ${mousePosition.y}%, 
            hsl(var(--primary) / 0.15) 0%, 
            hsl(var(--accent) / 0.1) 40%, 
            transparent 70%)`
        }}
      />

      {/* Floating glass cards */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`glass-${i}`}
          className="absolute backdrop-blur-xl border border-white/10 rounded-2xl"
          style={{
            width: 200 + Math.random() * 300,
            height: 150 + Math.random() * 200,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `linear-gradient(135deg, 
              hsl(var(--primary) / 0.1) 0%, 
              hsl(var(--accent) / 0.05) 50%, 
              hsl(var(--primary) / 0.08) 100%)`,
            boxShadow: `
              0 8px 32px hsl(var(--primary) / 0.1),
              inset 0 1px 0 hsl(var(--primary) / 0.2),
              inset 0 -1px 0 hsl(var(--accent) / 0.1)
            `,
          }}
          animate={{
            x: [0, (Math.random() - 0.5) * 100, 0],
            y: [0, (Math.random() - 0.5) * 100, 0],
            rotate: [0, (Math.random() - 0.5) * 20, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 20 + Math.random() * 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5,
          }}
        />
      ))}

      {/* Elegant geometric shapes */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`shape-${i}`}
          className="absolute"
          style={{
            width: 60 + Math.random() * 40,
            height: 60 + Math.random() * 40,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `hsl(var(--primary) / ${0.1 + Math.random() * 0.1})`,
            borderRadius: i % 3 === 0 ? '50%' : i % 3 === 1 ? '12px' : '0',
            border: `1px solid hsl(var(--primary) / 0.2)`,
            backdropFilter: 'blur(10px)',
            boxShadow: `0 4px 20px hsl(var(--primary) / 0.15)`,
          }}
          animate={{
            x: [0, (Math.random() - 0.5) * 80, 0],
            y: [0, (Math.random() - 0.5) * 80, 0],
            rotate: [0, 360],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 15 + Math.random() * 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 8,
          }}
        />
      ))}

      {/* Subtle light rays */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `conic-gradient(from 0deg at 30% 70%, 
            transparent 0deg, 
            hsl(var(--primary) / 0.08) 30deg, 
            transparent 60deg)`,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        className="absolute inset-0"
        style={{
          background: `conic-gradient(from 180deg at 70% 30%, 
            transparent 0deg, 
            hsl(var(--accent) / 0.06) 45deg, 
            transparent 90deg)`,
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />

      {/* Floating light particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute rounded-full"
          style={{
            width: 4 + Math.random() * 8,
            height: 4 + Math.random() * 8,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `hsl(var(--primary) / 0.6)`,
            boxShadow: `0 0 10px hsl(var(--primary) / 0.8)`,
            filter: 'blur(0.5px)',
          }}
          animate={{
            x: [0, (Math.random() - 0.5) * 200, 0],
            y: [0, (Math.random() - 0.5) * 200, 0],
            opacity: [0, 1, 0],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: 8 + Math.random() * 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 6,
          }}
        />
      ))}

      {/* Elegant wave pattern */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: `repeating-linear-gradient(
            45deg,
            transparent 0px,
            transparent 40px,
            hsl(var(--primary) / 0.03) 40px,
            hsl(var(--primary) / 0.03) 41px,
            transparent 41px,
            transparent 80px
          )`,
        }}
        animate={{
          backgroundPosition: ['0px 0px', '80px 80px'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Subtle pulsing overlay */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 50%, 
            hsl(var(--primary) / 0.05) 0%, 
            transparent 70%)`,
        }}
        animate={{
          opacity: [0.5, 0.8, 0.5],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Premium border glow */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(0deg, hsl(var(--primary) / 0.1) 0%, transparent 20%),
                       linear-gradient(90deg, hsl(var(--accent) / 0.1) 0%, transparent 20%),
                       linear-gradient(180deg, hsl(var(--primary) / 0.1) 0%, transparent 20%),
                       linear-gradient(270deg, hsl(var(--accent) / 0.1) 0%, transparent 20%)`,
        }}
      />
    </div>
  );
};

export default PremiumBackground;