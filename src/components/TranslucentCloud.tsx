import React from 'react';
import { motion } from 'motion/react';

export const TranslucentCloud: React.FC = () => {
  return (
    <div
      id="translucent-cloud-container"
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
      aria-hidden="true"
    >
      {/* Ambient background orange glow */}
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.18, 0.28, 0.18],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute w-[500px] h-[320px] md:w-[720px] md:h-[440px] rounded-full bg-gradient-to-tr from-orange-600/20 via-amber-500/15 to-orange-400/10 blur-3xl"
      />

      {/* Main light, ethereal, semi-transparent cloud shape */}
      <motion.div
        animate={{
          y: [-8, 8, -8],
          x: [-4, 4, -4],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative w-[340px] h-[220px] sm:w-[520px] sm:h-[320px] md:w-[680px] md:h-[400px] opacity-25 filter blur-sm transition-all"
      >
        <svg
          viewBox="0 0 800 480"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_50px_rgba(249,115,22,0.25)]"
        >
          <defs>
            <radialGradient
              id="cloudGlow1"
              cx="45%"
              cy="45%"
              r="55%"
              fx="40%"
              fy="40%"
            >
              <stop offset="0%" stopColor="#ff7828" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#ea580c" stopOpacity="0.25" />
              <stop offset="85%" stopColor="#c2410c" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#0a1128" stopOpacity="0" />
            </radialGradient>
            <radialGradient
              id="cloudGlow2"
              cx="55%"
              cy="40%"
              r="50%"
            >
              <stop offset="0%" stopColor="#fed7aa" stopOpacity="0.3" />
              <stop offset="45%" stopColor="#f97316" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
            </radialGradient>
            <filter id="cloudSoftBlur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="16" />
            </filter>
          </defs>

          {/* Cloud silhouette constructed from multiple organic cloud puffs */}
          <g filter="url(#cloudSoftBlur)">
            {/* Center base lobe */}
            <ellipse cx="400" cy="270" rx="260" ry="120" fill="url(#cloudGlow1)" />
            {/* Top center dome */}
            <circle cx="390" cy="190" r="140" fill="url(#cloudGlow2)" />
            {/* Right upper dome */}
            <circle cx="530" cy="230" r="115" fill="url(#cloudGlow1)" />
            {/* Left upper dome */}
            <circle cx="270" cy="240" r="110" fill="url(#cloudGlow1)" />
            {/* Far left soft puff */}
            <circle cx="180" cy="290" r="85" fill="url(#cloudGlow2)" />
            {/* Far right soft puff */}
            <circle cx="620" cy="285" r="90" fill="url(#cloudGlow2)" />
            {/* Bottom flatter puff */}
            <ellipse cx="400" cy="320" rx="220" ry="60" fill="url(#cloudGlow1)" />
          </g>

          {/* Secondary delicate inner mist */}
          <ellipse
            cx="410"
            cy="240"
            rx="190"
            ry="90"
            fill="#ff9838"
            opacity="0.2"
            filter="url(#cloudSoftBlur)"
          />
        </svg>
      </motion.div>
    </div>
  );
};
