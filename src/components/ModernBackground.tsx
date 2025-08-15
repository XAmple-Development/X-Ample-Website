import React from 'react';
import { motion } from 'framer-motion';

interface ModernBackgroundProps {
  className?: string;
}

const ModernBackground = ({ className = "" }: ModernBackgroundProps) => {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Dynamic animated gradient background */}
      <motion.div 
        className="absolute inset-0"
        animate={{
          background: [
            `radial-gradient(circle at 20% 80%, hsl(var(--primary) / 0.4) 0%, transparent 60%), radial-gradient(circle at 80% 20%, hsl(var(--accent) / 0.3) 0%, transparent 50%), linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--muted) / 0.1) 100%)`,
            `radial-gradient(circle at 80% 20%, hsl(var(--primary) / 0.3) 0%, transparent 50%), radial-gradient(circle at 20% 80%, hsl(var(--accent) / 0.4) 0%, transparent 60%), linear-gradient(45deg, hsl(var(--background)) 0%, hsl(var(--muted) / 0.15) 100%)`,
            `radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.35) 0%, transparent 55%), radial-gradient(circle at 30% 70%, hsl(var(--accent) / 0.35) 0%, transparent 55%), linear-gradient(225deg, hsl(var(--background)) 0%, hsl(var(--muted) / 0.12) 100%)`
          ]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Floating circles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`circle-${i}`}
          className="absolute rounded-full"
          style={{
            width: 60 + Math.random() * 120,
            height: 60 + Math.random() * 120,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `hsl(var(--primary) / ${0.08 + Math.random() * 0.12})`,
            backdropFilter: 'blur(30px)',
            border: `1px solid hsl(var(--primary) / ${0.15 + Math.random() * 0.1})`,
            boxShadow: `0 0 ${20 + Math.random() * 30}px hsl(var(--primary) / 0.2)`,
          }}
          animate={{
            x: [0, (Math.random() - 0.5) * 200, 0],
            y: [0, (Math.random() - 0.5) * 200, 0],
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.8, 0.4],
            rotate: [0, 360],
          }}
          transition={{
            duration: 20 + Math.random() * 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 8,
          }}
        />
      ))}

      {/* Floating hexagons */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`hex-${i}`}
          className="absolute"
          style={{
            width: 40 + Math.random() * 60,
            height: 40 + Math.random() * 60,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `hsl(var(--accent) / ${0.06 + Math.random() * 0.08})`,
            backdropFilter: 'blur(25px)',
            border: `1px solid hsl(var(--accent) / 0.2)`,
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            boxShadow: `0 0 ${15 + Math.random() * 25}px hsl(var(--accent) / 0.15)`,
          }}
          animate={{
            x: [0, (Math.random() - 0.5) * 150, 0],
            y: [0, (Math.random() - 0.5) * 150, 0],
            rotate: [0, 360],
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 25 + Math.random() * 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 10,
          }}
        />
      ))}

      {/* Triangular elements */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`triangle-${i}`}
          className="absolute"
          style={{
            width: 30 + Math.random() * 50,
            height: 30 + Math.random() * 50,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `hsl(var(--secondary) / ${0.05 + Math.random() * 0.1})`,
            backdropFilter: 'blur(20px)',
            border: `1px solid hsl(var(--secondary) / 0.25)`,
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
          }}
          animate={{
            x: [0, (Math.random() - 0.5) * 100, 0],
            y: [0, (Math.random() - 0.5) * 100, 0],
            rotate: [0, 360],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 30 + Math.random() * 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 12,
          }}
        />
      ))}

      {/* Enhanced grid overlay with animation */}
      <motion.div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
        animate={{
          backgroundPosition: ['0px 0px', '60px 60px', '0px 0px'],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Multiple rotating light beams */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `conic-gradient(from 0deg at 30% 70%, transparent 0deg, hsl(var(--primary) / 0.12) 45deg, transparent 90deg)`,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
      />
      
      <motion.div
        className="absolute inset-0"
        style={{
          background: `conic-gradient(from 180deg at 70% 30%, transparent 0deg, hsl(var(--accent) / 0.08) 60deg, transparent 120deg)`,
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        className="absolute inset-0"
        style={{
          background: `conic-gradient(from 90deg at 50% 50%, transparent 0deg, hsl(var(--secondary) / 0.06) 30deg, transparent 60deg)`,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
      />

      {/* Subtle pulsing overlay */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.05) 0%, transparent 70%)`,
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.1, 1],
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

export default ModernBackground;