import React from 'react';
import { motion } from 'framer-motion';

interface SpaceBackgroundProps {
  className?: string;
}

const SpaceBackground = ({ className = "" }: SpaceBackgroundProps) => {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Deep space base with nebula */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at top left, #0a0a1f 0%, #1a0a2e 30%, #16213e 70%, #000000 100%),
            radial-gradient(ellipse at bottom right, #16213e 0%, #1a0a2e 40%, #000814 100%)
          `
        }}
      />

      {/* Animated nebula clouds */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            `radial-gradient(ellipse 150% 100% at 20% 80%, rgba(138, 43, 226, 0.2) 0%, rgba(75, 0, 130, 0.1) 50%, transparent 100%)`,
            `radial-gradient(ellipse 120% 120% at 80% 20%, rgba(72, 61, 139, 0.15) 0%, rgba(138, 43, 226, 0.08) 50%, transparent 100%)`,
            `radial-gradient(ellipse 140% 80% at 50% 60%, rgba(75, 0, 130, 0.12) 0%, rgba(138, 43, 226, 0.06) 50%, transparent 100%)`
          ]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Blue nebula layer */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            `radial-gradient(ellipse 100% 140% at 70% 30%, rgba(0, 191, 255, 0.1) 0%, rgba(30, 144, 255, 0.06) 60%, transparent 100%)`,
            `radial-gradient(ellipse 130% 90% at 30% 70%, rgba(30, 144, 255, 0.12) 0%, rgba(0, 191, 255, 0.08) 50%, transparent 100%)`,
            `radial-gradient(ellipse 90% 110% at 60% 40%, rgba(0, 191, 255, 0.08) 0%, rgba(30, 144, 255, 0.05) 55%, transparent 100%)`
          ]
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Starfield - Multiple layers */}
      {[...Array(200)].map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute rounded-full bg-white"
          style={{
            width: Math.random() * 3 + 0.5,
            height: Math.random() * 3 + 0.5,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: 0.3 + Math.random() * 0.7,
            boxShadow: `0 0 ${2 + Math.random() * 6}px rgba(255, 255, 255, 0.6)`,
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

      {/* Floating cosmic debris */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`debris-${i}`}
          className="absolute rounded-full"
          style={{
            width: 40 + Math.random() * 80,
            height: 40 + Math.random() * 80,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `radial-gradient(circle, 
              rgba(138, 43, 226, 0.15) 0%, 
              rgba(75, 0, 130, 0.08) 50%, 
              transparent 100%)`,
            border: `1px solid rgba(138, 43, 226, 0.2)`,
            backdropFilter: 'blur(10px)',
            boxShadow: `0 0 30px rgba(138, 43, 226, 0.15)`,
          }}
          animate={{
            x: [0, (Math.random() - 0.5) * 150, 0],
            y: [0, (Math.random() - 0.5) * 150, 0],
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 40 + Math.random() * 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 10,
          }}
        />
      ))}

      {/* Earth in the distance */}
      <motion.div
        className="absolute"
        style={{
          width: '200px',
          height: '200px',
          right: '10%',
          bottom: '15%',
          background: `radial-gradient(circle at 30% 30%, 
            #4a90e2 0%, 
            #2e5cb8 30%, 
            #1a365d 60%, 
            #0f2a44 100%)`,
          borderRadius: '50%',
          boxShadow: `
            0 0 50px rgba(74, 144, 226, 0.3),
            inset -20px -20px 50px rgba(0, 0, 0, 0.5)
          `,
        }}
        animate={{
          scale: [1, 1.05, 1],
          boxShadow: [
            '0 0 50px rgba(74, 144, 226, 0.3), inset -20px -20px 50px rgba(0, 0, 0, 0.5)',
            '0 0 70px rgba(74, 144, 226, 0.4), inset -20px -20px 50px rgba(0, 0, 0, 0.5)',
            '0 0 50px rgba(74, 144, 226, 0.3), inset -20px -20px 50px rgba(0, 0, 0, 0.5)'
          ]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Shooting stars */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`shooting-star-${i}`}
          className="absolute"
          style={{
            width: '2px',
            height: '100px',
            background: `linear-gradient(to bottom, 
              rgba(255, 255, 255, 0.8) 0%, 
              rgba(255, 255, 255, 0.4) 50%, 
              transparent 100%)`,
            left: `${Math.random() * 100}%`,
            top: '-100px',
            transform: `rotate(45deg)`,
          }}
          animate={{
            y: [0, typeof window !== 'undefined' ? window.innerHeight + 200 : 1000],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 3,
            repeat: Infinity,
            ease: "easeOut",
            delay: Math.random() * 10,
          }}
        />
      ))}

      {/* Advanced cosmic rings */}
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

      <motion.div
        className="absolute inset-0"
        style={{
          background: `conic-gradient(from 180deg at 75% 25%, 
            transparent 0deg, 
            rgba(0, 191, 255, 0.06) 30deg,
            transparent 60deg)`,
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 65, repeat: Infinity, ease: "linear" }}
      />

      {/* Subtle grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(138, 43, 226, 1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(138, 43, 226, 1) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />
    </div>
  );
};

export default SpaceBackground;