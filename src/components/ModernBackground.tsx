import React from 'react';
import { motion } from 'framer-motion';

interface ModernBackgroundProps {
  className?: string;
}

const ModernBackground = ({ className = "" }: ModernBackgroundProps) => {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Animated gradient background */}
      <div 
        className="absolute inset-0 opacity-60"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, hsl(var(--primary) / 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, hsl(var(--accent) / 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, hsl(var(--secondary) / 0.2) 0%, transparent 50%),
            linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--muted) / 0.1) 100%)
          `
        }}
      />

      {/* Floating geometric shapes */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 100 + 50,
            height: Math.random() * 100 + 50,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `hsl(var(--primary) / ${0.1 + Math.random() * 0.1})`,
            backdropFilter: 'blur(20px)',
            border: '1px solid hsl(var(--primary) / 0.2)',
          }}
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 15 + Math.random() * 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5,
          }}
        />
      ))}

      {/* Subtle grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Animated light beams */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, hsl(var(--primary) / 0.1) 60deg, transparent 120deg)`,
        }}
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      <motion.div
        className="absolute inset-0"
        style={{
          background: `conic-gradient(from 180deg at 50% 50%, transparent 0deg, hsl(var(--accent) / 0.05) 90deg, transparent 180deg)`,
        }}
        animate={{
          rotate: -360,
        }}
        transition={{
          duration: 80,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
};

export default ModernBackground;