import React, { useEffect, useState } from "react";

export const CursorHighlight: React.FC = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [trailing, setTrailing] = useState({ x: -100, y: -100 });
  const [isVisible, setIsVisible] = useState(false);
  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    // Check if device has pointer (mouse)
    const hasPointer = window.matchMedia("(pointer: fine)").matches;
    if (!hasPointer) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "BUTTON" ||
          target.tagName === "A" ||
          target.tagName === "INPUT" ||
          target.tagName === "SELECT" ||
          target.tagName === "TEXTAREA" ||
          target.closest("button") ||
          target.closest("a") ||
          target.getAttribute("role") === "button" ||
          window.getComputedStyle(target).cursor === "pointer")
      ) {
        setIsPointer(true);
      } else {
        setIsPointer(false);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isVisible]);

  // Smooth trailing spring effect
  useEffect(() => {
    let animationFrameId: number;
    const follow = () => {
      setTrailing((prev) => ({
        x: prev.x + (position.x - prev.x) * 0.22,
        y: prev.y + (position.y - prev.y) * 0.22,
      }));
      animationFrameId = requestAnimationFrame(follow);
    };
    animationFrameId = requestAnimationFrame(follow);
    return () => cancelAnimationFrame(animationFrameId);
  }, [position]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* Outer ambient glow halo */}
      <div
        className="fixed -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-300 pointer-events-none"
        style={{
          left: `${trailing.x}px`,
          top: `${trailing.y}px`,
          width: isPointer ? "180px" : "120px",
          height: isPointer ? "180px" : "120px",
          background: isPointer
            ? "radial-gradient(circle, rgba(197, 155, 39, 0.18) 0%, rgba(11, 37, 89, 0.08) 50%, rgba(0, 0, 0, 0) 70%)"
            : "radial-gradient(circle, rgba(11, 37, 89, 0.12) 0%, rgba(197, 155, 39, 0.06) 50%, rgba(0, 0, 0, 0) 70%)",
          transition: "width 0.2s ease, height 0.2s ease",
        }}
      />

      {/* Sleek inner indicator ring */}
      <div
        className="fixed -translate-x-1/2 -translate-y-1/2 rounded-full border pointer-events-none transition-all duration-100"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: isPointer ? "28px" : "14px",
          height: isPointer ? "28px" : "14px",
          borderColor: isPointer ? "rgba(197, 155, 39, 0.85)" : "rgba(11, 37, 89, 0.45)",
          backgroundColor: isPointer ? "rgba(197, 155, 39, 0.12)" : "rgba(11, 37, 89, 0.08)",
          boxShadow: isPointer
            ? "0 0 12px rgba(197, 155, 39, 0.5)"
            : "0 0 6px rgba(11, 37, 89, 0.25)",
        }}
      />
    </div>
  );
};

export default CursorHighlight;
