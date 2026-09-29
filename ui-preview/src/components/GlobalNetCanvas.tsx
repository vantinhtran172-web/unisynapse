"use client";

import { useEffect, useRef } from "react";

export default function GlobalNetCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let animationFrameId: number;

    interface Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      pulse: number;
    }

    let nodes: Node[] = [];
    // Start with default active coordinates so tether lines are immediately visible
    const mouse = {
      x: typeof window !== "undefined" ? window.innerWidth * 0.35 : 500,
      y: 280,
      active: true,
    };
    let scrollVelocity = 0;
    let lastScrollY = typeof window !== "undefined" ? window.scrollY : 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initNodes();
    };

    const initNodes = () => {
      nodes = [];
      const isMobile = width < 768;
      // Mobile optimization: 24-28 nodes for smooth 60fps & low battery drain; Desktop: 32-72 nodes
      const count = isMobile
        ? Math.min(26, Math.max(14, Math.floor((width * height) / 34000)))
        : Math.min(72, Math.max(32, Math.floor((width * height) / 24000)));

      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * (isMobile ? 0.25 : 0.35),
          vy: (Math.random() - 0.5) * (isMobile ? 0.25 : 0.35),
          r: Math.random() * 1.0 + (isMobile ? 1.0 : 1.2),
          pulse: Math.random() * Math.PI * 2,
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        mouse.active = true;
      }
    };

    const handleTouchEnd = () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const handleWheel = (e: WheelEvent) => {
      scrollVelocity = Math.max(-8, Math.min(8, e.deltaY * 0.08));
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;
      scrollVelocity = Math.max(-10, Math.min(10, delta * 0.12));
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    resize();

    const draw = () => {
      const isLight =
        document.documentElement.classList.contains("light") ||
        document.documentElement.getAttribute("data-theme") === "light";

      // Subtle, tasteful styling (toned down to 1/3 of previous exaggeration)
      const nodeFill = isLight ? "#3b82f6" : "#818cf8";
      const nodeHalo = isLight ? "rgba(59, 130, 246, 0.14)" : "rgba(129, 140, 248, 0.14)";
      const netLine = isLight ? "#6366f1" : "#818cf8";
      const netLineAlpha = isLight ? 0.13 : 0.11;
      const tetherLine = isLight ? "#2563eb" : "#38bdf8";
      const tetherAlpha = isLight ? 0.36 : 0.38;
      const tetherWidth = isLight ? 1.0 : 0.9;
      const nodeAlpha = isLight ? 0.38 : 0.42;

      ctx.clearRect(0, 0, width, height);

      // Dampen scroll velocity smoothly
      scrollVelocity *= 0.92;

      // 1. Update and draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy - scrollVelocity * 0.25;
        n.pulse += 0.02;

        if (n.x < -20) n.x = width + 20;
        else if (n.x > width + 20) n.x = -20;
        if (n.y < -20) n.y = height + 20;
        else if (n.y > height + 20) n.y = -20;

        const pr = n.r + Math.sin(n.pulse) * 0.45;

        // Subtle soft halo
        ctx.fillStyle = nodeHalo;
        ctx.beginPath();
        ctx.arc(n.x, n.y, pr + 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Small elegant node dot
        ctx.fillStyle = nodeFill;
        ctx.globalAlpha = nodeAlpha;
        ctx.beginPath();
        ctx.arc(n.x, n.y, pr, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // 2. Inter-node connecting lines (dist < 130px -> dist^2 < 16900)
      ctx.strokeStyle = netLine;
      ctx.lineWidth = 0.75;
      ctx.globalAlpha = netLineAlpha;
      ctx.beginPath();
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n.x - n2.x;
          const dy = n.y - n2.y;
          if (dx * dx + dy * dy < 16900) {
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(n2.x, n2.y);
          }
        }
      }
      ctx.stroke();
      ctx.globalAlpha = 1;

      // 3. Delicate mouse interactive tether lines (dist < 170px -> dist^2 < 28900)
      if (mouse.active && mouse.x > 0 && mouse.y > 0) {
        ctx.strokeStyle = tetherLine;
        ctx.lineWidth = tetherWidth;
        ctx.globalAlpha = tetherAlpha;
        ctx.beginPath();
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          const dx = n.x - mouse.x;
          const dy = n.y - mouse.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 28900) {
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(n.x, n.y);
          }
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="global-net-canvas"
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  );
}
