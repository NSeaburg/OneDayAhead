import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";

interface CircularProgressIndicatorProps {
  currentSteps: number;
  totalSteps: number;
  className?: string;
  size?: number;
  showCheckmark?: boolean;
}

export function CircularProgressIndicator({
  currentSteps,
  totalSteps,
  className,
  size = 80,
  showCheckmark = false,
}: CircularProgressIndicatorProps) {
  const [progress, setProgress] = useState(0);
  const [prevProgress, setPrevProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);

  // Calculate percentage
  useEffect(() => {
    // Store previous progress for animation
    setPrevProgress(progress);
    
    // Calculate new progress
    const newProgress = Math.min(100, Math.floor((currentSteps / totalSteps) * 100));
    setProgress(newProgress);
    
    // Set complete when reached 100%
    if (newProgress >= 100 && !isComplete) {
      setIsComplete(true);
      setShowCompletionAnimation(true);
    }
  }, [currentSteps, totalSteps]);

  // Get color based on progress
  const getColor = () => {
    if (progress >= 90) return "#10B981"; // Green
    if (progress >= 60) return "#F59E0B"; // Yellow
    return "#EF4444"; // Red
  };

  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Generate segments
  const generateSegments = () => {
    const segments = [];
    const segmentCount = totalSteps;
    
    for (let i = 0; i < segmentCount; i++) {
      const filled = i < currentSteps;
      const angle = (i / segmentCount) * 360;
      
      segments.push(
        <motion.div
          key={i}
          className={cn(
            "absolute w-2 h-2 rounded-full transform -translate-x-1/2 -translate-y-1/2",
            filled ? "bg-current" : "bg-gray-200"
          )}
          style={{
            top: "50%",
            left: "50%",
            color: getColor(),
            transform: `rotate(${angle}deg) translateY(-${radius}px) rotate(-${angle}deg)`,
          }}
          initial={{ scale: filled ? 0 : 1 }}
          animate={{ scale: filled ? 1 : 1 }}
          transition={{ duration: 0.2, delay: filled ? i * 0.1 : 0 }}
        />
      );
    }
    
    return segments;
  };

  return (
    <div className={cn("relative flex justify-center items-center mt-4", className)} style={{ height: size, width: size }}>
      {/* Background circle */}
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="4"
        />

        {/* Progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth="4"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </svg>

      {/* Segments around the circle */}
      {generateSegments()}

      {/* Completion animation and checkmark */}
      {isComplete && showCheckmark && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <CheckCircle className="text-green-500 h-12 w-12" />
        </motion.div>
      )}

      {/* Completion text */}
      {isComplete && (
        <motion.div
          className="absolute -bottom-8 whitespace-nowrap text-xs font-medium text-green-600"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          Assessment complete, ready to proceed!
        </motion.div>
      )}

      {/* Completion particles animation */}
      {showCompletionAnimation && (
        <>
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * 360;
            const distance = radius * 1.3;
            
            return (
              <motion.div
                key={`particle-${i}`}
                className="absolute w-1 h-4 bg-green-500 rounded-full"
                style={{
                  top: "50%",
                  left: "50%",
                  originX: "0",
                  originY: "0",
                }}
                initial={{
                  x: 0,
                  y: 0,
                  rotate: angle,
                  scale: 0,
                }}
                animate={{
                  x: 0,
                  y: 0,
                  rotate: angle,
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.03,
                  ease: "easeOut",
                }}
              />
            );
          })}
        </>
      )}
    </div>
  );
}