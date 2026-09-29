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

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio, 2);
      canvas.width = bounds.width * pixelRatio;
      canvas.height = bounds.height * pixelRatio;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      const coating = context.createLinearGradient(0, 0, bounds.width, bounds.height);
      coating.addColorStop(0, "#8b8881");
      coating.addColorStop(0.48, "#383a39");
      coating.addColorStop(1, "#68645d");
      context.fillStyle = coating;
      context.fillRect(0, 0, bounds.width, bounds.height);

      context.globalAlpha = 0.18;
      context.strokeStyle = "#f7f3e8";
      context.lineWidth = 1;
      for (let index = -bounds.height; index < bounds.width + bounds.height; index += 7) {
        context.beginPath();
        context.moveTo(index, 0);
        context.lineTo(index - bounds.height * 0.35, bounds.height);
        context.stroke();
      }
      context.globalAlpha = 1;
    };

    const scratch = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      const radius = 28 + Math.random() * 16;

      context.save();
      context.globalCompositeOperation = "destination-out";
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
      context.restore();
    };

    resize();
    canvas.addEventListener("pointerdown", scratch);
    canvas.addEventListener("pointermove", scratch);
    window.addEventListener("resize", resize);
    return () => {
      canvas.removeEventListener("pointerdown", scratch);
      canvas.removeEventListener("pointermove", scratch);
      window.removeEventListener("resize", resize);
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
      <div className="scratch-book-light" aria-hidden="true" />
      <div className="scratch-book-orbit" aria-hidden="true" />
      <img
        className="scratch-book-cover"
        src={cover}
        alt="Capa do livro Tramas Ocultas: Vozes da Vida"
        width={1024}
        height={1536}
      />
      <canvas ref={coatingRef} className="scratch-book-coating" aria-hidden="true" />
      <div className="scratch-book-instruction" aria-hidden="true">
        <span /> Toque ou passe o olhar para revelar
      </div>
    </motion.div>
  );
}
