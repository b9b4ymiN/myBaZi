"use client"

/**
 * Motion primitives for the myBaZi PWA.
 *
 * All primitives respect the user's `prefers-reduced-motion` setting via
 * `useReducedMotion()`: when reduced motion is requested, transforms are
 * dropped and only a short opacity fade remains, so nothing shifts layout
 * or triggers vestibular discomfort.
 *
 * Uses the unified `motion` package (motion v12+), React entry at
 * `motion/react`.
 */

import * as React from "react"
import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react"

import { cn } from "@/lib/utils"

const EASE = [0.22, 1, 0.36, 1] as const

export type PageRevealProps = HTMLMotionProps<"div"> & {
  delay?: number
}

/** Fade + slide-up on mount. Use once near the top of a route's content. */
export function PageReveal({
  children,
  className,
  delay = 0,
  ...props
}: PageRevealProps) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0.2 : 0.45, delay, ease: EASE }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export type SectionRevealProps = HTMLMotionProps<"section"> & {
  delay?: number
}

/** Fade + slide-up when scrolled into view (once). For below-the-fold sections. */
export function SectionReveal({
  children,
  className,
  delay = 0,
  ...props
}: SectionRevealProps) {
  const reduce = useReducedMotion()
  return (
    <motion.section
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: reduce ? 0.2 : 0.5, delay, ease: EASE }}
      {...props}
    >
      {children}
    </motion.section>
  )
}

export type FadeInProps = HTMLMotionProps<"div"> & {
  delay?: number
}

/** Lightweight fade-in for small interactive elements / cards. */
export function FadeIn({
  children,
  className,
  delay = 0,
  ...props
}: FadeInProps) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduce ? 0.15 : 0.3, delay, ease: EASE }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
