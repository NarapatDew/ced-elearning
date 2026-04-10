import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

interface ProgressRingProps {
    percentage: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
    percentage,
    size = 120,
    strokeWidth = 8,
    color = '#10b981' // emerald-500 default
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    // Animated counting number
    const count = useMotionValue(0);
    const rounded = useTransform(count, Math.round);

    useEffect(() => {
        const animation = animate(count, percentage, { 
            duration: 1.5, 
            ease: "easeOut" 
        });
        return animation.stop;
    }, [percentage, count]);

    // Strip # for safe ID usage
    const safeColorId = color.replace('#', '');

    return (
        <div className="relative flex items-center justify-center p-2 group" style={{ width: size, height: size }}>
            {/* Ambient Background Glow matching the ring color */}
            <div 
                className="absolute inset-0 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"
                style={{ backgroundColor: color }}
            ></div>

            <svg width={size} height={size} className="transform -rotate-90 overflow-visible relative z-10">
                <defs>
                    <linearGradient id={`pulse-${safeColorId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={color} />
                        <stop offset="100%" stopColor={color} stopOpacity="0.4" />
                    </linearGradient>
                    <filter id={`glow-${safeColorId}`} x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="6" result="blur" />
                        <feBlend in="SourceGraphic" in2="blur" mode="screen" />
                    </filter>
                </defs>

                {/* Background Track Circle */}
                <circle
                    stroke="#f1f5f9" // slate-100
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                
                {/* Neon Glow Circle */}
                <motion.circle
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                    filter={`url(#glow-${safeColorId})`}
                    className="opacity-50"
                />

                {/* Main Solid Progress Circle */}
                <motion.circle
                    stroke={`url(#pulse-${safeColorId})`}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center relative z-20">
                <div className="flex items-baseline gap-0.5">
                    <motion.span className="text-3xl font-black tracking-tighter" style={{ color: color }}>
                        {rounded}
                    </motion.span>
                    <span className="text-lg font-bold opacity-75" style={{ color: color }}>%</span>
                </div>
            </div>
        </div>
    );
};

export default ProgressRing;
