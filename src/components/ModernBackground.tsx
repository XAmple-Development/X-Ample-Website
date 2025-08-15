import React from 'react';
import { motion } from 'framer-motion';

interface ModernBackgroundProps {
  className?: string;
}

const ModernBackground = ({ className = "" }: ModernBackgroundProps) => {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Base layer with noise texture */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E"),
            hsl(var(--background))
          `,
        }}
      />

      {/* Multi-layered dynamic gradient background */}
      <motion.div 
        className="absolute inset-0"
        animate={{
          background: [
            `
              radial-gradient(ellipse 120% 80% at 20% 80%, hsl(var(--primary) / 0.4) 0%, transparent 70%),
              radial-gradient(ellipse 100% 60% at 80% 20%, hsl(var(--accent) / 0.3) 0%, transparent 60%),
              radial-gradient(ellipse 80% 100% at 60% 60%, hsl(var(--secondary) / 0.2) 0%, transparent 50%),
              linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--muted) / 0.1) 100%)
            `,
            `
              radial-gradient(ellipse 100% 90% at 80% 20%, hsl(var(--primary) / 0.35) 0%, transparent 65%),
              radial-gradient(ellipse 110% 70% at 20% 80%, hsl(var(--accent) / 0.4) 0%, transparent 70%),
              radial-gradient(ellipse 90% 80% at 30% 30%, hsl(var(--secondary) / 0.25) 0%, transparent 55%),
              linear-gradient(45deg, hsl(var(--background)) 0%, hsl(var(--muted) / 0.15) 100%)
            `,
            `
              radial-gradient(ellipse 130% 70% at 50% 50%, hsl(var(--primary) / 0.38) 0%, transparent 68%),
              radial-gradient(ellipse 90% 110% at 30% 70%, hsl(var(--accent) / 0.35) 0%, transparent 65%),
              radial-gradient(ellipse 100% 90% at 70% 40%, hsl(var(--secondary) / 0.22) 0%, transparent 52%),
              linear-gradient(225deg, hsl(var(--background)) 0%, hsl(var(--muted) / 0.12) 100%)
            `
          ]
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Depth layer 1 - Large floating orbs */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`orb-large-${i}`}
          className="absolute rounded-full"
          style={{
            width: 150 + Math.random() * 200,
            height: 150 + Math.random() * 200,
            left: `${Math.random() * 120 - 10}%`,
            top: `${Math.random() * 120 - 10}%`,
            background: `radial-gradient(circle, hsl(var(--primary) / ${0.12 + Math.random() * 0.08}) 0%, hsl(var(--primary) / ${0.04 + Math.random() * 0.04}) 50%, transparent 100%)`,
            backdropFilter: 'blur(40px)',
            border: `1px solid hsl(var(--primary) / ${0.1 + Math.random() * 0.05})`,
            boxShadow: `
              0 0 ${40 + Math.random() * 60}px hsl(var(--primary) / 0.3),
              inset 0 0 ${20 + Math.random() * 30}px hsl(var(--primary) / 0.1)
            `,
            filter: 'blur(0.5px)',
          }}
          animate={{
            x: [0, (Math.random() - 0.5) * 300, 0],
            y: [0, (Math.random() - 0.5) * 300, 0],
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.7, 0.3],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 35 + Math.random() * 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 10,
          }}
        />
      ))}

      {/* Depth layer 2 - Medium geometric shapes */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`shape-medium-${i}`}
          className="absolute"
          style={{
            width: 80 + Math.random() * 120,
            height: 80 + Math.random() * 120,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `hsl(var(--accent) / ${0.08 + Math.random() * 0.06})`,
            backdropFilter: 'blur(25px)',
            border: `1px solid hsl(var(--accent) / ${0.15 + Math.random() * 0.1})`,
            borderRadius: i % 3 === 0 ? '50%' : i % 3 === 1 ? '20%' : '8px',
            clipPath: i % 4 === 3 ? 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' : 'none',
            boxShadow: `0 0 ${25 + Math.random() * 35}px hsl(var(--accent) / 0.2)`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
          animate={{
            x: [0, (Math.random() - 0.5) * 200, 0],
            y: [0, (Math.random() - 0.5) * 200, 0],
            rotate: [0, 360],
            scale: [1, 1.25, 1],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 28 + Math.random() * 22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 8,
          }}
        />
      ))}

      {/* Depth layer 3 - Small detail elements */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`detail-${i}`}
          className="absolute"
          style={{
            width: 20 + Math.random() * 40,
            height: 20 + Math.random() * 40,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `hsl(var(--secondary) / ${0.06 + Math.random() * 0.08})`,
            backdropFilter: 'blur(15px)',
            border: `1px solid hsl(var(--secondary) / 0.3)`,
            borderRadius: i % 2 === 0 ? '50%' : '4px',
            boxShadow: `0 0 ${10 + Math.random() * 20}px hsl(var(--secondary) / 0.25)`,
          }}
          animate={{
            x: [0, (Math.random() - 0.5) * 100, 0],
            y: [0, (Math.random() - 0.5) * 100, 0],
            rotate: [0, 360],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: 20 + Math.random() * 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 12,
          }}
        />
      ))}

      {/* Enhanced animated grid with perspective */}
      <motion.div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px),
            radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px, 80px 80px, 40px 40px',
        }}
        animate={{
          backgroundPosition: [
            '0px 0px, 0px 0px, 0px 0px',
            '80px 80px, 80px 80px, 40px 40px',
            '0px 0px, 0px 0px, 0px 0px'
          ],
        }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Premium rotating light beams (keeping what you like) */}
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

      {/* Additional premium light beam */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `conic-gradient(from 270deg at 80% 80%, transparent 0deg, hsl(var(--primary) / 0.05) 20deg, transparent 40deg)`,
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 110, repeat: Infinity, ease: "linear" }}
      />

      {/* Enhanced pulsing overlay with multiple layers */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 30% 30%, hsl(var(--primary) / 0.06) 0%, transparent 60%),
            radial-gradient(circle at 70% 70%, hsl(var(--accent) / 0.04) 0%, transparent 50%)
          `,
        }}
        animate={{
          opacity: [0.4, 0.8, 0.4],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Floating light particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute rounded-full"
          style={{
            width: 2 + Math.random() * 4,
            height: 2 + Math.random() * 4,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `hsl(var(--primary) / ${0.6 + Math.random() * 0.4})`,
            boxShadow: `0 0 ${8 + Math.random() * 12}px hsl(var(--primary) / 0.8)`,
            filter: 'blur(0.5px)',
          }}
          animate={{
            x: [0, (Math.random() - 0.5) * 400, 0],
            y: [0, (Math.random() - 0.5) * 400, 0],
            opacity: [0, 1, 0],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: 15 + Math.random() * 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 10,
          }}
        />
      ))}
    </div>
  );
};

export default ModernBackground;