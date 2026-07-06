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
import { animate, motion, useMotionValue, useReducedMotion, type HTMLMotionProps } from "motion/react"

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

export type StaggerProps = HTMLMotionProps<"div"> & {
  /** Delay before the first child starts (s). */
  delay?: number
  /** Gap between each child (s). */
  gap?: number
}

/**
 * Container that reveals its `<StaggerItem>` children one after another.
 * Under reduced motion, children appear together with a short fade.
 */
export function Stagger({
  children,
  className,
  delay = 0,
  gap = 0.08,
  ...props
}: StaggerProps) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={
        reduce
          ? {
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { duration: 0.2, delay } },
            }
          : {
              hidden: {},
              show: { transition: { staggerChildren: gap, delayChildren: delay } },
            }
      }
      {...props}
    >
      {children}
    </motion.div>
  )
}

export type StaggerItemProps = HTMLMotionProps<"div">

/** Child of `<Stagger>`. Animates fade + slide-up when the parent staggers it. */
export function StaggerItem({
  children,
  className,
  ...props
}: StaggerItemProps) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={cn(className)}
      variants={
        reduce
          ? {
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { duration: 0.15 } },
            }
          : {
              hidden: { opacity: 0, y: 12 },
              show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
            }
      }
      {...props}
    >
      {children}
    </motion.div>
  )
}

export type CountUpProps = {
  value: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
}

/**
 * Animates a number from 0 to `value`. Under reduced motion it renders the
 * final value instantly. Use `decimals` to keep fractional precision.
 */
export function CountUp({
  value,
  duration = 0.9,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}: CountUpProps) {
  const reduce = useReducedMotion()

  // Reduced motion: render the final value directly — no state, no effect.
  if (reduce) {
    return (
      <span className={className}>
        {prefix}
        {value.toFixed(decimals)}
        {suffix}
      </span>
    )
  }

  return (
    <CountUpAnimated
      value={value}
      duration={duration}
      decimals={decimals}
      prefix={prefix}
      suffix={suffix}
      className={className}
    />
  )
}

function CountUpAnimated({
  value,
  duration,
  decimals,
  prefix,
  suffix,
  className,
}: Required<Pick<CountUpProps, "value" | "duration" | "decimals" | "prefix" | "suffix">> & {
  className?: string
}) {
  const mv = useMotionValue(0)
  const [display, setDisplay] = React.useState(0)

  React.useEffect(() => {
    const controls = animate(mv, value, {
      duration,
      ease: EASE,
      onUpdate: (latest) => setDisplay(latest),
    })
    return () => controls.stop()
    // mv is a stable motion value reference.
  }, [value, duration, mv])

  return (
    <span className={className}>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  )
}
