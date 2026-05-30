"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type HeroMotionProps = {
  kicker: string;
  title: ReactNode;
  subtitle: string;
  actions: ReactNode;
  features: ReactNode;
};

export function HeroMotion({ kicker, title, subtitle, actions, features }: HeroMotionProps) {
  const reduceMotion = useReducedMotion();

  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: reduceMotion ? 0 : 0.08 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-4">
      <motion.p variants={item} className="text-sm font-medium uppercase tracking-wider text-accent">
        {kicker}
      </motion.p>
      <motion.h1
        variants={item}
        className="text-pretty text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
      >
        {title}
      </motion.h1>
      <motion.p variants={item} className="max-w-xl text-pretty text-lg leading-8 text-muted">
        {subtitle}
      </motion.p>
      <motion.div variants={item} className="mt-2 flex flex-col gap-3 sm:flex-row">
        {actions}
      </motion.div>
      <motion.div variants={item} className="mt-6 grid gap-4 sm:grid-cols-3">
        {features}
      </motion.div>
    </motion.div>
  );
}
