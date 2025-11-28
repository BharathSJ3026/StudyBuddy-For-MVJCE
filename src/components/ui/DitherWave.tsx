import React, { useEffect, useRef } from 'react';

interface DitherWaveProps {
  className?: string;
  color?: string;
  backgroundColor?: string;
}

const DitherWave: React.FC<DitherWaveProps> = ({ 
  className = "", 
  color = "#22c55e", // Green-500 default
  backgroundColor = "#020617" // Slate-950 default
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    handleResize();

    const gridSize = 30; // Increased distance between dots for better performance
    const dotSize = 2;   // Base size of dots
    const waveSpeed = 0.02;
    const waveFrequency = 0.05;
    const hoverRadius = 150; // Radius of the "covering" circle
    const hoverRadiusSq = hoverRadius * hoverRadius; // Pre-calculate squared radius

    const render = () => {
      time += waveSpeed;
      
      // Clear canvas
      ctx.fillStyle = backgroundColor;
      ctx.globalAlpha = 1.0; // Ensure opacity is reset for background
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set dot color once
      ctx.fillStyle = color;

      const cols = Math.ceil(canvas.width / gridSize);
      const rows = Math.ceil(canvas.height / gridSize);

      for (let i = 0; i < cols; i++) {
        const x = i * gridSize;
        // Optimization: Pre-calculate x-based sine component for this column
        const xSine = Math.sin(x * 0.005);
        // Optimization: Pre-calculate x distance to mouse
        const dx = x - mouseRef.current.x;
        const dxSq = dx * dx;

        for (let j = 0; j < rows; j++) {
          const y = j * gridSize;

          // Calculate wave effect
          // Create a top-to-bottom wave pattern (like paint flowing)
          // Use pre-calculated xSine
          const waveOffset = Math.sin((y * 0.01) + xSine - time) * 0.5 + 0.5;
          
          // Calculate distance to mouse
          // Optimization: Use squared distance check first to avoid expensive Sqrt
          const dy = y - mouseRef.current.y;
          const distSq = dxSq + (dy * dy);
          
          // "Circle covers the dithers" effect
          let hoverFactor = 1;
          
          // Only calculate exact distance if within rough range
          if (distSq < hoverRadiusSq) {
            const distance = Math.sqrt(distSq);
            // Smooth transition at the edge of the circle
            hoverFactor = Math.max(0, (distance - (hoverRadius - 50)) / 50);
          }

          // Final size calculation
          const size = dotSize * (1 + waveOffset) * hoverFactor;

          if (size > 0.1) {
            // Optional: Vary opacity based on wave
            // This is the most expensive part (state change), but needed for the effect
            ctx.globalAlpha = 0.3 + (waveOffset * 0.4);
            
            // Optimization: Use fillRect instead of beginPath/rect/fill
            ctx.fillRect(x - size / 2, y - size / 2, size, size);
          }
        }
      }
      
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [color, backgroundColor]);

  return (
    <canvas 
      ref={canvasRef} 
      className={`fixed inset-0 z-0 pointer-events-none ${className}`}
    />
  );
};

export default DitherWave;
