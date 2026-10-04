import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";

import cover from "@/assets/book-cover.svg";

export function ImmersiveBookScene() {
  const coatingRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 90, damping: 16, mass: 0.45 });
  const springY = useSpring(rotateY, { stiffness: 90, damping: 16, mass: 0.45 });

  useEffect(() => {
    const canvas = coatingRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let drawing = false;
    let coatingDrawn = false;
    let lastWidth = 0;
    let lastHeight = 0;

    const fillCoating = (width: number, height: number) => {
      const coating = context.createLinearGradient(0, 0, width, height);
      coating.addColorStop(0, "#8b8881");
      coating.addColorStop(0.48, "#383a39");
      coating.addColorStop(1, "#68645d");
      context.globalCompositeOperation = "source-over";
      context.globalAlpha = 1;
      context.fillStyle = coating;
      context.fillRect(0, 0, width, height);

      context.globalAlpha = 0.18;
      context.strokeStyle = "#f7f3e8";
      context.lineWidth = 1;
      for (let index = -height; index < width + height; index += 7) {
        context.beginPath();
        context.moveTo(index, 0);
        context.lineTo(index - height * 0.35, height);
        context.stroke();
      }
      context.globalAlpha = 1;
      coatingDrawn = true;
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const nextWidth = Math.max(1, Math.floor(bounds.width * pixelRatio));
      const nextHeight = Math.max(1, Math.floor(bounds.height * pixelRatio));
      if (nextWidth === lastWidth && nextHeight === lastHeight) return;

      lastWidth = nextWidth;
      lastHeight = nextHeight;
      canvas.width = nextWidth;
      canvas.height = nextHeight;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      fillCoating(bounds.width, bounds.height);
    };

    const scratchAt = (clientX: number, clientY: number) => {
      const bounds = canvas.getBoundingClientRect();
      const x = clientX - bounds.left;
      const y = clientY - bounds.top;
      const radius = 28 + Math.random() * 16;
      context.save();
      context.globalCompositeOperation = "destination-out";
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
      context.restore();
    };

    const onPointerDown = (event: PointerEvent) => {
      drawing = true;
      canvas.setPointerCapture(event.pointerId);
      scratchAt(event.clientX, event.clientY);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!drawing && event.pointerType !== "mouse") return;
      scratchAt(event.clientX, event.clientY);
    };
    const onPointerUp = (event: PointerEvent) => {
      drawing = false;
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
    };

    resize();
    if (!coatingDrawn) {
      const bounds = canvas.getBoundingClientRect();
      fillCoating(bounds.width, bounds.height);
    }

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("pointerleave", onPointerUp);
    window.addEventListener("resize", resize);
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("pointerleave", onPointerUp);
      window.removeEventListener("resize", resize);
      observer.disconnect();
    };
  }, []);

  const onMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reduce || event.pointerType !== "mouse") return;
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * 16);
    rotateX.set((0.5 - py) * 10);
  };

  const onLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={stageRef}
      className="scratch-book"
      style={{
        rotateX: springX,
        rotateY: springY,
        transformPerspective: 1400,
        transformStyle: "preserve-3d",
      }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <div className="portal-frame" aria-hidden="true" />
      <div className="portal-depth" aria-hidden="true" />
      <div className="scratch-book-light" aria-hidden="true" />
      <div className="scratch-book-orbit" aria-hidden="true" />
      <img
        className="scratch-book-cover"
        src={cover}
        alt="Capa do livro Tramas Ocultas: Vozes da Vida"
        width={1024}
        height={1536}
        draggable={false}
      />
      <canvas ref={coatingRef} className="scratch-book-coating" aria-hidden="true" />
      <div className="scratch-book-instruction">
        <span /> Toque ou passe para revelar
      </div>
    </motion.div>
  );
}
