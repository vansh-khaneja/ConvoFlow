'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function WorkflowLoadingAnimation() {
  // Simple 3 nodes in a straight line
  const loadingNodes = [
    { id: 1, color: '#8b5cf6', delay: 0, name: 'Input' },      // Primary Purple
    { id: 2, color: '#a78bfa', delay: 0.2, name: 'Process' },  // Light Purple
    { id: 3, color: '#7c3aed', delay: 0.4, name: 'Output' },   // Deep Purple
  ];

  return (
    <div className="flex flex-col h-screen pt-16 items-center justify-center" style={{ background: '#0D0C14' }}>
      <div className="w-full max-w-4xl px-4">
        {/* Workflow Animation Container */}
        <div className="relative w-full h-[300px] flex items-center justify-center">
          {/* Three Nodes in a Straight Line */}
          <div className="relative flex items-center justify-center gap-48">
            {/* Dotted Line - positioned to pass through node centers */}
            <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
              {/* Dotted connecting line through centers */}
              <motion.line
                x1="10%"
                y1="41%"
                x2="90%"
                y2="41%"
                stroke="#8b5cf6"
                strokeWidth="2"
                strokeDasharray="8 8"
                strokeOpacity="0.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.5 }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />

              {/* Animated dot traveling along the line */}
              <motion.circle
                r="6"
                fill="#8b5cf6"
                initial={{ cx: "10%", cy: "41%", opacity: 0 }}
                animate={{
                  cx: ["10%", "50%", "90%"],
                  cy: "41%",
                  opacity: [0, 1, 1, 0]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                  ease: "easeInOut"
                }}
              />
            </svg>
            {loadingNodes.map((node) => (
              <motion.div
                key={node.id}
                className="flex flex-col items-center justify-center z-10"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1.15, 1],
                  opacity: 1,
                }}
                transition={{
                  delay: node.delay,
                  duration: 0.5,
                  ease: "easeOut"
                }}
              >
                {/* Node - Rounded pill shape */}
                <motion.div
                  className="relative w-24 h-16 rounded-full flex items-center justify-center"
                  style={{
                    background: '#18181b',
                    border: `1.5px solid ${node.color}`,
                    boxShadow: `0 2px 8px rgba(0, 0, 0, 0.4), 0 0 20px ${node.color}40`,
                  }}
                  animate={{
                    boxShadow: [
                      `0 2px 8px rgba(0, 0, 0, 0.4), 0 0 20px ${node.color}40`,
                      `0 4px 12px rgba(0, 0, 0, 0.5), 0 0 30px ${node.color}60`,
                      `0 2px 8px rgba(0, 0, 0, 0.4), 0 0 20px ${node.color}40`,
                    ]
                  }}
                  transition={{
                    delay: node.delay + 0.5,
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {/* Inner glow dot */}
                  <motion.div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: node.color }}
                    animate={{
                      scale: [1, 1.4, 1],
                      opacity: [0.9, 1, 0.9],
                    }}
                    transition={{
                      delay: node.delay + 0.5,
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />

                  {/* Pulse Ring */}
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      border: `2px solid ${node.color}`,
                    }}
                    animate={{
                      scale: [1, 1.6],
                      opacity: [0.5, 0],
                    }}
                    transition={{
                      delay: node.delay + 0.5,
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeOut"
                    }}
                  />
                </motion.div>

                {/* Node Label */}
                <motion.p
                  className="mt-2 text-xs"
                  style={{ color: '#a1a1aa' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: node.delay + 0.3 }}
                >
                  {node.name}
                </motion.p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Status Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <p className="text-sm" style={{ color: '#a1a1aa' }}>Building nodes ...</p>
        </motion.div>
      </div>
    </div>
  );
}

