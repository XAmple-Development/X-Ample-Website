import React from 'react';
import { motion } from 'framer-motion';

interface SpaceBackgroundProps {
  className?: string;
}

const SpaceBackground = ({ className = "" }: SpaceBackgroundProps) => {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
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

      {/* Secondary nebula layer */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            `radial-gradient(ellipse 90% 120% at 70% 20%, rgba(0, 191, 255, 0.08) 0%, rgba(30, 144, 255, 0.05) 60%, transparent 100%)`,
            `radial-gradient(ellipse 110% 80% at 30% 80%, rgba(30, 144, 255, 0.1) 0%, rgba(0, 191, 255, 0.06) 50%, transparent 100%)`,
            `radial-gradient(ellipse 80% 100% at 60% 40%, rgba(0, 191, 255, 0.06) 0%, rgba(30, 144, 255, 0.04) 55%, transparent 100%)`
          ]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />


      {/* Starfield - Large stars */}
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={`star-large-${i}`}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 3 + 2,
            height: Math.random() * 3 + 2,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `#ffffff`,
            boxShadow: `0 0 ${4 + Math.random() * 8}px rgba(255, 255, 255, 0.8)`,
          }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5,
          }}
        />
      ))}

      {/* Starfield - Small stars */}
      {[...Array(150)].map((_, i) => (
        <div
          key={`star-small-${i}`}
          className="absolute rounded-full bg-white"
          style={{
            width: Math.random() * 2 + 0.5,
            height: Math.random() * 2 + 0.5,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: 0.4 + Math.random() * 0.6,
          }}
        />
      ))}

      {/* Floating cosmic objects */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`cosmic-object-${i}`}
          className="absolute rounded-full"
          style={{
            width: 80 + Math.random() * 120,
            height: 80 + Math.random() * 120,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `radial-gradient(circle, 
              rgba(138, 43, 226, 0.2) 0%, 
              rgba(75, 0, 130, 0.1) 40%, 
              rgba(30, 144, 255, 0.05) 80%, 
              transparent 100%)`,
            border: `1px solid rgba(138, 43, 226, 0.3)`,
            backdropFilter: 'blur(20px)',
            boxShadow: `
              0 0 40px rgba(138, 43, 226, 0.2),
              inset 0 0 20px rgba(255, 255, 255, 0.1)
            `,
          }}
          animate={{
            x: [0, (Math.random() - 0.5) * 200, 0],
            y: [0, (Math.random() - 0.5) * 200, 0],
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 30 + Math.random() * 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 10,
          }}
        />
      ))}

      {/* Geometric constellation lines */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`constellation-${i}`}
          className="absolute"
          style={{
            width: '2px',
            height: `${100 + Math.random() * 200}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `linear-gradient(to bottom, 
              rgba(138, 43, 226, 0.6) 0%, 
              rgba(138, 43, 226, 0.3) 50%, 
              transparent 100%)`,
            transform: `rotate(${Math.random() * 360}deg)`,
            transformOrigin: 'top',
          }}
          animate={{
            opacity: [0, 1, 0],
            scaleY: [0, 1, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 8,
          }}
        />
      ))}

      {/* Orbiting particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute rounded-full"
          style={{
            width: 4 + Math.random() * 6,
            height: 4 + Math.random() * 6,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `rgba(0, 191, 255, 0.8)`,
            boxShadow: `0 0 15px rgba(0, 191, 255, 0.6)`,
          }}
          animate={{
            x: [0, (Math.random() - 0.5) * 300, 0],
            y: [0, (Math.random() - 0.5) * 300, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 10 + Math.random() * 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 8,
          }}
        />
      ))}

      {/* Advanced rotating cosmic rings */}
      {/* Ring Layer 1 - Primary */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `conic-gradient(from 0deg at 25% 75%, 
            transparent 0deg, 
            rgba(138, 43, 226, 0.15) 20deg,
            rgba(75, 0, 130, 0.1) 40deg,
            transparent 60deg,
            rgba(138, 43, 226, 0.08) 80deg,
            transparent 100deg)`,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
      />

      {/* Ring Layer 2 - Secondary */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `conic-gradient(from 180deg at 75% 25%, 
            transparent 0deg, 
            rgba(0, 191, 255, 0.12) 30deg,
            rgba(30, 144, 255, 0.08) 60deg,
            transparent 90deg,
            rgba(0, 191, 255, 0.06) 120deg,
            transparent 150deg)`,
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 65, repeat: Infinity, ease: "linear" }}
      />

      {/* Ring Layer 3 - Tertiary */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `conic-gradient(from 90deg at 50% 50%, 
            transparent 0deg,
            rgba(138, 43, 226, 0.1) 15deg,
            transparent 30deg,
            rgba(0, 191, 255, 0.08) 45deg,
            transparent 60deg,
            rgba(75, 0, 130, 0.06) 75deg,
            transparent 90deg)`,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
      />

      {/* Ring Layer 4 - Fast rotation */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `conic-gradient(from 270deg at 80% 80%, 
            transparent 0deg,
            rgba(138, 43, 226, 0.08) 10deg,
            transparent 20deg,
            rgba(0, 191, 255, 0.06) 25deg,
            transparent 35deg)`,
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      />

      {/* Ring Layer 5 - Outer ring */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `conic-gradient(from 45deg at 30% 30%, 
            transparent 0deg,
            rgba(75, 0, 130, 0.1) 40deg,
            rgba(138, 43, 226, 0.12) 80deg,
            transparent 120deg,
            rgba(30, 144, 255, 0.06) 160deg,
            transparent 200deg)`,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
      />

      {/* Ring Layer 6 - Inner spiral */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `conic-gradient(from 315deg at 70% 70%, 
            transparent 0deg,
            rgba(0, 191, 255, 0.05) 5deg,
            transparent 10deg,
            rgba(138, 43, 226, 0.07) 15deg,
            transparent 20deg,
            rgba(0, 191, 255, 0.04) 25deg,
            transparent 30deg)`,
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
      />

      {/* Ring Layer 7 - Pulsing ring */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `conic-gradient(from 135deg at 40% 60%, 
            transparent 0deg,
            rgba(138, 43, 226, 0.06) 45deg,
            transparent 90deg,
            rgba(0, 191, 255, 0.04) 135deg,
            transparent 180deg)`,
        }}
        animate={{ 
          rotate: 360,
          opacity: [0.3, 1, 0.3]
        }}
        transition={{ 
          rotate: { duration: 55, repeat: Infinity, ease: "linear" },
          opacity: { duration: 8, repeat: Infinity, ease: "easeInOut" }
        }}
      />

      {/* Pulsing energy core */}
      <motion.div
        className="absolute"
        style={{
          width: '200px',
          height: '200px',
          left: '20%',
          top: '30%',
          background: `radial-gradient(circle, 
            rgba(138, 43, 226, 0.15) 0%, 
            rgba(138, 43, 226, 0.05) 50%, 
            transparent 100%)`,
          borderRadius: '50%',
          filter: 'blur(2px)',
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.8, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Distant galaxy */}
      <motion.div
        className="absolute"
        style={{
          width: '150px',
          height: '150px',
          right: '15%',
          bottom: '25%',
          background: `radial-gradient(ellipse, 
            rgba(30, 144, 255, 0.12) 0%, 
            rgba(0, 191, 255, 0.06) 60%, 
            transparent 100%)`,
          borderRadius: '50%',
          filter: 'blur(1px)',
        }}
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: { duration: 60, repeat: Infinity, ease: "linear" },
          scale: { duration: 12, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      {/* Subtle grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(138, 43, 226, 1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(138, 43, 226, 1) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
        }}
      />
    </div>
  );
};

export default SpaceBackground;