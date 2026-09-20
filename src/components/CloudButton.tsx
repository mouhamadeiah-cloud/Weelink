import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';

interface CloudButtonProps {
  onClick: () => void;
}

export const CloudButton: React.FC<CloudButtonProps> = ({ onClick }) => {
  return (
    <motion.button
      id="build-page-cloud-btn"
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.96, y: 2 }}
      className="group relative cursor-pointer outline-none focus-visible:ring-4 focus-visible:ring-orange-500/50 rounded-full transition-transform duration-300 select-none"
      aria-label="ابن صفحتك مجانا - الانتقال إلى صفحة التسجيل"
    >
      {/* Outer ambient glow */}
      <div className="absolute -inset-3 bg-gradient-to-r from-orange-600/35 via-amber-600/40 to-orange-700/35 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Cloud Container */}
      <div className="relative w-[280px] h-[140px] sm:w-[330px] sm:h-[160px] md:w-[370px] md:h-[175px] flex items-center justify-center">
        {/* SVG Cloud Shape */}
        <svg
          viewBox="0 0 380 180"
          className="absolute inset-0 w-full h-full drop-shadow-[0_12px_28px_rgba(154,52,18,0.55)] transition-all duration-300 group-hover:drop-shadow-[0_16px_36px_rgba(234,88,12,0.7)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Rich dark orange gradient */}
            <linearGradient id="darkOrangeCloudGrad" x1="10%" y1="0%" x2="90%" y2="100%">
              <stop offset="0%" stopColor="#c2410c" />   {/* Deep rich orange */}
              <stop offset="40%" stopColor="#ea580c" />  {/* Vibrant dark orange */}
              <stop offset="75%" stopColor="#9a3412" />  {/* Dark burnt orange */}
              <stop offset="100%" stopColor="#7c2d12" /> {/* Very dark warm tone */}
            </linearGradient>

            {/* Inner highlight for 3D cloud pillowness */}
            <linearGradient id="cloudInnerHighlight" x1="30%" y1="0%" x2="70%" y2="100%">
              <stop offset="0%" stopColor="#ffedd5" stopOpacity="0.38" />
              <stop offset="40%" stopColor="#fdba74" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#9a3412" stopOpacity="0" />
            </linearGradient>

            {/* Subtle bottom shadow on cloud */}
            <linearGradient id="cloudBottomShadow" x1="50%" y1="60%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0" />
              <stop offset="100%" stopColor="#431407" stopOpacity="0.45" />
            </linearGradient>
          </defs>

          {/* Detailed Cloud Silhouette composed of puffy overlapping organic volumes */}
          <g>
            {/* Leftmost puff */}
            <circle cx="85" cy="110" r="50" fill="url(#darkOrangeCloudGrad)" />
            
            {/* Mid-left puff */}
            <circle cx="130" cy="80" r="56" fill="url(#darkOrangeCloudGrad)" />
            
            {/* Center top big crest */}
            <circle cx="195" cy="66" r="62" fill="url(#darkOrangeCloudGrad)" />
            
            {/* Mid-right crest */}
            <circle cx="260" cy="82" r="54" fill="url(#darkOrangeCloudGrad)" />
            
            {/* Rightmost puff */}
            <circle cx="300" cy="112" r="48" fill="url(#darkOrangeCloudGrad)" />
            
            {/* Lower fill base connecting all lobes seamlessly */}
            <rect x="75" y="90" width="230" height="48" rx="24" fill="url(#darkOrangeCloudGrad)" />
          </g>

          {/* Top highlight overlay to give the cloud a soft illuminated rim */}
          <g opacity="0.6">
            <ellipse cx="195" cy="52" rx="46" ry="18" fill="url(#cloudInnerHighlight)" />
            <ellipse cx="135" cy="62" rx="36" ry="14" fill="url(#cloudInnerHighlight)" />
            <ellipse cx="255" cy="65" rx="34" ry="13" fill="url(#cloudInnerHighlight)" />
          </g>

          {/* Base shadow depth */}
          <ellipse cx="190" cy="132" rx="115" ry="10" fill="url(#cloudBottomShadow)" />
        </svg>

        {/* Text Content */}
        <div className="relative z-10 flex items-center justify-center gap-2 px-6 pt-3 text-center">
          <span className="text-white font-bold text-lg sm:text-xl md:text-2xl tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] font-['Cairo',sans-serif]">
            ابنِ صفحتك مجاناً
          </span>
          <motion.div
            animate={{ x: [0, -3, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="text-orange-100 opacity-90 group-hover:text-white"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </motion.div>
        </div>
      </div>
    </motion.button>
  );
};
