'use client';

import React from "react"
import { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui-kit/button"
import { motion } from "framer-motion"
import { emptyStateIcon, emptyStateIconFloat } from "@/lib/animations"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  tips?: string[]
}

export function EmptyState({ icon: Icon, title, description, action, secondaryAction, tips }: EmptyStateProps) {
  const ActionIcon = action?.icon;

  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Animated Icon */}
      <motion.div
        className="rounded-full bg-[var(--muted)]/30 p-8 mb-6 relative"
        variants={emptyStateIcon}
        initial="initial"
        animate="animate"
      >
        <motion.div
          variants={emptyStateIconFloat}
          animate="animate"
        >
          <Icon className="h-12 w-12 text-[var(--text-muted)]" />
        </motion.div>
        
        {/* Decorative ring */}
        <div
          className="absolute inset-0 rounded-full border-2 border-[var(--primary)]/20"
          style={{ opacity: 0.5 }}
        />
      </motion.div>

      {/* Content */}
      <motion.h3 
        className="text-2xl font-semibold mb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        {title}
      </motion.h3>
      
      <motion.p 
        className="text-base text-[var(--text-muted)] mb-8 max-w-md leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        {description}
      </motion.p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <motion.div 
          className="flex items-center gap-3 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          {action && (
            <Button 
              onClick={action.onClick}
              size="lg"
              className="interactive-scale"
            >
              {ActionIcon && <ActionIcon className="h-4 w-4 mr-2" />}
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button 
              onClick={secondaryAction.onClick}
              variant="outline"
              size="lg"
              className="interactive-scale"
            >
              {secondaryAction.label}
            </Button>
          )}
        </motion.div>
      )}

      {/* Quick Tips */}
      {tips && tips.length > 0 && (
        <motion.div
          className="mt-6 max-w-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">
            Quick Tips
          </p>
          <div className="space-y-2">
            {tips.map((tip, index) => (
              <motion.div
                key={index}
                className="flex items-start gap-2 text-sm text-[var(--text-muted)] text-left"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
              >
                <span className="text-[var(--primary)] mt-0.5">•</span>
                <span>{tip}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

