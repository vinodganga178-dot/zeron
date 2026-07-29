'use client';

import React, { useEffect, useRef } from 'react';

interface Packet {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  gridX: number;
  gridY: number;
  speed: number;
}

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const gridSpacing = 80;
    const packetCount = 35;
    const packets: Packet[] = [];

    // Helper to get nearest grid intersection coordinates
    const getGridPos = (gridVal: number) => gridVal * gridSpacing;

    const initPacket = (): Packet => {
      const cols = Math.floor(width / gridSpacing);
      const rows = Math.floor(height / gridSpacing);
      
      const gridX = Math.floor(Math.random() * cols);
      const gridY = Math.floor(Math.random() * rows);
      
      const x = getGridPos(gridX);
      const y = getGridPos(gridY);

      return {
        x,
        y,
        gridX,
        gridY,
        targetX: x,
        targetY: y,
        speed: Math.random() * 0.8 + 0.6 // Slow, premium constant speed
      };
    };

    // Populate packets
    for (let i = 0; i < packetCount; i++) {
      packets.push(initPacket());
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Grid Lines (Crisp hairline grid with no glow)
      ctx.strokeStyle = 'rgba(61, 58, 57, 0.18)'; // #3d3a39 at low opacity
      ctx.lineWidth = 1;

      // Vertical lines
      for (let x = 0; x < width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = 0; y < height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Draw and Update Data Packets
      for (let i = 0; i < packets.length; i++) {
        const p = packets[i];

        // If packet has reached target, set next target intersection
        if (Math.abs(p.x - p.targetX) < 1 && Math.abs(p.y - p.targetY) < 1) {
          p.x = p.targetX;
          p.y = p.targetY;

          // Pick random direction: 0 = Right, 1 = Left, 2 = Down, 3 = Up
          const dir = Math.floor(Math.random() * 4);
          let nextGridX = p.gridX;
          let nextGridY = p.gridY;

          const maxCols = Math.floor(width / gridSpacing);
          const maxRows = Math.floor(height / gridSpacing);

          if (dir === 0 && p.gridX < maxCols - 1) nextGridX++;
          else if (dir === 1 && p.gridX > 0) nextGridX--;
          else if (dir === 2 && p.gridY < maxRows - 1) nextGridY++;
          else if (dir === 3 && p.gridY > 0) nextGridY--;

          p.gridX = nextGridX;
          p.gridY = nextGridY;
          p.targetX = getGridPos(nextGridX);
          p.targetY = getGridPos(nextGridY);
        }

        // Move toward target
        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;
        
        if (Math.abs(dx) > 0) {
          p.x += Math.sign(dx) * p.speed;
        } else if (Math.abs(dy) > 0) {
          p.y += Math.sign(dy) * p.speed;
        }

        // Render data packet (Crisp green dot with absolutely no glow)
        ctx.fillStyle = 'rgba(0, 217, 146, 0.75)'; // Electric green
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-65"
    />
  );
}
