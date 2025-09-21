"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isClicking, setIsClicking] = useState(false);
  const [colorSplash, setColorSplash] = useState<{ x: number; y: number; id: number }[]>([]);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseDown = () => {
      setIsClicking(true);
      // Create color splash
      const newSplash = {
        x: mousePosition.x,
        y: mousePosition.y,
        id: Date.now(),
      };
      setColorSplash(prev => [...prev, newSplash]);
      
      // Remove splash after animation
      setTimeout(() => {
        setColorSplash(prev => prev.filter(splash => splash.id !== newSplash.id));
      }, 1000);
    };

    const handleMouseUp = () => {
      setIsClicking(false);
    };

    document.addEventListener("mousemove", updateMousePosition);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", updateMousePosition);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [mousePosition.x, mousePosition.y]);

  return (
    <>
      {/* Main cursor sphere */}
      <motion.div
        className="fixed top-0 left-0 w-6 h-6 bg-black rounded-full pointer-events-none z-[9999] border-2 border-white/20 shadow-lg"
        style={{
          x: mousePosition.x - 12,
          y: mousePosition.y - 12,
        }}
        animate={{
          scale: isClicking ? 1.8 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28,
        }}
      />

      {/* Color splash effects */}
      {colorSplash.map((splash) => (
        <motion.div
          key={splash.id}
          className="fixed top-0 left-0 pointer-events-none z-[9998]"
          style={{
            x: splash.x - 25,
            y: splash.y - 25,
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 opacity-60" />
        </motion.div>
      ))}

      {/* Trailing particles */}
      <motion.div
        className="fixed top-0 left-0 w-3 h-3 bg-white/30 rounded-full pointer-events-none z-[9997]"
        style={{
          x: mousePosition.x - 6,
          y: mousePosition.y - 6,
        }}
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 15,
        }}
      />
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-white/20 rounded-full pointer-events-none z-[9996]"
        style={{
          x: mousePosition.x - 4,
          y: mousePosition.y - 4,
        }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20,
        }}
      />
    </>
  );
}