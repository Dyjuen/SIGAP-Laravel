import React from 'react';
import { motion } from 'framer-motion';

/**
 * SpectacularBorder Component
 * Provides the "border drawing" animation effect using SVG pathLength.
 */
export default function SpectacularBorder({ active = false, children, className = '' }) {
    return (
        <motion.div
            className={`relative bg-white rounded-xl shadow-lg p-6 group ${className}`}
            initial={active ? { opacity: 0, y: 30, scale: 0.95 } : {}}
            animate={active ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            whileHover={{ y: -6, scale: 1.005, transition: { duration: 0.4 } }}
        >
            {/* SVG Border Drawing Effect */}
            <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden">
                <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <motion.rect
                        x="1" y="1" rx="11" ry="11"
                        width="calc(100% - 2px)"
                        height="calc(100% - 2px)"
                        fill="none"
                        stroke="#06b6d4" // Cyan-500
                        strokeWidth="2"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={active ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                </svg>

                {/* Glow/Gradient Overlay on border */}
                <div className={`absolute inset-0 rounded-xl border-2 border-cyan-400 opacity-0 transition-opacity duration-500 ${active ? 'opacity-0' : 'group-hover:opacity-100'}`}></div>
            </div>

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
}
