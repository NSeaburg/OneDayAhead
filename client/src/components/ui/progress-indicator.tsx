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

  // Central dot
  const centralDot = (
    <motion.div
      className="absolute rounded-full bg-gray-300"
      style={{
        top: "50%",
        left: "50%",
        width: "6px",
        height: "6px",
        transform: "translate(-50%, -50%)",
      }}
    />
  );

  return (
    <div className="flex flex-col items-start">
      <div className={cn("relative flex justify-center items-center", className)} style={{ height: size, width: size }}>
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

        {/* Center dot */}
        {centralDot}

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
      
      {/* Text below the circle */}
      <div className="mt-2 text-xs text-gray-600 font-medium">
        {isComplete ? "Assessment complete, ready to proceed!" : "Gathering Assessment"}
      </div>
    </div>
  );
}